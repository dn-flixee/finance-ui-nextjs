// src/services/categorization.service.ts
import { prisma } from '@/lib/prisma'
import { RuleAction, RuleMatchType } from '@/lib/types'

export interface CategorizationEvaluation {
  action: RuleAction | 'NONE'
  category?: string
  expenseSourceId?: string
  isIgnored: boolean
  isTransfer: boolean
  toAccountId?: string
  splitwiseCandidate?: any
  matchedRuleId?: string
}

export class CategorizationService {
  /**
   * Evaluate a transaction against user's custom rules and Splitwise heuristics
   */
  async evaluateTransaction(
    name: string,
    amount: number,
    date: Date,
    userId: string
  ): Promise<CategorizationEvaluation> {
    const rules = await prisma.categorizationRule.findMany({
      where: { userId },
      orderBy: { priority: 'desc' }
    })

    const normalizedName = name.trim().toLowerCase()
    let matchedRule: any = null

    for (const rule of rules) {
      const pattern = rule.matchPattern.trim().toLowerCase()
      let matches = false

      switch (rule.matchType) {
        case RuleMatchType.EXACT:
          matches = normalizedName === pattern
          break
        case RuleMatchType.STARTS_WITH:
          matches = normalizedName.startsWith(pattern)
          break
        case RuleMatchType.REGEX:
          try {
            const re = new RegExp(rule.matchPattern, 'i')
            matches = re.test(name)
          } catch {
            matches = false
          }
          break
        case RuleMatchType.CONTAINS:
        default:
          matches = normalizedName.includes(pattern)
          break
      }

      if (matches) {
        matchedRule = rule
        break
      }
    }

    // Default built-in smart defaults if no explicit user rule:
    let defaultCategory: string | undefined = undefined
    let isDefaultIgnore = false

    if (!matchedRule) {
      // Check for common Indian internal transfers & brokerages (Ignore rule)
      if (
        normalizedName.includes('zerodha') ||
        normalizedName.includes('groww') ||
        normalizedName.includes('cred') ||
        normalizedName.includes('self transfer') ||
        normalizedName.includes('fund transfer')
      ) {
        isDefaultIgnore = true
      } else if (
        normalizedName.includes('zomato') ||
        normalizedName.includes('swiggy') ||
        normalizedName.includes('eats') ||
        normalizedName.includes('dining') ||
        normalizedName.includes('restaurant')
      ) {
        defaultCategory = 'Food & Dining'
      } else if (
        normalizedName.includes('uber') ||
        normalizedName.includes('ola') ||
        normalizedName.includes('metro') ||
        normalizedName.includes('fuel')
      ) {
        defaultCategory = 'Transportation'
      } else if (
        normalizedName.includes('amazon') ||
        normalizedName.includes('flipkart') ||
        normalizedName.includes('myntra')
      ) {
        defaultCategory = 'Shopping'
      }
    }

    // Check if there is a Splitwise expense on the same date with matching amount
    let splitwiseCandidate: any = null
    try {
      const startDate = new Date(date)
      startDate.setDate(startDate.getDate() - 2)
      const endDate = new Date(date)
      endDate.setDate(endDate.getDate() + 2)

      splitwiseCandidate = await prisma.splitwiseExpense.findFirst({
        where: {
          userId,
          date: { gte: startDate, lte: endDate },
          totalAmount: { gte: amount - 1, lte: amount + 1 },
          isLinked: false
        }
      })
    } catch {
      splitwiseCandidate = null
    }

    if (matchedRule) {
      return {
        action: matchedRule.action,
        category: matchedRule.targetCategory || undefined,
        expenseSourceId: matchedRule.targetSourceId || undefined,
        isIgnored: matchedRule.action === RuleAction.IGNORE,
        isTransfer: matchedRule.action === RuleAction.TRANSFER,
        toAccountId: matchedRule.toAccountId || undefined,
        splitwiseCandidate,
        matchedRuleId: matchedRule.id
      }
    }

    return {
      action: isDefaultIgnore ? RuleAction.IGNORE : 'NONE',
      category: defaultCategory,
      isIgnored: isDefaultIgnore,
      isTransfer: false,
      splitwiseCandidate
    }
  }

  async getRules(userId: string) {
    return await prisma.categorizationRule.findMany({
      where: { userId },
      orderBy: { priority: 'desc' }
    })
  }

  async createRule(userId: string, data: {
    matchPattern: string
    matchType?: RuleMatchType
    action?: RuleAction
    targetCategory?: string
    targetSourceId?: string
    toAccountId?: string
    priority?: number
  }) {
    return await prisma.categorizationRule.create({
      data: {
        userId,
        matchPattern: data.matchPattern,
        matchType: data.matchType || RuleMatchType.CONTAINS,
        action: data.action || RuleAction.CATEGORIZE,
        targetCategory: data.targetCategory,
        targetSourceId: data.targetSourceId,
        toAccountId: data.toAccountId,
        priority: data.priority || 0
      }
    })
  }

  async deleteRule(id: string, userId: string) {
    return await prisma.categorizationRule.deleteMany({
      where: { id, userId }
    })
  }
}
