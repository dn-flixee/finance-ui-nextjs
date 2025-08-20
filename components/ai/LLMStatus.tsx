'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Clock } from 'lucide-react'

interface LLMStatus {
  healthy: boolean
  timestamp: string
  service: string
  error?: string
}

export function LLMStatus() {
  const [status, setStatus] = useState<LLMStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/llm/health')
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({
        healthy: false,
        timestamp: new Date().toISOString(),
        service: 'Local LLM on Raspberry Pi',
        error: 'Connection failed'
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Checking AI Status...
      </Badge>
    )
  }

  return (
    <Badge 
      variant={status?.healthy ? "default" : "destructive"} 
      className="flex items-center gap-1"
    >
      {status?.healthy ? (
        <>
          <CheckCircle className="w-3 h-3" />
          AI Ready
        </>
      ) : (
        <>
          <AlertCircle className="w-3 h-3" />
          AI Offline
        </>
      )}
    </Badge>
  )
}