// src/lib/parsers/indian-banks.ts

export interface ParsedBankAlert {
  amount: number
  date: Date
  merchant: string
  type: 'EXPENSE' | 'INCOME'
  bankName: string
  accountLastDigits?: string
  referenceId?: string
  rawText: string
  confidence: number
}

interface BankPattern {
  bank: string
  type: 'EXPENSE' | 'INCOME'
  regex: RegExp
  extractor: (match: RegExpMatchArray, raw: string) => Partial<ParsedBankAlert>
}

function cleanAmount(raw: string): number {
  if (!raw) return 0
  const cleaned = raw.replace(/,/g, '').trim()
  return parseFloat(cleaned) || 0
}

function parseAlertDate(dateStr?: string): Date {
  if (!dateStr) return new Date()
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? new Date() : d
}

export class IndianBankParser {
  private static patterns: BankPattern[] = [
    // --- HDFC Bank ---
    {
      bank: 'HDFC',
      type: 'EXPENSE',
      regex: /(?:Sent|debited|spent|paid)\s+(?:Rs\.?|INR)\s*([0-9,.]+)\s+from\s+HDFC\s+Bank\s+A\/C\s*[*xX]*([0-9]+)\s+to\s+([A-Za-z0-9\s@._-]+)(?:\s+on\s+([0-9A-Za-z-]+))?/i,
      extractor: (m) => ({
        amount: cleanAmount(m[1]),
        accountLastDigits: m[2],
        merchant: m[3]?.trim() || 'HDFC Payment',
        date: parseAlertDate(m[4]),
        confidence: 0.95
      })
    },
    {
      bank: 'HDFC',
      type: 'EXPENSE',
      regex: /(?:Rs\.?|INR)\s*([0-9,.]+)\s+has\s+been\s+debited\s+from\s+account\s*[*xX]*([0-9]+)\s+to\s+([A-Za-z0-9\s@._-]+)(?:\s+on\s+([0-9A-Za-z-]+))?/i,
      extractor: (m) => ({
        amount: cleanAmount(m[1]),
        accountLastDigits: m[2],
        merchant: m[3]?.trim() || 'HDFC Payment',
        date: parseAlertDate(m[4]),
        confidence: 0.95
      })
    },
    {
      bank: 'HDFC',
      type: 'INCOME',
      regex: /(?:Rs\.?|INR)\s*([0-9,.]+)\s+credited\s+to\s+HDFC\s+Bank\s+A\/C\s*[*xX]*([0-9]+)\s+(?:on\s+([0-9A-Za-z-]+)\s+)?by\s+([A-Za-z0-9\s@._-]+)/i,
      extractor: (m) => ({
        amount: cleanAmount(m[1]),
        accountLastDigits: m[2],
        date: parseAlertDate(m[3]),
        merchant: m[4]?.trim() || 'HDFC Inflow',
        confidence: 0.95
      })
    },

    // --- State Bank of India (SBI) ---
    {
      bank: 'SBI',
      type: 'EXPENSE',
      regex: /Your\s+A\/C\s*[*xX]*([0-9]+)\s+(?:debited\s+by|debited\s+for)\s+(?:INR|Rs\.?)\s*([0-9,.]+)\s+(?:on\s+([0-9A-Za-z-]+)\s+)?(?:transfer\s+to|Ref|to)\s+([A-Za-z0-9\s@._-]+)/i,
      extractor: (m) => ({
        accountLastDigits: m[1],
        amount: cleanAmount(m[2]),
        date: parseAlertDate(m[3]),
        merchant: m[4]?.trim() || 'SBI Payment',
        confidence: 0.95
      })
    },
    {
      bank: 'SBI',
      type: 'INCOME',
      regex: /Your\s+A\/C\s*[*xX]*([0-9]+)\s+credited\s+by\s+(?:INR|Rs\.?)\s*([0-9,.]+)\s+(?:on\s+([0-9A-Za-z-]+)\s+)?by\s+([A-Za-z0-9\s@._-]+)/i,
      extractor: (m) => ({
        accountLastDigits: m[1],
        amount: cleanAmount(m[2]),
        date: parseAlertDate(m[3]),
        merchant: m[4]?.trim() || 'SBI Inflow',
        confidence: 0.95
      })
    },

    // --- ICICI Bank ---
    {
      bank: 'ICICI',
      type: 'EXPENSE',
      regex: /Acct\s*[*xX]*([0-9]+)\s+debited\s+for\s+(?:INR|Rs\.?)\s*([0-9,.]+)\s+(?:on\s+([0-9A-Za-z-]+))?.*?Info:\s*(?:UPI\/)?([A-Za-z0-9\s@._-]+)/i,
      extractor: (m) => ({
        accountLastDigits: m[1],
        amount: cleanAmount(m[2]),
        date: parseAlertDate(m[3]),
        merchant: m[4]?.trim() || 'ICICI Payment',
        confidence: 0.95
      })
    },
    {
      bank: 'ICICI',
      type: 'INCOME',
      regex: /Acct\s*[*xX]*([0-9]+)\s+credited\s+with\s+(?:INR|Rs\.?)\s*([0-9,.]+)\s+(?:on\s+([0-9A-Za-z-]+))?.*?Info:\s*(?:UPI\/)?([A-Za-z0-9\s@._-]+)/i,
      extractor: (m) => ({
        accountLastDigits: m[1],
        amount: cleanAmount(m[2]),
        date: parseAlertDate(m[3]),
        merchant: m[4]?.trim() || 'ICICI Inflow',
        confidence: 0.95
      })
    },

    // --- Axis Bank ---
    {
      bank: 'Axis',
      type: 'EXPENSE',
      regex: /(?:INR|Rs\.?)\s*([0-9,.]+)\s+debited\s+from\s+A\/C\s*[*xX]*([0-9]+)\s+(?:on\s+([0-9A-Za-z-]+)\s+)?towards\s+([A-Za-z0-9\s@._-]+)/i,
      extractor: (m) => ({
        amount: cleanAmount(m[1]),
        accountLastDigits: m[2],
        date: parseAlertDate(m[3]),
        merchant: m[4]?.trim() || 'Axis Payment',
        confidence: 0.95
      })
    },
    {
      bank: 'Axis',
      type: 'INCOME',
      regex: /(?:INR|Rs\.?)\s*([0-9,.]+)\s+credited\s+to\s+A\/C\s*[*xX]*([0-9]+)\s+(?:on\s+([0-9A-Za-z-]+)\s+)?by\s+([A-Za-z0-9\s@._-]+)/i,
      extractor: (m) => ({
        amount: cleanAmount(m[1]),
        accountLastDigits: m[2],
        date: parseAlertDate(m[3]),
        merchant: m[4]?.trim() || 'Axis Inflow',
        confidence: 0.95
      })
    },

    // --- Generic Indian UPI Patterns (GPay / PhonePe / Paytm / BHIM) ---
    {
      bank: 'UPI',
      type: 'EXPENSE',
      regex: /(?:Paid|Debited|Sent)\s+(?:Rs\.?|INR)\s*([0-9,.]+)\s+(?:to|at)\s+([A-Za-z0-9\s@._-]+)(?:\s+on\s+([0-9A-Za-z-]+))?/i,
      extractor: (m) => ({
        amount: cleanAmount(m[1]),
        merchant: m[2]?.trim() || 'UPI Merchant',
        date: parseAlertDate(m[3]),
        confidence: 0.85
      })
    },
    {
      bank: 'UPI',
      type: 'INCOME',
      regex: /(?:Received|Credited)\s+(?:Rs\.?|INR)\s*([0-9,.]+)\s+from\s+([A-Za-z0-9\s@._-]+)(?:\s+on\s+([0-9A-Za-z-]+))?/i,
      extractor: (m) => ({
        amount: cleanAmount(m[1]),
        merchant: m[2]?.trim() || 'UPI Sender',
        date: parseAlertDate(m[3]),
        confidence: 0.85
      })
    }
  ]

  /**
   * Parse an incoming SMS text or Email snippet
   */
  static parse(text: string): ParsedBankAlert | null {
    if (!text || typeof text !== 'string') return null
    const normalized = text.replace(/\s+/g, ' ').trim()

    for (const pattern of this.patterns) {
      const match = normalized.match(pattern.regex)
      if (match) {
        const extracted = pattern.extractor(match, normalized)
        if (extracted.amount && extracted.amount > 0) {
          return {
            amount: extracted.amount,
            date: extracted.date || new Date(),
            merchant: extracted.merchant || 'Bank Transaction',
            type: pattern.type,
            bankName: pattern.bank,
            accountLastDigits: extracted.accountLastDigits,
            rawText: normalized,
            confidence: extracted.confidence || 0.8
          }
        }
      }
    }

    return null
  }
}
