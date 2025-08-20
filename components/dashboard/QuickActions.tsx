// src/components/dashboard/QuickActions.tsx
import { Button } from '@/components/ui/button'
import { PlusIcon, ArrowRightLeftIcon, MailIcon, UsersIcon } from 'lucide-react'

export function QuickActions() {
  return (
    <div className="flex space-x-2">
      <Button variant="outline" size="sm">
        <PlusIcon className="mr-2 h-4 w-4" />
        Add Income
      </Button>
      <Button variant="outline" size="sm">
        <PlusIcon className="mr-2 h-4 w-4" />
        Add Expense
      </Button>
      <Button variant="outline" size="sm">
        <ArrowRightLeftIcon className="mr-2 h-4 w-4" />
        New Transfer
      </Button>
      <Button variant="outline" size="sm">
        <UsersIcon className="mr-2 h-4 w-4" />
        Sync Splitwise
      </Button>
      <Button variant="outline" size="sm">
        <MailIcon className="mr-2 h-4 w-4" />
        Sync Emails
      </Button>
    </div>
  )
}
