'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  HomeIcon, 
  BanknotesIcon, 
  CreditCardIcon, 
  ArrowRightIcon,
  ArrowLeftIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Accounts', href: '/dashboard/accounts', icon: BanknotesIcon },
  { name: 'Transactions', href: '/dashboard/transactions', icon: CreditCardIcon },
  { name: 'Transfers', href: '/dashboard/transfers', icon: ArrowLeftIcon },
  { name: 'Splitwise', href: '/dashboard/splitwise', icon: ArrowRightIcon },
  { name: 'Email Sync', href: '/dashboard/email-sync', icon: EnvelopeIcon },
  { name: 'AI Assistant', href: '/dashboard/chat', icon: ChatBubbleLeftIcon },
  { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 bg-white shadow-sm border-r">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900">Finance Manager</h1>
      </div>
      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}