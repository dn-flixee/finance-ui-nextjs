// src/app/api/v1/expenses/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { transformExpense } from '@/lib/transformers'
import { z } from 'zod'
import { TransactionSource } from '@/lib/types'
import { CategorizationService } from '@/services/categorization.service'
import { ReconciliationService } from '@/services/reconciliation.service'
import { SplitwiseService } from '@/lib/integrations/splitwise'

const expenseSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  date: z.string().datetime().or(z.date()).or(z.string()),
  accountId: z.string().min(1),
  expenseSourceId: z.string().min(1).optional(),
  iconUrl: z.string().url().optional(),
  sourceType: z.nativeEnum(TransactionSource).optional(),
  sourceId: z.string().optional(),
  splitwiseExpenseId: z.string().optional(),
  isSplitwiseLinked: z.boolean().optional(),
  splitwise: z.object({
    enabled: z.boolean(),
    splitType: z.enum(['group', 'friends']),
    groupId: z.string().optional(),
    groupName: z.string().optional(),
    friendIds: z.array(z.string()).optional(),
    splitEqually: z.boolean().optional(),
    userShare: z.number().optional(),
    friendShares: z.record(z.string(), z.number()).optional()
  }).optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const accountId = searchParams.get('accountId')
    const sourceType = searchParams.get('sourceType') as TransactionSource
    const recent = searchParams.get('recent') === 'true'

    const where = {
      userId: session.user.id,
      ...(accountId && { accountId }),
      ...(sourceType && { sourceType })
    }

    const expenses = await prisma.expense.findMany({
      where,
      include: {
        account: true,
        expenseSource: true
      },
      orderBy: recent ? { createdAt: 'desc' } : { date: 'desc' },
      ...(recent ? { take: limit } : {
        skip: (page - 1) * limit,
        take: limit
      })
    })

    const total = recent ? expenses.length : await prisma.expense.count({ where })
    
    if (recent) {
      return NextResponse.json({ expenses: expenses.map(transformExpense) })
    }

    return NextResponse.json({
      expenses: expenses.map(transformExpense),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching expenses:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = expenseSchema.parse(body)
    
    // Evaluate smart rules (auto-categorization, ignore rules, and Splitwise candidate matching)
    const categorizationService = new CategorizationService()
    const evaluation = await categorizationService.evaluateTransaction(
      validatedData.name,
      validatedData.amount,
      new Date(validatedData.date),
      session.user.id
    )

    const isIgnored = evaluation.isIgnored || false
    const expenseSourceId = validatedData.expenseSourceId || evaluation.expenseSourceId || null

    // If Splitwise split is requested, create expense in Splitwise first
    let splitwiseCreatedExpense: any = null
    if (validatedData.splitwise?.enabled) {
      try {
        const splitwiseService = new SplitwiseService()
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { splitwiseToken: true, splitwiseUserId: true }
        })

        if (!user?.splitwiseToken) {
          return NextResponse.json({
            error: 'Splitwise is not connected. Please connect Splitwise in your settings first.'
          }, { status: 400 })
        }

        const swConfig = validatedData.splitwise
        const totalAmount = validatedData.amount

        if (swConfig.splitType === 'group' && swConfig.groupId) {
          // Group split
          const splitResult = await splitwiseService.createExpense(session.user.id, {
            cost: totalAmount,
            description: validatedData.name,
            date: new Date(validatedData.date),
            groupId: swConfig.groupId,
            splitEqually: swConfig.splitEqually ?? true
          })
          splitwiseCreatedExpense = splitResult.splitwiseExpense
        } else if (swConfig.splitType === 'friends' && swConfig.friendIds && swConfig.friendIds.length > 0) {
          // Friends split
          const currentSwUserId = user.splitwiseUserId || (await splitwiseService.getCurrentUser(session.user.id))?.id?.toString()
          if (!currentSwUserId) {
            throw new Error('Could not identify Splitwise user ID.')
          }

          let usersPayload: Array<{
            userId: string
            paidShare: number
            owedShare: number
          }> = []

          if (swConfig.splitEqually ?? true) {
            // Split equally among user + friends
            const totalPeople = 1 + swConfig.friendIds.length
            const totalCents = Math.round(totalAmount * 100)
            const baseCents = Math.floor(totalCents / totalPeople)
            const remainderCents = totalCents - (baseCents * totalPeople)

            const userOwed = (baseCents + remainderCents) / 100
            const friendOwed = baseCents / 100

            usersPayload = [
              {
                userId: currentSwUserId,
                paidShare: totalAmount,
                owedShare: userOwed
              },
              ...swConfig.friendIds.map(fId => ({
                userId: fId,
                paidShare: 0,
                owedShare: friendOwed
              }))
            ]
          } else {
            // Custom shares
            const userOwed = swConfig.userShare ?? totalAmount
            usersPayload = [
              {
                userId: currentSwUserId,
                paidShare: totalAmount,
                owedShare: userOwed
              },
              ...swConfig.friendIds.map(fId => ({
                userId: fId,
                paidShare: 0,
                owedShare: swConfig.friendShares?.[fId] ?? 0
              }))
            ]
          }

          const splitResult = await splitwiseService.createExpense(session.user.id, {
            cost: totalAmount,
            description: validatedData.name,
            date: new Date(validatedData.date),
            groupId: 0,
            splitEqually: false,
            users: usersPayload
          })
          splitwiseCreatedExpense = splitResult.splitwiseExpense
        }
      } catch (err: any) {
        console.error('Failed to create Splitwise expense:', err)
        return NextResponse.json({
          error: `Failed to split on Splitwise: ${err.message || 'Unknown Splitwise error'}`
        }, { status: 400 })
      }
    }

    const expense = await prisma.expense.create({
      data: {
        name: validatedData.name,
        amount: validatedData.amount,
        date: new Date(validatedData.date),
        accountId: validatedData.accountId,
        expenseSourceId,
        userId: session.user.id,
        iconUrl: validatedData.iconUrl || null,
        sourceType: splitwiseCreatedExpense ? TransactionSource.SPLITWISE : (validatedData.sourceType || TransactionSource.MANUAL),
        sourceId: validatedData.sourceId || null,
        splitwiseExpenseId: splitwiseCreatedExpense?.splitwiseId || validatedData.splitwiseExpenseId || null,
        isSplitwiseLinked: !!splitwiseCreatedExpense || validatedData.isSplitwiseLinked || false,
        isIgnored
      },
      include: {
        account: true,
        expenseSource: true
      }
    })
    
    // Auto-reconcile if newly created on Splitwise OR matching Splitwise expense found
    let reconciledExpense = expense
    if (splitwiseCreatedExpense) {
      try {
        const reconService = new ReconciliationService()
        const reconResult = await reconService.reconcileExpense(
          expense.expenseId,
          splitwiseCreatedExpense.splitwiseId,
          session.user.id
        )
        reconciledExpense = reconResult.expense as any
      } catch (err) {
        console.warn('Auto-reconciliation on expense creation failed:', err)
      }
    } else if (evaluation.splitwiseCandidate) {
      try {
        const reconService = new ReconciliationService()
        const reconResult = await reconService.reconcileExpense(
          expense.expenseId,
          evaluation.splitwiseCandidate.splitwiseId,
          session.user.id
        )
        reconciledExpense = reconResult.expense as any
      } catch (err) {
        console.warn('Auto-reconciliation on expense creation failed:', err)
      }
    }
    
    const transformed = transformExpense(reconciledExpense)
    return NextResponse.json({
      ...transformed,
      splitwiseCandidate: evaluation.splitwiseCandidate || null
    }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('Error creating expense:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { expenseId, ...updateData } = body
    
    if (!expenseId) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 })
    }

    const updateSchema = expenseSchema.partial()
    const validatedData = updateSchema.parse(updateData)
    
    const existingExpense = await prisma.expense.findFirst({
      where: {
        expenseId,
        userId: session.user.id
      }
    })
    
    if (!existingExpense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }
    
    const expense = await prisma.expense.update({
      where: { expenseId },
      data: {
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        updatedAt: new Date()
      },
      include: {
        account: true,
        expenseSource: true
      }
    })
    
    return NextResponse.json(transformExpense(expense))
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 })
    }
    
    console.error('Error updating expense:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const expenseId = searchParams.get('expenseId')
    
    if (!expenseId) {
      return NextResponse.json({ error: 'Expense ID is required' }, { status: 400 })
    }

    const expense = await prisma.expense.findFirst({
      where: {
        expenseId,
        userId: session.user.id
      }
    })
    
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 })
    }
    
    await prisma.expense.delete({
      where: { expenseId }
    })
    
    return NextResponse.json({ message: 'Expense deleted successfully' })
  } catch (error) {
    console.error('Error deleting expense:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
