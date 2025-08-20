import { AIChat } from '@/components/chat/AIChat'

export default function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Financial Assistant</h1>
        <p className="text-gray-600">Ask questions about your finances and get personalized advice</p>
      </div>
      
      <AIChat />
    </div>
  )
}