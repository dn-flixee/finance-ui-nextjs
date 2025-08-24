// src/app/api/v1/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const currentMonth = new Date()
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const [
      accounts,
      totalIncome,
      totalExpenses,
      monthlyIncome,
      monthlyExpenses,
      incomeSourcesCount,
      expenseSourcesCount
    ] = await Promise.all([
      prisma.financeAccount.findMany({
        where: { userId },
        select: { balance: true }
      }),
      prisma.income.aggregate({
        where: { userId },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { userId },
        _sum: { amount: true }
      }),
      prisma.income.aggregate({
        where: { 
          userId,
          date: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { 
          userId,
          date: {
            gte: firstDayOfMonth,
            lte: lastDayOfMonth
          }
        },
        _sum: { amount: true }
      }),
      prisma.incomeSource.count({
        where: { userId }
      }),
      prisma.expenseSource.count({
        where: { userId }
      })
    ])

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

    const stats = {
      totalIncome: totalIncome._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      totalBalance,
      accountsCount: accounts.length,
      monthlyIncome: monthlyIncome._sum.amount || 0,
      monthlyExpenses: monthlyExpenses._sum.amount || 0,
      incomeSourcesCount,
      expenseSourcesCount
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
