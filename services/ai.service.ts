import { LocalLLMService } from '@/lib/integrations/local-llm'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class AIService {
  private llmService: LocalLLMService

  constructor() {
    const llmURL = process.env.LOCAL_LLM_URL || 'http://raspberrypi.local:11434'
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
    const [accounts, recentTransactions, goals] = await Promise.all([
      supabase.from('accounts').select('*').eq('user_id', userId),
      supabase.from('expenses').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('income_sources').select('*, incomes(amount)').eq('user_id', userId),
    ])

    return {
      accounts: accounts.data,
      recentTransactions: recentTransactions.data,
      goals: goals.data,
    }
  }

  private async searchFinancialKnowledge(query: string) {
    // Simple text-based search instead of vector search
    const { data } = await supabase
      .from('financial_knowledge')
      .select('*')
      .textSearch('content', query.replace(/[^\w\s]/g, ''))
      .limit(3)

    return data || []
  }

  private calculateMonthlySpending(transactions: any[] = []): number {
    const thisMonth = new Date().getMonth()
    const thisYear = new Date().getFullYear()
    
    return transactions
      .filter(t => {
        const tDate = new Date(t.date)
        return tDate.getMonth() === thisMonth && tDate.getFullYear() === thisYear
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0)
  }

  async classifyTransaction(description: string, amount: number): Promise<string> {
    return await this.llmService.classifyTransaction(description, amount)
  }

  async isLLMHealthy(): Promise<boolean> {
    return await this.llmService.healthCheck()
  }
}