import { LocalLLMService } from '@/lib/integrations/local-llm'
import { prisma } from '@/lib/prisma'

export class AIService {
  private llmService: LocalLLMService

  constructor() {
    const llmURL = process.env.LOCAL_LLM_URL || 'http://raspi.dn:11434'
    this.llmService = new LocalLLMService(llmURL)
  }

  async chatWithFinancialData(message: string, userId: string) {
    try {
      // Get user's financial context
      const userContext = await this.getUserFinancialContext(userId)
      
      // Search for relevant financial knowledge (simplified without vector search)
      const knowledgeData = await this.searchFinancialKnowledge(message)
      
      const contextPrompt = `
User's Financial Summary:
- Total Accounts: ${userContext.accounts?.length || 0}
- Recent Transactions: ${userContext.recentTransactions?.length || 0}
- Monthly Spending: $${this.calculateMonthlySpending(userContext.recentTransactions)}

Recent Transactions:
${userContext.recentTransactions?.slice(0, 5).map(t => 
  `- ${t.name}: $${t.amount} (${new Date(t.date).toLocaleDateString()})`
).join('\n') || 'No recent transactions'}

Financial Tips:
${knowledgeData.slice(0, 2).map(k => `- ${k.title}: ${k.content}`).join('\n')}

User Question: ${message}
`

      const response = await this.llmService.generateFinancialAdvice(userContext, message)
      return response

    } catch (error) {
      console.error('AI Service error:', error)
      return "I'm having trouble accessing your financial data right now. Please try again later."
    }
  }

  private async getUserFinancialContext(userId: string) {
    try {
      const [accounts, recentTransactions, goals] = await Promise.all([
        // Get accounts
        prisma.financeAccount.findMany({
          where: { userId: userId },
          select: {
            accountId: true,
            name: true,
            balance: true,
            accountType: true
          }
        }),
        
        // Get recent expenses (combining expenses, incomes, and transfers)
        Promise.all([
          prisma.expense.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              expenseId: true,
              name: true,
              amount: true,
              date: true,
              createdAt: true
            }
          }),
          prisma.income.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              incomeId: true,
              name: true,
              amount: true,
              date: true,
              createdAt: true
            }
          }),
          prisma.transfer.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              transferId: true,
              name: true,
              amount: true,
              date: true,
              createdAt: true
            }
          })
        ]).then(([expenses, incomes, transfers]) => {
          // Combine all transactions and sort by date
          const allTransactions = [
            ...expenses.map(t => ({ ...t, type: 'expense' })),
            ...incomes.map(t => ({ ...t, type: 'income' })),
            ...transfers.map(t => ({ ...t, type: 'transfer' }))
          ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          
          return allTransactions.slice(0, 10)
        }),
        
        // Get income sources with goals
        prisma.incomeSource.findMany({
          where: { userId: userId },
          include: {
            incomes: {
              select: { amount: true }
            }
          }
        })
      ])

      return {
        accounts: accounts || [],
        recentTransactions: recentTransactions || [], // ✅ Always return array
        goals: goals || []
      }
    } catch (error) {
      console.error('Error fetching user financial context:', error)
      // ✅ Return safe defaults for new users
      return {
        accounts: [],
        recentTransactions: [],
        goals: []
      }
    }
  }

  private async searchFinancialKnowledge(query: string) {
    try {
      // Using Prisma instead of Supabase
      const data = await prisma.financialKnowledge.findMany({
        where: {
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } }
          ]
        },
        take: 3
      })

      return data || []
    } catch (error) {
      console.error('Error searching financial knowledge:', error)
      return [] // ✅ Return empty array on error
    }
  }

  private calculateMonthlySpending(transactions: any[] = []): number {
    // ✅ Default to empty array if null/undefined
    if (!Array.isArray(transactions)) {
      return 0
    }

    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    
    return transactions
      .filter(t => {
        if (!t || !t.date) return false // ✅ Additional safety check
        const tDate = new Date(t.date)
        return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear
      })
      .reduce((sum, t) => {
        // ✅ Handle expenses (negative) vs income/transfers (positive)
        const amount = t.amount || 0
        return t.type === 'expense' ? sum + Math.abs(amount) : sum
      }, 0)
  }

  async classifyTransaction(description: string, amount: number): Promise<string> {
    try {
      return await this.llmService.classifyTransaction(description, amount)
    } catch (error) {
      console.error('Error classifying transaction:', error)
      return 'Other' // ✅ Fallback category
    }
  }

  async isLLMHealthy(): Promise<boolean> {
    try {
      return await this.llmService.healthCheck()
    } catch (error) {
      console.error('Error checking LLM health:', error)
      return false // ✅ Safe default
    }
  }
}
