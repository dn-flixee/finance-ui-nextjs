// src/app/api/v1/statements/upload/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IndianBankParser } from '@/lib/parsers/indian-banks'
import { LocalLLMService } from '@/lib/integrations/local-llm'
import { TransactionSource } from '@/lib/types'

interface ParsedStatementRow {
  date: Date
  description: string
  amount: number
  type: 'EXPENSE' | 'INCOME'
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim().replace(/^["']|["']$/g, ''))
      current = ''
    } else {
      current += char
    }
  }
  result.push(current.trim().replace(/^["']|["']$/g, ''))
  return result
}

function parseCSVStatement(content: string): ParsedStatementRow[] {
  const lines = content.split(/\r?\n/).filter(l => l.trim().length > 0)
  if (lines.length < 2) return []

  const headerLine = lines[0].toLowerCase()
  const headers = parseCSVLine(headerLine)

  // Find column indices
  const dateIdx = headers.findIndex(h => h.includes('date') || h.includes('txn date') || h.includes('value date'))
  const descIdx = headers.findIndex(h => h.includes('description') || h.includes('narration') || h.includes('particulars') || h.includes('remark'))
  const debitIdx = headers.findIndex(h => h.includes('debit') || h.includes('withdrawal') || h.includes('dr'))
  const creditIdx = headers.findIndex(h => h.includes('credit') || h.includes('deposit') || h.includes('cr'))
  const amountIdx = headers.findIndex(h => h.includes('amount'))

  const rows: ParsedStatementRow[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i]
    const cols = parseCSVLine(line)
    if (cols.length < 2) continue

    const dateStr = dateIdx >= 0 ? cols[dateIdx] : cols[0]
    const parsedDate = new Date(dateStr)
    const validDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate

    const description = descIdx >= 0 ? cols[descIdx] : cols[1] || 'Bank Transaction'

    let debitAmount = 0
    let creditAmount = 0

    if (debitIdx >= 0 && cols[debitIdx]) {
      debitAmount = parseFloat(cols[debitIdx].replace(/,/g, '')) || 0
    }
    if (creditIdx >= 0 && cols[creditIdx]) {
      creditAmount = parseFloat(cols[creditIdx].replace(/,/g, '')) || 0
    }

    if (debitAmount === 0 && creditAmount === 0 && amountIdx >= 0 && cols[amountIdx]) {
      const raw = parseFloat(cols[amountIdx].replace(/,/g, '')) || 0
      if (raw < 0) {
        debitAmount = Math.abs(raw)
      } else {
        creditAmount = raw
      }
    }

    if (debitAmount > 0) {
      rows.push({
        date: validDate,
        description,
        amount: debitAmount,
        type: 'EXPENSE'
      })
    } else if (creditAmount > 0) {
      rows.push({
        date: validDate,
        description,
        amount: creditAmount,
        type: 'INCOME'
      })
    }
  }

  return rows
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const accountId = formData.get('accountId') as string | null

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 })
    }

    // Verify account belongs to user or pick default
    let targetAccountId = accountId
    if (!targetAccountId) {
      const defaultAccount = await prisma.financeAccount.findFirst({
        where: { userId: session.user.id }
      })
      if (!defaultAccount) {
        return NextResponse.json({ error: 'No bank account found. Please create an account first.' }, { status: 400 })
      }
      targetAccountId = defaultAccount.accountId
    }

    const fileContent = await file.text()
    let parsedRows: ParsedStatementRow[] = []

    // 1. Try CSV Parsing first
    if (file.name.endsWith('.csv') || fileContent.includes(',')) {
      parsedRows = parseCSVStatement(fileContent)
    }

    // 2. If CSV yielded nothing, try deterministic regex alert parsing line by line
    if (parsedRows.length === 0) {
      const lines = fileContent.split(/\r?\n/)
      for (const line of lines) {
        const alert = IndianBankParser.parse(line)
        if (alert) {
          parsedRows.push({
            date: alert.date,
            description: alert.merchant,
            amount: alert.amount,
            type: alert.type
          })
        }
      }
    }

    // 3. Fallback: If still empty and file is unstructured text, use Local LLM
    if (parsedRows.length === 0 && fileContent.trim().length > 20) {
      try {
        const localLLM = new LocalLLMService()
        const isHealthy = await localLLM.healthCheck()
        if (isHealthy) {
          const sample = fileContent.slice(0, 3000)
          const llmResult = await localLLM.parseTransactionEmail(sample, 'Bank Statement Upload')
          if (llmResult?.amount) {
            parsedRows.push({
              date: new Date(llmResult.date || Date.now()),
              description: llmResult.merchant || 'Parsed Statement Transaction',
              amount: llmResult.amount,
              type: llmResult.type === 'INCOME' ? 'INCOME' : 'EXPENSE'
            })
          }
        }
      } catch (err) {
        console.warn('Local LLM fallback could not parse statement text:', err)
      }
    }

    if (parsedRows.length === 0) {
      return NextResponse.json(
        { error: 'Could not extract valid transactions from this file. Ensure it is a valid CSV statement or contains Indian bank alerts.' },
        { status: 422 }
      )
    }

    // Insert extracted transactions
    const createdExpenses = []
    const createdIncomes = []

    for (const row of parsedRows) {
      if (row.type === 'EXPENSE') {
        const expense = await prisma.expense.create({
          data: {
            name: row.description,
            amount: row.amount,
            date: row.date,
            accountId: targetAccountId,
            userId: session.user.id,
            sourceType: TransactionSource.STATEMENT_PARSED
          }
        })
        createdExpenses.push(expense)
      } else {
        const income = await prisma.income.create({
          data: {
            name: row.description,
            amount: row.amount,
            date: row.date,
            accountId: targetAccountId,
            userId: session.user.id,
            sourceType: TransactionSource.STATEMENT_PARSED
          }
        })
        createdIncomes.push(income)
      }
    }

    return NextResponse.json({
      success: true,
      totalParsed: parsedRows.length,
      expensesCreated: createdExpenses.length,
      incomesCreated: createdIncomes.length,
      rows: parsedRows
    })
  } catch (error: any) {
    console.error('Statement upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to process statement file' },
      { status: 500 }
    )
  }
}
