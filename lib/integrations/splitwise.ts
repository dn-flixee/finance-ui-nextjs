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

  async getGroups(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { splitwiseToken: true, splitwiseUserId: true }
    })
    if (!user?.splitwiseToken) throw new Error('No Splitwise token found')

    const response = await fetch(`${this.baseURL}/get_groups`, {
      headers: { 'Authorization': `Bearer ${user.splitwiseToken}` }
    })
    if (!response.ok) throw new Error(`Failed to fetch groups: ${response.status}`)
    const data = await response.json()

    // Filter out group id 0 (Non-group expenses)
    const groups = (data.groups || [])
      .filter((g: any) => g.id !== 0 && g.id !== '0')
      .map((g: any) => ({
        id: g.id.toString(),
        name: g.name,
        groupType: g.group_type,
        updatedAt: g.updated_at,
        members: (g.members || []).map((m: any) => ({
          id: m.id.toString(),
          name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || 'Member',
          email: m.email
        }))
      }))

    return groups
  }

  async createExpense(userId: string, params: {
    cost: number
    description: string
    details?: string
    date?: string | Date
    currencyCode?: string
    groupId?: string | number
    splitEqually?: boolean
    users?: Array<{
      userId: string | number
      paidShare: number
      owedShare: number
      firstName?: string
      lastName?: string
      email?: string
    }>
  }) {
    let user = await prisma.user.findUnique({
      where: { id: userId },
      select: { splitwiseToken: true, splitwiseUserId: true }
    })
    if (!user?.splitwiseToken) throw new Error('No Splitwise token found')

    // If splitwiseUserId is not yet stored, retrieve and cache it
    if (!user.splitwiseUserId) {
      try {
        const currentUser = await this.getCurrentUser(userId)
        if (currentUser?.id) {
          user = await prisma.user.update({
            where: { id: userId },
            data: { splitwiseUserId: currentUser.id.toString() },
            select: { splitwiseToken: true, splitwiseUserId: true }
          })
        }
      } catch (err) {
        console.warn('Could not auto-fetch splitwiseUserId:', err)
      }
    }

    const formParams = new URLSearchParams()
    formParams.append('cost', params.cost.toFixed(2))
    formParams.append('description', params.description)
    formParams.append('currency_code', params.currencyCode || 'INR')
    
    if (params.date) {
      const dateStr = typeof params.date === 'string' 
        ? params.date 
        : params.date.toISOString()
      formParams.append('date', dateStr)
    }

    if (params.details) {
      formParams.append('details', params.details)
    }

    const hasGroup = params.groupId && params.groupId !== '0' && params.groupId !== 0
    if (hasGroup) {
      formParams.append('group_id', params.groupId!.toString())
    }

    if (hasGroup && params.splitEqually && (!params.users || params.users.length === 0)) {
      formParams.append('split_equally', 'true')
    } else if (params.users && params.users.length > 0) {
      params.users.forEach((u, i) => {
        formParams.append(`users__${i}__user_id`, u.userId.toString())
        formParams.append(`users__${i}__paid_share`, u.paidShare.toFixed(2))
        formParams.append(`users__${i}__owed_share`, u.owedShare.toFixed(2))
        if (u.firstName) formParams.append(`users__${i}__first_name`, u.firstName)
        if (u.lastName) formParams.append(`users__${i}__last_name`, u.lastName)
        if (u.email) formParams.append(`users__${i}__email`, u.email)
      })
    }

    console.log('Sending create_expense request to Splitwise:', Object.fromEntries(formParams.entries()))

    const response = await fetch(`${this.baseURL}/create_expense`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.splitwiseToken}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      body: formParams
    })

    const responseText = await response.text()
    let data: any
    try {
      data = JSON.parse(responseText)
    } catch {
      throw new Error(`Failed to parse Splitwise response: ${responseText}`)
    }

    if (data.errors && Object.keys(data.errors).length > 0) {
      const errorMsg = typeof data.errors === 'string'
        ? data.errors
        : Array.isArray(data.errors)
          ? data.errors.join(', ')
          : Object.entries(data.errors).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`).join('; ')
      throw new Error(`Splitwise API error: ${errorMsg}`)
    }

    if (!data.expenses || data.expenses.length === 0) {
      throw new Error('Splitwise did not return the created expense.')
    }

    const created = data.expenses[0]

    // Determine who paid
    const paidByUser = created.users && created.users.length > 0 
      ? created.users.find((u: any) => parseFloat(u.paid_share || '0') > 0)
      : null

    const userShare = this.calculateUserShare(created, user.splitwiseUserId)

    // Store in Prisma splitwiseExpense table
    const result = await prisma.splitwiseExpense.upsert({
      where: { splitwiseId: created.id.toString() },
      update: {
        description: created.description || params.description,
        totalAmount: parseFloat(created.cost || params.cost),
        userShare: userShare,
        currency: created.currency_code || params.currencyCode || 'INR',
        date: new Date(created.date || Date.now()),
        category: created.category?.name || 'Other',
        groupId: created.group_id ? created.group_id.toString() : null,
        groupName: created.group?.name || (created.group_id ? 'Group' : 'Personal'),
        paidBy: paidByUser?.user?.first_name 
          ? `${paidByUser.user.first_name} ${paidByUser.user.last_name || ''}`.trim() 
          : (paidByUser?.first_name || 'You'),
        participants: created.users || [],
        updatedAt: new Date()
      },
      create: {
        splitwiseId: created.id.toString(),
        description: created.description || params.description,
        totalAmount: parseFloat(created.cost || params.cost),
        userShare: userShare,
        currency: created.currency_code || params.currencyCode || 'INR',
        date: new Date(created.date || Date.now()),
        category: created.category?.name || 'Other',
        groupId: created.group_id ? created.group_id.toString() : null,
        groupName: created.group?.name || (created.group_id ? 'Group' : 'Personal'),
        paidBy: paidByUser?.user?.first_name 
          ? `${paidByUser.user.first_name} ${paidByUser.user.last_name || ''}`.trim() 
          : (paidByUser?.first_name || 'You'),
        participants: created.users || [],
        userId: userId
      }
    })

    return {
      splitwiseExpense: result,
      rawResponse: created
    }
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
