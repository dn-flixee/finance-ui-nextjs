// src/components/dashboard/AccountBalanceCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { FinanceAccount } from '@/lib/types' // Assuming types are defined

interface AccountBalanceCardProps {
  account: FinanceAccount
}

export function AccountBalanceCard({ account }: AccountBalanceCardProps) {
  const { name, balance, accountType, iconUrl, creditLimit } = account
  
  // Format balance with color based on value
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Math.abs(balance))

  const isNegative = balance < 0
  const balanceColor = isNegative ? 'text-red-500' : 'text-green-500'

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{name}</CardTitle>
          <Badge variant="outline">{accountType}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Balance</p>
            <p className={`text-2xl font-bold ${balanceColor}`}>
              {isNegative ? '-' : ''}{formattedBalance}
            </p>
            {accountType === 'CREDIT_CARD' && creditLimit && (
              <p className="text-sm text-gray-500 mt-1">
                Available Credit: ${creditLimit + balance}
              </p>
            )}
          </div>
          {iconUrl && (
            <Image 
              src={iconUrl} 
              alt={`${name} icon`} 
              width={40} 
              height={40} 
              className="rounded-full"
            />
          )}
        </div>
      </CardContent>
    </Card>
  )
}
