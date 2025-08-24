import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, linkedEmailId } = await req.json()
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Email filtering check
    const shouldParse = await checkEmailShouldBeParsed(email)
    if (!shouldParse.shouldParse) {
      return new Response(
        JSON.stringify({ 
          skipped: true, 
          reason: shouldParse.reason 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Call local LLM for parsing
    const localLLMUrl = Deno.env.get('LOCAL_LLM_URL') || 'http://raspi.dn:11434'
    
    const parsedData = await parseWithLocalLLM(email, localLLMUrl)

    // Store parsed transaction
    const { data, error } = await supabase
      .from('email_transactions')
      .insert({
        subject: email.subject,
        content: email.content,
        parsed_amount: parsedData.amount,
        parsed_date: parsedData.date,
        parsed_merchant: parsedData.merchant,
        parsed_type: parsedData.type,
        email_id: email.id,
        from_address: email.from,
        received_at: email.receivedAt,
        confidence: parsedData.confidence,
        linked_email_id: linkedEmailId,
        status: 'PROCESSED'
      })

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})

async function checkEmailShouldBeParsed(email: any) {
  // Implement the same filtering logic as in EmailFilterService
  const financialDomains = [
    'chase.com', 'bankofamerica.com', 'wellsfargo.com', 
    'paypal.com', 'venmo.com', 'stripe.com'
  ]
  
  const senderDomain = email.from.split('@')[1]?.toLowerCase()
  const hasFinancialKeywords = email.subject.toLowerCase().includes('transaction') ||
                               email.subject.toLowerCase().includes('payment') ||
                               email.content.toLowerCase().includes('$')

  const shouldParse = financialDomains.includes(senderDomain || '') || hasFinancialKeywords

  return {
    shouldParse,
    reason: shouldParse ? 'contains financial indicators' : 'no financial indicators found'
  }
}

async function parseWithLocalLLM(email: any, llmUrl: string) {
  const prompt = `
Extract transaction data from this email. Return only JSON:

Subject: ${email.subject}
Content: ${email.content}

Required JSON format:
{
  "amount": number,
  "date": "YYYY-MM-DD", 
  "merchant": "string",
  "type": "INCOME|EXPENSE|TRANSFER",
  "description": "string",
  "confidence": 0.0-1.0
}
`

  const response = await fetch(`${llmUrl}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'tinyllama',
      prompt,
      stream: false,
      options: { temperature: 0.1, max_tokens: 300 }
    }),
  })

  const data = await response.json()
  
  try {
    const jsonMatch = data.response.match(/\{[\s\S]*\}/)
    return jsonMatch ? JSON.parse(jsonMatch[0]) : {
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      merchant: 'Unknown',
      type: 'EXPENSE',
      description: 'Parse failed',
      confidence: 0.1
    }
  } catch {
    return {
      amount: 0,
      date: new Date().toISOString().split('T')[0], 
      merchant: 'Parse Error',
      type: 'EXPENSE',
      description: 'JSON parse failed',
      confidence: 0.1
    }
  }
}