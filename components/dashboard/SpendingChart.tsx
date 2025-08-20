'use client' // ✅ Added to enable client-side rendering for recharts

// src/components/dashboard/SpendingChart.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { month: 'January', amount: 1200 },
  { month: 'February', amount: 1000 },
  { month: 'March', amount: 1500 },
  { month: 'April', amount: 1300 },
  { month: 'May', amount: 1250 },
  { month: 'June', amount: 1100 },
  { month: 'July', amount: 900 },
  { month: 'August', amount: 1150 }
]

export function SpendingChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="amount" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
