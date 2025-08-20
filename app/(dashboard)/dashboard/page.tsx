import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth' // Adjust path to your authOptions
import { redirect } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { AccountBalanceCard } from '@/components/dashboard/AccountBalanceCard'
import { RecentTransactions } from '@/components/dashboard/RecentTransactions'
import { SpendingChart } from '@/components/dashboard/SpendingChart'
import { QuickActions } from '@/components/dashboard/QuickActions'

// Initialize Supabase with service role key for server-side access
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function DashboardPage() {
  try {
    // Get session
    const session = await getServerSession(authOptions)
    
    // Debug: Log session (remove in production)
    console.log('Session:', session)
    
    if (!session?.user?.id) {
      console.log('No session found, redirecting to login')
      redirect('/login')
    }

    const userId = session.user.id

    const [accounts, recentTransactions, monthlyStats] = await Promise.all([
      supabase
        .from('accounts')
        .select('*')
        .eq('user_id', userId),
      supabase
        .from('expenses')
        .select('*, accounts(name)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),
      // Monthly stats placeholder
      Promise.resolve({ data: [] })
    ])

    // Debug: Log data (remove in production)
    console.log('Accounts:', accounts.data?.length || 0)
    console.log('Transactions:', recentTransactions.data?.length || 0)

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <QuickActions />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {accounts.data?.map((account) => (
            <AccountBalanceCard key={account.account_id} account={account} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RecentTransactions transactions={recentTransactions.data || []} />
          <SpendingChart />
        </div>
      </div>
    )
  } catch (error) {
    console.error('Dashboard error:', error)
    redirect('/login')
  }
}
