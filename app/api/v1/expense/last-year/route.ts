import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const lastYear = new Date()
    lastYear.setFullYear(lastYear.getFullYear() - 1)
    
    const expenses = await prisma.expense.findMany({
      where: {
        date: {
          gte: lastYear
        }
      },
      include: {
        expenseSource: true
      }
    })

    // Group by month and expense source name
    const groupedData: { [month: string]: { [sourceName: string]: number } } = {}
    
    expenses.forEach(expense => {
      const monthYear = expense.date.toLocaleDateString('en-US', { 
        month: 'long', 
        year: 'numeric' 
      })
      
      if (!groupedData[monthYear]) {
        groupedData[monthYear] = {}
      }
      
      const sourceName = expense.expenseSource.name
      if (!groupedData[monthYear][sourceName]) {
        groupedData[monthYear][sourceName] = 0
      }
      
      groupedData[monthYear][sourceName] += expense.amount
    })

    // Transform to expected format: { month: [{ name, value }] }
    const result: { [month: string]: Array<{ name: string; value: number }> } = {}
    
    Object.keys(groupedData).forEach(month => {
      result[month] = Object.keys(groupedData[month]).map(sourceName => ({
        name: sourceName,
        value: groupedData[month][sourceName]
      }))
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching last year expenses:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}