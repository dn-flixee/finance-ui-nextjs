// src/components/dashboard/RecentTransactions.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { Expense, Income, Transfer } from '@/lib/types' // Assuming types

type Transaction = Expense | Income | Transfer & { type: 'expense' | 'income' | 'transfer' }

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {transactions.map((transaction) => {
            const type = transaction.type || (transaction.amount > 0 ? 'income' : 'expense')
            const color = 
              type === 'income' ? 'text-green-500' : 
              type === 'expense' ? 'text-red-500' : 
              'text-blue-500'

            return (
              <div key={transaction.id} className="flex items-center justify-between border-b py-2">
                <div className="flex items-center space-x-4">
                  {transaction.iconUrl && (
                    <Image 
                      src={transaction.iconUrl} 
                      alt="Transaction icon" 
                      width={24} 
                      height={24} 
                      className="rounded-full"
                    />
                  )}
                  <div>
                    <p className="font-medium">{transaction.name}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-medium ${color}`}>
                    {type === 'income' ? '+' : '-'} ${Math.abs(transaction.amount).toFixed(2)}
                  </p>
                  <Badge variant="outline">{type}</Badge>
                </div>
              </div>
            )
          })}
          {transactions.length === 0 && (
            <p className="text-center text-gray-500">No recent transactions</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
