import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export class SplitwiseService {
  private baseURL = 'https://secure.splitwise.com/api/v3.0'

  async authenticateUser(code: string, userId: string) {
    // OAuth flow implementation
    const response = await fetch(`${this.baseURL}/get_access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.SPLITWISE_CLIENT_ID!,
        client_secret: process.env.SPLITWISE_CLIENT_SECRET!,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.SPLITWISE_REDIRECT_URI!,
      }),
    })

    const tokens = await response.json()
    
    // Store tokens in database
    await supabase
      .from('users')
      .update({
        splitwise_token: tokens.access_token,
        splitwise_token_exp: new Date(Date.now() + tokens.expires_in * 1000),
      })
      .eq('id', userId)

    return tokens
  }

  async syncExpenses(userId: string) {
    const { data: user } = await supabase
      .from('users')
      .select('splitwise_token, splitwise_user_id')
      .eq('id', userId)
      .single()

    if (!user?.splitwise_token) throw new Error('No Splitwise token found')

    const response = await fetch(`${this.baseURL}/get_expenses`, {
      headers: { 'Authorization': `Bearer ${user.splitwise_token}` }
    })

    const expenses = await response.json()

    // Process and store expenses
    const processedExpenses = expenses.expenses.map((expense: any) => ({
      splitwise_id: expense.id.toString(),
      description: expense.description,
      total_amount: parseFloat(expense.cost),
      user_share: this.calculateUserShare(expense, user.splitwise_user_id),
      currency: expense.currency_code,
      date: new Date(expense.date),
      category: expense.category?.name,
      group_id: expense.group_id?.toString(),
      group_name: expense.group?.name,
      paid_by: expense.users.find((u: any) => parseFloat(u.paid_share) > 0)?.first_name,
      participants: expense.users,
      user_id: userId,
    }))

    // Bulk insert/update
    const { error } = await supabase
      .from('splitwise_expenses')
      .upsert(processedExpenses, { onConflict: 'splitwise_id' })

    if (error) throw error

    return processedExpenses
  }

  private calculateUserShare(expense: any, userId: string): number {
    const userExpense = expense.users.find((u: any) => u.user_id.toString() === userId)
    return userExpense ? parseFloat(userExpense.owed_share) : 0
  }

  async linkToExpense(splitwiseExpenseId: string, appExpenseId: string) {
    const { error } = await supabase
      .from('splitwise_expenses')
      .update({
        linked_expense_id: appExpenseId,
        is_linked: true,
      })
      .eq('splitwise_id', splitwiseExpenseId)

    if (error) throw error

    // Update the app expense to mark it as Splitwise-linked
    await supabase
      .from('expenses')
      .update({
        splitwise_expense_id: splitwiseExpenseId,
        is_splitwise_linked: true,
        source_type: 'SPLITWISE',
      })
      .eq('expense_id', appExpenseId)
  }
}