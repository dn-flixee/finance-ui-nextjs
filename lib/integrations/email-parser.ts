import { LocalLLMService } from './local-llm'
import { EmailFilterService } from '@/services/email-filter.service'

export class EmailParserService {
  private llmService: LocalLLMService

  constructor(llmBaseURL?: string) {
    this.llmService = new LocalLLMService(llmBaseURL)
  }

  async parseTransactionEmail(email: {
    subject: string
    content: string
    from: string
    id: string
    receivedAt: string
  }, linkedEmailId: string) {
    // First, check if email should be parsed
    const filterResult = EmailFilterService.shouldParseEmail(email)
    
    if (!filterResult.shouldParse) {
      console.log(`Skipping email parsing: ${filterResult.reason}`)
      return {
        skipped: true,
        reason: filterResult.reason,
        confidence: filterResult.confidence
      }
    }

    console.log(`Processing email: ${filterResult.reason} (confidence: ${filterResult.confidence})`)

    try {
      // Check LLM health
      const isHealthy = await this.llmService.healthCheck()
      if (!isHealthy) {
        throw new Error('Local LLM is not available')
      }

      // Parse with local LLM
      const parsedData = await this.llmService.parseTransactionEmail(
        email.content,
        email.subject
      )

      return {
        skipped: false,
        ...parsedData,
        filterConfidence: filterResult.confidence,
        filterReason: filterResult.reason
      }
    } catch (error) {
      console.error('Email parsing error:', error)
      return {
        skipped: false,
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        merchant: 'Parse Error',
        type: 'EXPENSE',
        description: `Failed to parse: ${error.message}`,
        confidence: 0.1,
        filterConfidence: filterResult.confidence,
        error: error.message
      }
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    // For local LLM, we can use a simple text-based embedding
    // or integrate with a local embedding model
    // For now, return a simple hash-based embedding
    const words = text.toLowerCase().split(/\W+/)
    const embedding = new Array(384).fill(0) // Smaller embedding size
    
    words.forEach((word, index) => {
      const hash = this.simpleHash(word)
      embedding[hash % 384] += 1
    })
    
    // Normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
    return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding
  }

  private simpleHash(str: string): number {
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash)
  }
}