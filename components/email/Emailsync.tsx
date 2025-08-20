'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEmailSync } from '@/hooks/use-email-sync'

export function EmailSync() {
  const { linkedEmails, emailTransactions, connectEmail, syncEmails } = useEmailSync()
  const [isLoading, setIsLoading] = useState(false)

  const handleConnect = async (provider: 'gmail' | 'outlook') => {
    setIsLoading(true)
    try {
      await connectEmail(provider)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async (emailId: string) => {
    setIsLoading(true)
    try {
      await syncEmails(emailId)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Email Integration</h2>
        <p className="text-gray-600">Connect your email accounts to automatically detect bank transactions</p>
      </div>

      {/* Connect Email Accounts */}
      <Card>
        <CardHeader>
          <CardTitle>Connect Email Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button 
              onClick={() => handleConnect('gmail')}
              disabled={isLoading}
              variant="outline"
            >
              Connect Gmail
            </Button>
            <Button 
              onClick={() => handleConnect('outlook')}
              disabled={isLoading}
              variant="outline"
            >
              Connect Outlook
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Linked Emails */}
      {linkedEmails.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Linked Email Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {linkedEmails.map((email) => (
                <div key={email.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{email.email}</p>
                    <p className="text-sm text-gray-500">{email.provider}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={email.enable_parsing ? 'default' : 'secondary'}>
                      {email.enable_parsing ? 'Active' : 'Paused'}
                    </Badge>
                    <Button 
                      size="sm"
                      onClick={() => handleSync(email.id)}
                      disabled={isLoading}
                    >
                      Sync Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detected Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Detected Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {emailTransactions.map((transaction) => (
              <div key={transaction.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{transaction.parsed_merchant || 'Unknown Merchant'}</h4>
                    <p className="text-sm text-gray-600">{transaction.subject}</p>
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>Amount: ${transaction.parsed_amount}</span>
                      <span>Date: {new Date(transaction.parsed_date || '').toLocaleDateString()}</span>
                      <span>Confidence: {Math.round((transaction.confidence || 0) * 100)}%</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant={
                      transaction.status === 'LINKED' ? 'default' :
                      transaction.status === 'PROCESSED' ? 'secondary' : 'outline'
                    }>
                      {transaction.status}
                    </Badge>
                    {transaction.status === 'PROCESSED' && (
                      <Button size="sm" variant="outline">
                        Create Transaction
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}