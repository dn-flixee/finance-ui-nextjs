'use client' // ✅ Required for client-side navigation

// src/components/dashboard/QuickActions.tsx
import { Button } from '@/components/ui/button'
import { PlusIcon, ArrowRightLeftIcon, MailIcon, UsersIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function QuickActions() {
  const router = useRouter()

  const handleAddIncome = () => {
    router.push('/dashboard/income')
  }

  const handleAddExpense = () => {
    router.push('/dashboard/expense')
  }

  const handleNewTransfer = () => {
    router.push('/dashboard/transfer')
  }

  const handleSyncSplitwise = () => {
    router.push('/dsplitwise')
  }

  const handleSyncEmails = () => {
    router.push('/dashboard/email-sync')
  }

  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm" onClick={handleAddIncome}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Add Income
      </Button>
      <Button variant="outline" size="sm" onClick={handleAddExpense}>
        <PlusIcon className="mr-2 h-4 w-4" />
        Add Expense
      </Button>
      <Button variant="outline" size="sm" onClick={handleNewTransfer}>
        <ArrowRightLeftIcon className="mr-2 h-4 w-4" />
        New Transfer
      </Button>
      <Button variant="outline" size="sm" onClick={handleSyncSplitwise}>
        <UsersIcon className="mr-2 h-4 w-4" />
        Sync Splitwise
      </Button>
      <Button variant="outline" size="sm" onClick={handleSyncEmails}>
        <MailIcon className="mr-2 h-4 w-4" />
        Sync Emails
      </Button>
    </div>
  )
}
