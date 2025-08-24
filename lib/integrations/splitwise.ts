// src/lib/integrations/splitwise.ts
import { prisma } from '@/lib/prisma'

export class SplitwiseService {
  private baseURL = 'https://secure.splitwise.com/api/v3.0'

  async authenticateUser(code: string, userId: string) {
    try {
      // ✅ Use OAuth 2.0 endpoint instead of API v3.0
      const response = await fetch('https://secure.splitwise.com/oauth/token', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: new URLSearchParams({
          client_id: process.env.NEXT_PUBLIC_SPLITWISE_CLIENT_ID!,
          client_secret: process.env.SPLITWISE_CLIENT_SECRET!,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: `${process.env.NEXTAUTH_URL}/api/splitwise/callback`
        })
      })

      console.log('OAuth 2.0 response status:', response.status)
      console.log('OAuth 2.0 response headers:', Object.fromEntries(response.headers))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('OAuth 2.0 error response:', errorText)
        throw new Error(`OAuth 2.0 error: ${response.status} - ${errorText}`)
      }

      const responseText = await response.text()
      console.log('OAuth 2.0 raw response:', responseText)

      const tokens = JSON.parse(responseText)
      console.log('OAuth 2.0 parsed tokens:', tokens)

      // Store tokens
      await prisma.user.update({
        where: { id: userId },
        data: {
          splitwiseToken: tokens.access_token,
          splitwiseTokenExp: new Date(Date.now() + (tokens.expires_in || 3600) * 1000)
        }
      })

      return tokens

    } catch (error) {
      console.error('OAuth 2.0 authentication error:', error)
      throw error
    }
  }

// src/lib/integrations/splitwise.ts
async syncExpenses(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      splitwiseToken: true,
      splitwiseUserId: true
    }
  })

  if (!user?.splitwiseToken) throw new Error('No Splitwise token found')

  const response = await fetch(`${this.baseURL}/get_expenses`, {
    headers: { 'Authorization': `Bearer ${user.splitwiseToken}` }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch expenses: ${response.status}`)
  }

  const expenses = await response.json()

  // ✅ Fixed: Ensure all required fields have fallback values
  const processedExpenses = expenses.expenses.map((expense: any) => {
    // Safely find who paid for the expense
    const paidByUser = expense.users && expense.users.length > 0 
      ? expense.users.find((u: any) => parseFloat(u.paid_share || 0) > 0)
      : null

    return {
      splitwiseId: expense.id.toString(),
      description: expense.description || 'No description',
      totalAmount: parseFloat(expense.cost || 0),
      userShare: this.calculateUserShare(expense, user.splitwiseUserId),
      currency: expense.currency_code || 'USD',
      date: new Date(expense.date),
      category: expense.category?.name || 'Other',
      groupId: expense.group_id?.toString() || null,
      groupName: expense.group?.name || 'Personal',
      paidBy: paidByUser?.first_name || 'Unknown', // ✅ Always provide a value
      participants: expense.users || [],
      userId: userId,
    }
  })

  // ✅ Use individual upsert calls with proper error handling
  const results = []
  for (const expense of processedExpenses) {
    try {
      const result = await prisma.splitwiseExpense.upsert({
        where: { 
          splitwiseId: expense.splitwiseId 
        },
        update: {
          description: expense.description,
          totalAmount: expense.totalAmount,
          userShare: expense.userShare,
          currency: expense.currency,
          date: expense.date,
          category: expense.category,
          groupId: expense.groupId,
          groupName: expense.groupName,
          paidBy: expense.paidBy, // ✅ Now always has a value
          participants: expense.participants,
          updatedAt: new Date()
        },
        create: expense
      })
      results.push(result)
    } catch (error) {
      console.error(`Failed to upsert expense ${expense.splitwiseId}:`, error)
      // Continue with other expenses instead of failing completely
    }
  }

  return results
}


  private calculateUserShare(expense: any, userId: string): number {
    const userExpense = expense.users.find((u: any) => u.user_id.toString() === userId)
    return userExpense ? parseFloat(userExpense.owed_share) : 0
  }
}
