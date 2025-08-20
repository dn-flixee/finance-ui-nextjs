import { NextRequest, NextResponse } from 'next/server'
import { LocalLLMService } from '@/lib/integrations/local-llm'

export async function GET(request: NextRequest) {
  try {
    const llmService = new LocalLLMService()
    const isHealthy = await llmService.healthCheck()
    
    const status = {
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      service: 'Local LLM on Raspberry Pi'
    }

    return NextResponse.json(status)

  } catch (error) {
    return NextResponse.json({
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString(),
      service: 'Local LLM on Raspberry Pi'
    }, { status: 503 })
  }
}