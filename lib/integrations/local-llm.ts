export class LocalLLMService {
  private baseURL: string
  
  constructor(baseURL = 'http://raspberrypi.local:11434') {
    this.baseURL = baseURL
  }

  async generateResponse(prompt: string, model = 'tinyllama'): Promise<string> {
    try {
      const response = await fetch(`${this.baseURL}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          options: {
            temperature: 0.1,
            top_p: 0.9,
            max_tokens: 500,
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`LLM API error: ${response.status}`)
      }

      const data = await response.json()
      return data.response
    } catch (error) {
      console.error('Local LLM error:', error)
      throw new Error('Failed to generate LLM response')
    }
  }

  async parseTransactionEmail(emailContent: string, subject: string): Promise<any> {
    const prompt = `
Extract transaction information from this email. Return ONLY valid JSON.

Email Subject: ${subject}
Email Content: ${emailContent}

Extract these fields:
- amount: number (transaction amount, positive number)
- date: string (ISO date format YYYY-MM-DD)
- merchant: string (business/merchant name)  
- type: string ("INCOME" or "EXPENSE" or "TRANSFER")
- description: string (brief description)
- confidence: number (0.0 to 1.0, how confident you are)

Example response:
{
  "amount": 45.67,
  "date": "2025-08-20",
  "merchant": "Amazon",
  "type": "EXPENSE", 
  "description": "Online purchase",
  "confidence": 0.9
}

JSON:
`

    try {
      const response = await this.generateResponse(prompt)
      
      // Clean response and extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }

      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate required fields
      if (!parsed.amount || !parsed.type) {
        throw new Error('Missing required fields in parsed data')
      }

      return parsed
    } catch (error) {
      console.error('Email parsing error:', error)
      return {
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        merchant: 'Unknown',
        type: 'EXPENSE',
        description: 'Failed to parse',
        confidence: 0.1
      }
    }
  }

  async generateFinancialAdvice(userContext: any, question: string): Promise<string> {
    const prompt = `
You are a financial advisor. Based on the user's financial data, provide helpful advice.

User's Financial Context:
${JSON.stringify(userContext, null, 2)}

Question: ${question}

Provide practical, specific advice based on their data. Keep response under 200 words.

Response:
`

    return await this.generateResponse(prompt)
  }

  async classifyTransaction(description: string, amount: number): Promise<string> {
    const prompt = `
Classify this transaction into a category. Return only the category name.

Description: ${description}
Amount: $${amount}

Categories: Food, Transportation, Entertainment, Shopping, Bills, Healthcare, Income, Transfer, Other

Category:
`

    const response = await this.generateResponse(prompt)
    return response.trim() || 'Other'
  }

  // Health check for the local LLM
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/tags`)
      return response.ok
    } catch {
      return false
    }
  }
}