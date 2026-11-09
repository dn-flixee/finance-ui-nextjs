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
          client_id: (process.env.SPLITWISE_CLIENT_ID || process.env.NEXT_PUBLIC_SPLITWISE_CLIENT_ID)!,
          client_secret: process.env.SPLITWISE_CLIENT_SECRET!,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/v1/splitwise/callback`
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

      // Fetch user profile from Splitwise to store splitwiseUserId
      let splitwiseUser: any = null
      try {
        const userRes = await fetch(`${this.baseURL}/get_current_user`, {
          headers: { 'Authorization': `Bearer ${tokens.access_token}` }
        })
        if (userRes.ok) {
          const userData = await userRes.json()
          splitwiseUser = userData.user
        }
      } catch (err) {
        console.warn('Could not fetch current user details during OAuth:', err)
      }

      // Store tokens and user info
      await prisma.user.update({
        where: { id: userId },
        data: {
          splitwiseToken: tokens.access_token,
          splitwiseTokenExp: new Date(Date.now() + (tokens.expires_in || 3600) * 1000),
          splitwiseUserId: splitwiseUser?.id ? splitwiseUser.id.toString() : undefined,
          splitwiseUserEmail: splitwiseUser?.email || undefined
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
      paidBy: paidByUser?.user?.first_name 
        ? `${paidByUser.user.first_name} ${paidByUser.user.last_name || ''}`.trim() 
        : (paidByUser?.first_name || 'Unknown'),
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


  private calculateUserShare(expense: any, userId?: string | null): number {
    if (!userId) return 0
    const userExpense = expense.users?.find((u: any) => 
      (u.user_id || u.user?.id)?.toString() === userId.toString()
    )
    return userExpense ? parseFloat(userExpense.owed_share || 0) : 0
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { splitwiseToken: true }
    })
    if (!user?.splitwiseToken) throw new Error('No Splitwise token found')

    const response = await fetch(`${this.baseURL}/get_current_user`, {
      headers: { 'Authorization': `Bearer ${user.splitwiseToken}` }
    })
    if (!response.ok) throw new Error(`Failed to fetch current user: ${response.status}`)
    const data = await response.json()
    return data.user
  }

  async getFriends(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { splitwiseToken: true, splitwiseUserId: true }
    })
    if (!user?.splitwiseToken) throw new Error('No Splitwise token found')

    const response = await fetch(`${this.baseURL}/get_friends`, {
      headers: { 'Authorization': `Bearer ${user.splitwiseToken}` }
    })
    if (!response.ok) throw new Error(`Failed to fetch friends: ${response.status}`)
    const data = await response.json()
    return data.friends || []
  }

  async getNetBalances(userId: string) {
    try {
      const friends = await this.getFriends(userId)
      let totalIOUsOwedToUser = 0 // Friends owe me (Asset)
      let totalDebtsOwedByUser = 0 // I owe friends (Liability)

      const friendBalances: Array<{
        friendId: string
        name: string
        email?: string
        netBalance: number
        currency: string
      }> = []

      for (const friend of friends) {
        if (!friend.balance || !Array.isArray(friend.balance)) continue

        for (const bal of friend.balance) {
          const amount = parseFloat(bal.amount || '0')
          if (amount > 0) {
            totalIOUsOwedToUser += amount
          } else if (amount < 0) {
            totalDebtsOwedByUser += Math.abs(amount)
          }

          if (amount !== 0) {
            friendBalances.push({
              friendId: friend.id.toString(),
              name: `${friend.first_name || ''} ${friend.last_name || ''}`.trim() || 'Friend',
              email: friend.email,
              netBalance: amount,
              currency: bal.currency_code || 'INR'
            })
          }
        }
      }

      return {
        totalIOUsOwedToUser,
        totalDebtsOwedByUser,
        netBalance: totalIOUsOwedToUser - totalDebtsOwedByUser,
        friends: friendBalances
      }
    } catch (error) {
      console.error('Failed to get Splitwise net balances:', error)
      return {
        totalIOUsOwedToUser: 0,
        totalDebtsOwedByUser: 0,
        netBalance: 0,
        friends: []
      }
    }
  }
}
