// src/app/api/v1/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { IOUStatus } from '@/lib/types'
import { SplitwiseService } from '@/lib/integrations/splitwise'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    const currentDate = new Date()
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

    const [
      accounts,
      incomeSourcesCount,
      expenseSourcesCount,
      monthlyExpensesList,
      monthlyIncomesList,
      pendingIOUsList,
      recentTransactions
    ] = await Promise.all([
      prisma.financeAccount.findMany({
        where: { userId },
        select: { balance: true, accountType: true }
      }),
      prisma.incomeSource.count({ where: { userId } }),
      prisma.expenseSource.count({ where: { userId } }),
      // Fetch monthly expenses respecting reconciliation and ignore flags
      prisma.expense.findMany({
        where: {
          userId,
          date: { gte: firstDayOfMonth, lte: lastDayOfMonth },
          isIgnored: false
        },
        select: {
          amount: true,
          userShare: true,
          isReconciled: true
        }
      }),
      // Fetch monthly incomes excluding settlements and ignored
      prisma.income.findMany({
        where: {
          userId,
          date: { gte: firstDayOfMonth, lte: lastDayOfMonth },
          isSettlement: false,
          isIgnored: false
        },
        select: { amount: true }
      }),
      // Fetch open pending IOUs
      prisma.pendingIOU.findMany({
        where: {
          userId,
          status: { in: [IOUStatus.PENDING, IOUStatus.PARTIALLY_SETTLED] }
        },
        include: {
          expense: {
            select: { name: true, date: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      // Recent transactions
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

    // Calculate actual monthly expenses (if reconciled, use userShare; else amount)
    const calculatedMonthlyExpenses = monthlyExpensesList.reduce((sum, exp) => {
      const effectiveAmount = exp.isReconciled && exp.userShare !== null ? exp.userShare : exp.amount
      return sum + effectiveAmount
    }, 0)

    // Calculate actual monthly income (excluding IOU settlements)
    const calculatedMonthlyIncome = monthlyIncomesList.reduce((sum, inc) => sum + inc.amount, 0)

    // Bank balances sum
    const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0)

    // Pending IOUs owed to user (Asset)
    const pendingIOUsTotal = pendingIOUsList.reduce((sum, iou) => sum + (iou.amount - iou.settledAmount), 0)

    // Splitwise Debts (owed by user)
    let debtsOwedTotal = 0
    try {
      const swService = new SplitwiseService()
      const swBalances = await swService.getNetBalances(userId)
      debtsOwedTotal = swBalances.totalDebtsOwedByUser || 0
    } catch {
      // Splitwise may not be connected or token expired
      debtsOwedTotal = 0
    }

    // True Balance = Total Bank Balance + Pending IOUs - Splitwise Debts
    const trueBalance = totalBalance + pendingIOUsTotal - debtsOwedTotal

    // Combine and sort recent transactions
    const [recentIncomes, recentExpenses, recentTransfers] = recentTransactions
    const allRecentTransactions = [
      ...recentIncomes.map(t => ({ ...t, type: 'income' })),
      ...recentExpenses.map(t => ({ ...t, type: 'expense' })),
      ...recentTransfers.map(t => ({ ...t, type: 'transfer' }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

    const stats = {
      totalIncome: calculatedMonthlyIncome,
      totalExpenses: calculatedMonthlyExpenses,
      totalBalance,
      trueBalance,
      pendingIOUsTotal,
      debtsOwedTotal,
      pendingIOUsList: pendingIOUsList.slice(0, 5),
      accountsCount: accounts.length,
      monthlyIncome: calculatedMonthlyIncome,
      monthlyExpenses: calculatedMonthlyExpenses,
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
