'use client'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LLMStatus } from '@/components/ai/LLMStatus'
import { useChat } from '@/hooks/use-chat'

export function AIChat() {
  const { messages, sendMessage, isLoading } = useChat()
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(scrollToBottom, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    
    setError(null)
    
    try {
      await sendMessage(input)
      setInput('')
    } catch (err: any) {
      if (err.type === 'LLM_UNAVAILABLE') {
        setError('AI assistant is currently offline. Please check your Raspberry Pi setup and try again.')
      } else {
        setError('Failed to send message. Please try again.')
      }
    }
  }

  return (
    <div className="flex flex-col h-[600px] w-full">
      {/* Status Bar */}
      <div className="p-3 border-b bg-gray-50 flex justify-between items-center">
        <h3 className="font-medium">AI Financial Assistant</h3>
        <LLMStatus />
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="m-4 border-red-200 bg-red-50">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>Ask me anything about your finances!</p>
            <p className="text-sm mt-2">Try: "How much did I spend on food this month?"</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <Card className={`max-w-[70%] p-3 ${
              message.role === 'user' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </Card>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <Card className="p-3 bg-gray-100">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input */}
      <form onSubmit={handleSend} className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your finances..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
          >
            Send
          </Button>
        </div>
      </form>
    </div>
  )
}