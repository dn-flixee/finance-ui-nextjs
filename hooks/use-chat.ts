import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: Date
}

export function useChat(sessionId?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null)

  useEffect(() => {
    if (currentSessionId) {
      loadMessages()
    }
  }, [currentSessionId])

  const loadMessages = async () => {
    if (!currentSessionId) return

    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })

    setMessages(data || [])
  }

  const createSession = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: 'New Chat' })
      .select()
      .single()

    if (error) throw error

    setCurrentSessionId(data.id)
    return data.id
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    const sessionId = currentSessionId || await createSession()
    
    // Add user message
    const userMessage = {
      id: crypto.randomUUID(),
      content,
      role: 'user' as const,
      createdAt: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Save user message to database
      await supabase.from('chat_messages').insert({
        content,
        role: 'user',
        session_id: sessionId
      })

      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, sessionId })
      })

      const data = await response.json()
      
      const aiMessage = {
        id: crypto.randomUUID(),
        content: data.response,
        role: 'assistant' as const,
        createdAt: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])

      // Save AI response to database
      await supabase.from('chat_messages').insert({
        content: data.response,
        role: 'assistant',
        session_id: sessionId
      })

    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    isLoading,
    sendMessage,
    currentSessionId
  }
}