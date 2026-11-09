// src/services/reconciliation.service.ts
import { prisma } from '@/lib/prisma'
import { IOUStatus, TransactionSource } from '@/lib/types'

export interface MatchCandidate {
  splitwiseExpense: any
  confidence: number
  reasons: string[]
}

export class ReconciliationService {
  /**
   * Find candidate Splitwise expenses that match a bank expense.
   * Matching criteria:
   * 1. Bill amount match (exact or within ₹1.00)
   * 2. Transaction date within ±2 days of Splitwise date
   * 3. Description keyword overlap (e.g. "Social", "Zomato", "Swiggy")
   */
  async findCandidatesForExpense(expenseId: string, userId: string): Promise<MatchCandidate[]> {
    const expense = await prisma.expense.findFirst({
      where: { expenseId, userId }
    })

    if (!expense) throw new Error('Expense not found')

    const expenseDate = new Date(expense.date)
    const startDate = new Date(expenseDate)
    startDate.setDate(startDate.getDate() - 3)
    const endDate = new Date(expenseDate)
    endDate.setDate(endDate.getDate() + 3)

    // Find candidate splitwise expenses
    const candidates = await prisma.splitwiseExpense.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate
        },
        // Either not linked, or linked to this exact expense
        OR: [
          { isLinked: false },
          { linkedExpenseId: expenseId }
        ]
      }
    })

    const results: MatchCandidate[] = []

    for (const sw of candidates) {
      let score = 0
      const reasons: string[] = []

      // 1. Amount matching (Total amount or Paid amount)
      const diff = Math.abs(sw.totalAmount - expense.amount)
      if (diff < 0.05) {
        score += 50
        reasons.push('Exact bill amount match')
      } else if (diff <= 2) {
        score += 35
        reasons.push('Approximate bill amount match')
      }

      // 2. Date matching
      const dayDiff = Math.abs(
        (new Date(sw.date).getTime() - expenseDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (dayDiff < 0.5) {
        score += 30
        reasons.push('Exact date match')
      } else if (dayDiff <= 1.5) {
        score += 20
        reasons.push('Date within 1 day')
      } else if (dayDiff <= 3) {
        score += 10
        reasons.push('Date within 3 days')
      }

      // 3. Description token overlap
      const expenseTokens = expense.name.toLowerCase().split(/\W+/).filter(t => t.length > 2)
      const swTokens = sw.description.toLowerCase().split(/\W+/).filter(t => t.length > 2)
      const sharedTokens = expenseTokens.filter(t => swTokens.includes(t))

      if (sharedTokens.length > 0) {
        score += 20
        reasons.push(`Merchant/Keyword match: "${sharedTokens.join(', ')}"`)
      }

      if (score >= 40) {
        results.push({
          splitwiseExpense: sw,
          confidence: Math.min(score, 100) / 100,
          reasons
        })
      }
    }

    return results.sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * The Split Logic:
   * Takes a fronted bank debit (e.g. ₹2,000 at "Social Pune")
   * Splits it into:
   * 1. Actual Expense: user's share (e.g. ₹500) -> hits the budget
   * 2. Pending IOU (Asset): ₹1,500 -> tracks money owed to user in pending_ious table
   */
  async reconcileExpense(expenseId: string, splitwiseId: string, userId: string) {
    const expense = await prisma.expense.findFirst({
      where: { expenseId, userId }
    })
    if (!expense) throw new Error('Expense not found')

    const splitwiseExpense = await prisma.splitwiseExpense.findFirst({
      where: { splitwiseId, userId }
    })
    if (!splitwiseExpense) throw new Error('Splitwise expense not found')

    const userShare = splitwiseExpense.userShare
    const totalAmount = splitwiseExpense.totalAmount
    const iouAmount = Math.max(0, totalAmount - userShare)

    // Execute in a single atomic transaction
    return await prisma.$transaction(async (tx) => {
      // 1. Update the Expense record with split details
      const updatedExpense = await tx.expense.update({
        where: { expenseId },
        data: {
          splitwiseExpenseId: splitwiseId,
          isSplitwiseLinked: true,
          splitwiseUserShare: userShare,
          splitwiseTotalAmount: totalAmount,
          userShare: userShare,
          iouAmount: iouAmount,
          isReconciled: true,
          sourceType: TransactionSource.SPLITWISE
        }
      })

      // 2. Mark SplitwiseExpense as linked
      await tx.splitwiseExpense.update({
        where: { splitwiseId },
        data: {
          linkedExpenseId: expenseId,
          isLinked: true
        }
      })

      // 3. Remove any previous un-settled IOUs for this expense to prevent duplicates
      await tx.pendingIOU.deleteMany({
        where: {
          expenseId,
          userId,
          status: IOUStatus.PENDING,
          settledAmount: 0
        }
      })

      // 4. Create PendingIOU records for participants who owe money
      const participants = (splitwiseExpense.participants as any[]) || []
      const user = await tx.user.findUnique({
        where: { id: userId },
        select: { splitwiseUserId: true }
      })

      const createdIOUs = []

      for (const p of participants) {
        const participantUserId = (p.user_id || p.user?.id)?.toString()
        // Skip current user's own share
        if (user?.splitwiseUserId && participantUserId === user.splitwiseUserId) {
          continue
        }

        const owedShare = parseFloat(p.owed_share || '0')
        if (owedShare > 0) {
          const firstName = p.user?.first_name || p.first_name || ''
          const lastName = p.user?.last_name || p.last_name || ''
          const friendName = `${firstName} ${lastName}`.trim() || 'Friend'
          const iou = await tx.pendingIOU.create({
            data: {
              userId,
              expenseId,
              splitwiseExpenseId: splitwiseId,
              friendName,
              friendSplitwiseId: participantUserId,
              amount: owedShare,
              settledAmount: 0,
              status: IOUStatus.PENDING,
              notes: `Split for ${splitwiseExpense.description}`
            }
          })
          createdIOUs.push(iou)
        }
      }

      return {
        expense: updatedExpense,
        splitwiseExpense,
        userShare,
        iouAmount,
        ious: createdIOUs
      }
    })
  }

  /**
   * Unlink and reverse a reconciliation
   */
  async unreconcileExpense(expenseId: string, userId: string) {
    const expense = await prisma.expense.findFirst({
      where: { expenseId, userId }
    })
    if (!expense) throw new Error('Expense not found')

    return await prisma.$transaction(async (tx) => {
      if (expense.splitwiseExpenseId) {
        await tx.splitwiseExpense.updateMany({
          where: { splitwiseId: expense.splitwiseExpenseId, userId },
          data: { linkedExpenseId: null, isLinked: false }
        })
      }

      // Delete unsettled IOUs associated with this expense
      await tx.pendingIOU.deleteMany({
        where: {
          expenseId,
          userId,
          status: IOUStatus.PENDING
        }
      })

      return await tx.expense.update({
        where: { expenseId },
        data: {
          splitwiseExpenseId: null,
          isSplitwiseLinked: false,
          isReconciled: false,
          userShare: null,
          iouAmount: null
        }
      })
    })
  }

  /**
   * Settlement Handling:
   * When a friend repays via UPI (+₹1,500), recognize this NOT as "Income",
   * but as clearing the Pending IOU asset.
   */
  async reconcileSettlement(incomeId: string, iouId: string, userId: string) {
    const income = await prisma.income.findFirst({
      where: { incomeId, userId }
    })
    if (!income) throw new Error('Income transaction not found')

    const iou = await prisma.pendingIOU.findFirst({
      where: { id: iouId, userId }
    })
    if (!iou) throw new Error('Pending IOU not found')

    return await prisma.$transaction(async (tx) => {
      // 1. Mark Income as an IOU settlement (NOT general income)
      const updatedIncome = await tx.income.update({
        where: { incomeId },
        data: {
          isSettlement: true,
          sourceType: TransactionSource.SPLITWISE_SETTLEMENT
        }
      })

      // 2. Create the settlement link
      const settlement = await tx.iOUSettlement.create({
        data: {
          iouId,
          incomeId,
          amount: income.amount,
          notes: `Settled via bank transaction: ${income.name}`
        }
      })

      // 3. Update IOU status and settled amount
      const newSettledAmount = iou.settledAmount + income.amount
      const isFullySettled = newSettledAmount >= iou.amount - 0.01

      const updatedIOU = await tx.pendingIOU.update({
        where: { id: iouId },
        data: {
          settledAmount: newSettledAmount,
          status: isFullySettled ? IOUStatus.SETTLED : IOUStatus.PARTIALLY_SETTLED
        }
      })

      return {
        income: updatedIncome,
        iou: updatedIOU,
        settlement
      }
    })
  }

  /**
   * Automatically search for an open IOU that matches an incoming UPI credit
   */
  async findSettlementCandidatesForIncome(incomeId: string, userId: string) {
    const income = await prisma.income.findFirst({
      where: { incomeId, userId }
    })
    if (!income) throw new Error('Income not found')

    const pendingIOUs = await prisma.pendingIOU.findMany({
      where: {
        userId,
        status: { in: [IOUStatus.PENDING, IOUStatus.PARTIALLY_SETTLED] }
      },
      include: {
        expense: true
      }
    })

    const incomeDesc = income.name.toLowerCase()

    return pendingIOUs
      .map(iou => {
        const remainingOwed = iou.amount - iou.settledAmount
        let confidence = 0
        const reasons: string[] = []

        // Exact amount match
        if (Math.abs(remainingOwed - income.amount) < 0.05) {
          confidence += 50
          reasons.push('Exact amount match with remaining IOU balance')
        }

        // Friend name match in transaction remarks
        const nameTokens = iou.friendName.toLowerCase().split(/\s+/).filter(t => t.length > 2)
        const nameMatched = nameTokens.some(token => incomeDesc.includes(token))
        if (nameMatched) {
          confidence += 40
          reasons.push(`Friend name "${iou.friendName}" found in UPI remarks`)
        }

        return {
          iou,
          remainingOwed,
          confidence,
          reasons
        }
      })
      .filter(candidate => candidate.confidence >= 40)
      .sort((a, b) => b.confidence - a.confidence)
  }

  /**
   * Automatically scan and reconcile all unlinked expenses with high-confidence Splitwise matches
   */
  async autoReconcileAll(userId: string) {
    const unlinkedExpenses = await prisma.expense.findMany({
      where: {
        userId,
        isReconciled: false,
        isSplitwiseLinked: false
      },
      orderBy: { date: 'desc' },
      take: 50
    })

    const reconciled: Array<{
      expenseId: string
      splitwiseId: string
      name: string
      amount: number
      userShare: number
      iouAmount: number
    }> = []

    for (const exp of unlinkedExpenses) {
      const candidates = await this.findCandidatesForExpense(exp.expenseId, userId)
      const topCandidate = candidates[0]

      // If confidence >= 0.7 and splitwise expense is unlinked
      if (topCandidate && topCandidate.confidence >= 0.7 && !topCandidate.splitwiseExpense.isLinked) {
        try {
          const res = await this.reconcileExpense(
            exp.expenseId,
            topCandidate.splitwiseExpense.splitwiseId,
            userId
          )
          reconciled.push({
            expenseId: exp.expenseId,
            splitwiseId: topCandidate.splitwiseExpense.splitwiseId,
            name: exp.name,
            amount: exp.amount,
            userShare: res.userShare,
            iouAmount: res.iouAmount
          })
        } catch (err) {
          console.error(`Auto-reconcile error for expense ${exp.expenseId}:`, err)
        }
      }
    }

    return {
      totalScanned: unlinkedExpenses.length,
      reconciledCount: reconciled.length,
      reconciled
    }
  }
}
