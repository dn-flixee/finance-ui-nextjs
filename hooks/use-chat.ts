// src/hooks/use-chat.ts
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ChatMessage {
  id: string
  content: string
  role: 'USER' | 'ASSISTANT'
  createdAt: Date
}

export function useChat(sessionId?: string) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId || null)

  useEffect(() => {
    if (currentSessionId && session?.user) {
      loadMessages()
    }
  }, [currentSessionId, session])

  const loadMessages = async () => {
    if (!currentSessionId) return

    try {
      const response = await fetch(`/api/chat/sessions/${currentSessionId}/messages`)
      if (response.ok) {
        const data = await response.json()
        setMessages(data.map((msg: any) => ({
          ...msg,
          createdAt: new Date(msg.createdAt)
        })))
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const createSession = async () => {
    if (!session?.user?.id) {
      throw new Error('Not authenticated: No user session found.')
    }

    try {
      const response = await fetch('/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      })

      if (!response.ok) {
        throw new Error('Failed to create chat session')
      }

      const data = await response.json()
      setCurrentSessionId(data.id)
      return data.id
    } catch (error) {
      console.error('Create session error:', error)
      throw error
    }
  }

  const sendMessage = async (content: string) => {
    if (!content.trim()) return

    // Add user message to UI immediately
    const userMessage = {
      id: crypto.randomUUID(),
      content,
      role: 'USER' as const,
      createdAt: new Date()
    }
    
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // Send message to your existing API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: content, 
          sessionId: currentSessionId 
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to get AI response')
      }

      const data = await response.json()
      
      // Update current session ID if it was created
      if (data.sessionId && !currentSessionId) {
        setCurrentSessionId(data.sessionId)
      }
      
      // Add AI response to UI
      const aiMessage = {
        id: crypto.randomUUID(),
        content: data.response,
        role: 'ASSISTANT' as const,
        createdAt: new Date()
      }
      
      setMessages(prev => [...prev, aiMessage])

    } catch (error) {
      console.error('Chat error:', error)
      // Add error message to chat
      const errorMessage = {
        id: crypto.randomUUID(),
        content: 'Sorry, I encountered an error. Please try again.',
        role: 'ASSISTANT' as const,
        createdAt: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return {
    messages,
    isLoading,
    sendMessage,
    currentSessionId,
    isAuthenticated: !!session?.user
  }
}
