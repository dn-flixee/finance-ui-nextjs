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
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const [
      accounts,
      totalIncome,
      totalExpenses,
      monthlyIncome,
      monthlyExpenses,
      incomeSourcesCount,
      expenseSourcesCount,
      recentTransactions
    ] = await Promise.all([
      prisma.financeAccount.findMany({
        where: { userId },
        select: { balance: true, accountType: true }
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
      }),
      // Get recent transactions from all types
      Promise.all([
        prisma.income.findMany({
          where: { userId },
          include: { account: true },
          orderBy: { createdAt: 'desc' },
          take: 3
        }),
        prisma.expense.findMany({
          where: { userId },
          include: { account: true },
          orderBy: { createdAt: 'desc' },
          take: 3
        }),
        prisma.transfer.findMany({
          where: { userId },
          include: { fromAccount: true, toAccount: true },
          orderBy: { createdAt: 'desc' },
          take: 3
        })
      ])
    ])

    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

    // Combine and sort recent transactions
    const [recentIncomes, recentExpenses, recentTransfers] = recentTransactions
    const allRecentTransactions = [
      ...recentIncomes.map(t => ({ ...t, type: 'income' })),
      ...recentExpenses.map(t => ({ ...t, type: 'expense' })),
      ...recentTransfers.map(t => ({ ...t, type: 'transfer' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

    const stats = {
      totalIncome: totalIncome._sum.amount || 0,
      totalExpenses: totalExpenses._sum.amount || 0,
      totalBalance,
      accountsCount: accounts.length,
      monthlyIncome: monthlyIncome._sum.amount || 0,
      monthlyExpenses: monthlyExpenses._sum.amount || 0,
      incomeSourcesCount,
      expenseSourcesCount,
      recentTransactions: allRecentTransactions
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
