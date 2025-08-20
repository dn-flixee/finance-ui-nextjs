import { createClient } from '@supabase/supabase-js'
import { EmailParserService } from '@/lib/integrations/email-parser'
import { EmailFilterService } from './email-filter.service'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class EmailService {
  private emailParser: EmailParserService

  constructor() {
    this.emailParser = new EmailParserService()
  }

  async syncEmails(userId: string, provider: string, accessToken: string) {
    const results = {
      processed: 0,
      skipped: 0,
      errors: 0,
      details: [] as any[]
    }

    try {
      // Get linked email account
      const { data: linkedEmail } = await supabase
        .from('linked_emails')
        .select('*')
        .eq('user_id', userId)
        .eq('provider', provider.toUpperCase())
        .single()

      if (!linkedEmail) {
        throw new Error('Email account not linked')
      }

      // Fetch emails from provider
      const emails = await this.fetchEmailsFromProvider(provider, accessToken)

      for (const email of emails) {
        try {
          // Check if email already processed
          const { data: existingTransaction } = await supabase
            .from('email_transactions')
            .select('id')
            .eq('email_id', email.id)
            .single()

          if (existingTransaction) {
            results.skipped++
            continue
          }

          // Parse email with filtering
          const parseResult = await this.emailParser.parseTransactionEmail(
            email, 
            linkedEmail.id
          )

          if (parseResult.skipped) {
            results.skipped++
            results.details.push({
              email: email.subject,
              status: 'skipped',
              reason: parseResult.reason
            })
            continue
          }

          // Store parsed transaction
          const { error } = await supabase
            .from('email_transactions')
            .insert({
              subject: email.subject,
              content: email.content,
              parsed_amount: parseResult.amount,
              parsed_date: parseResult.date,
              parsed_merchant: parseResult.merchant,
              parsed_type: parseResult.type,
              email_id: email.id,
              from_address: email.from,
              received_at: email.receivedAt,
              confidence: parseResult.confidence,
              linked_email_id: linkedEmail.id,
              status: 'PROCESSED'
            })

          if (error) throw error

          results.processed++
          results.details.push({
            email: email.subject,
            status: 'processed',
            confidence: parseResult.confidence,
            amount: parseResult.amount
          })

        } catch (error) {
          results.errors++
          results.details.push({
            email: email.subject,
            status: 'error',
            error: error.message
          })
        }
      }

      return results

    } catch (error) {
      throw new Error(`Email sync failed: ${error.message}`)
    }
  }

  private async fetchEmailsFromProvider(provider: string, accessToken: string) {
    // Implement provider-specific email fetching
    // This would integrate with Gmail API, Outlook Graph API, etc.
    
    if (provider.toLowerCase() === 'gmail') {
      return await this.fetchGmailMessages(accessToken)
    } else if (provider.toLowerCase() === 'outlook') {
      return await this.fetchOutlookMessages(accessToken)
    }
    
    throw new Error(`Unsupported email provider: ${provider}`)
  }

  private async fetchGmailMessages(accessToken: string) {
    // Gmail API implementation
    const response = await fetch(
      'https://gmail.googleapis.com/gmail/v1/users/me/messages?q=from:(bank OR paypal OR venmo OR stripe)', 
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    )
    
    const data = await response.json()
    // Process and return formatted emails
    return []
  }

  private async fetchOutlookMessages(accessToken: string) {
    // Microsoft Graph API implementation  
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/messages?$filter=from/emailAddress/address contains \'bank\'',
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    )
    
    const data = await response.json()
    // Process and return formatted emails
    return []
  }
}