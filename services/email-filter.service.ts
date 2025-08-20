import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class EmailFilterService {
  // Bank and financial institution patterns (focused on Indian banks and services)
  private static FINANCIAL_DOMAINS = [
    'sbi.co.in',          // State Bank of India
    'hdfcbank.com',       // HDFC Bank
    'icicibank.com',      // ICICI Bank
    'axisbank.com',       // Axis Bank
    'kotak.com',          // Kotak Mahindra Bank
    'pnbindia.in',        // Punjab National Bank
    'bankofbaroda.in',    // Bank of Baroda
    'canarabank.in',      // Canara Bank
    'unionbankofindia.co.in', // Union Bank of India
    'indusind.com',       // IndusInd Bank
    'yesbank.in',         // YES Bank
    'paytm.com',          // Paytm
    'phonepe.com',        // PhonePe
    'razorpay.com',       // Razorpay
    'billdesk.com',       // BillDesk
    'upi.org.in',         // UPI-related (if applicable)
    'bhimupi.org.in',     // BHIM UPI
    'googlepay.com',      // Google Pay
    'amazonpay.in',       // Amazon Pay
    // Add more as needed
  ]

  private static TRANSACTION_KEYWORDS = [
    // Transaction types (general and India-specific)
    'transaction', 'purchase', 'payment', 'deposit', 'withdrawal',
    'transfer', 'charge', 'credit', 'debit', 'balance',
    'upi', 'neft', 'rtgs', 'imps', 'ecs', 'nach', // Indian payment systems
    
    // Banking terms
    'account', 'statement', 'receipt', 'invoice', 'bill',
    'refund', 'fee', 'interest', 'dividend', 'alert',
    
    // Amount indicators (India-specific)
    '₹', 'rs.', 'inr', 'rupees', 'amount', 'total', 'spent', 'received', 'balance',
    
    // Common Indian merchants and services
    'amazon', 'flipkart', 'myntra', 'paytm', 'phonepe', 'gpay', 'bhim',
    'zomato', 'swiggy', 'uber', 'ola', 'jio', 'airtel', 'reliance',
    'irctc', 'makemytrip', 'bigbasket', 'grofers', 'dmart'
  ]

  private static SPAM_KEYWORDS = [
    'unsubscribe', 'marketing', 'promotion', 'sale', 'discount',
    'offer', 'deal', 'free', 'win', 'winner', 'lottery',
    'click here', 'urgent', 'limited time', 'act now',
    // India-specific spam terms
    'lucky draw', 'prize', 'bumper offer', 'cashback', 'recharge', 'wallet offer',
    'kyc update', 'account suspended', 'pan card', 'aadhaar update'
  ]

  static shouldParseEmail(email: {
    from: string
    subject: string
    content: string
  }): {
    shouldParse: boolean
    reason: string
    confidence: number
  } {
    let score = 0
    let reasons: string[] = []

    // Check sender domain
    const senderDomain = email.from.split('@')[1]?.toLowerCase()
    if (senderDomain && this.FINANCIAL_DOMAINS.includes(senderDomain)) {
      score += 40
      reasons.push('from financial institution')
    }

    // Check for financial keywords in subject
    const subjectLower = email.subject.toLowerCase()
    const subjectKeywordMatches = this.TRANSACTION_KEYWORDS.filter(keyword => 
      subjectLower.includes(keyword)
    ).length

    if (subjectKeywordMatches > 0) {
      score += Math.min(subjectKeywordMatches * 10, 30)
      reasons.push(`${subjectKeywordMatches} financial keywords in subject`)
    }

    // Check content for transaction patterns
    const contentLower = email.content.toLowerCase()
    const contentKeywordMatches = this.TRANSACTION_KEYWORDS.filter(keyword =>
      contentLower.includes(keyword)
    ).length

    if (contentKeywordMatches > 2) {
      score += Math.min(contentKeywordMatches * 5, 25)
      reasons.push(`${contentKeywordMatches} financial keywords in content`)
    }

    // Check for amount patterns (₹XX.XX, INR, Rs., etc.)
    const amountPatterns = [
      /₹\d+\.?\d*/g,
      /rs\.\s*\d+/gi,
      /inr\s*\d+/g,
      /\d+\.\d{2}\s*(INR|rupees?)/gi
    ]

    let amountMatches = 0
    amountPatterns.forEach(pattern => {
      const matches = email.content.match(pattern)
      if (matches) amountMatches += matches.length
    })

    if (amountMatches > 0) {
      score += Math.min(amountMatches * 15, 30)
      reasons.push(`${amountMatches} amount patterns found`)
    }

    // Penalize spam indicators
    const spamMatches = this.SPAM_KEYWORDS.filter(keyword =>
      contentLower.includes(keyword) || subjectLower.includes(keyword)
    ).length

    if (spamMatches > 0) {
      score -= spamMatches * 10
      reasons.push(`${spamMatches} spam indicators`)
    }

    // Penalize newsletters and marketing
    if (subjectLower.includes('newsletter') || 
        contentLower.includes('unsubscribe') ||
        email.content.includes('marketing@') ||
        email.content.includes('no-reply@')) {
      score -= 20
      reasons.push('appears to be marketing/newsletter')
    }

    const shouldParse = score >= 50
    const confidence = Math.min(Math.max(score / 100, 0), 1)

    return {
      shouldParse,
      reason: reasons.join(', '),
      confidence
    }
  }

  static async updateUserFilters(userId: string, filters: {
    enabledDomains?: string[]
    customKeywords?: string[]
    blockedSenders?: string[]
    minimumConfidence?: number
  }) {
    const { error } = await supabase
      .from('users')
      .update({
        email_filter_settings: filters
      })
      .eq('id', userId)

    if (error) throw error
  }

  static async getUserFilters(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('email_filter_settings')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data.email_filter_settings || {}
  }
}
