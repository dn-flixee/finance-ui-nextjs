import SplitwiseDashboard from '@/components/splitwise/SplitwiseDashboard'
import { SplitwiseSync } from '@/components/splitwise/SplitwiseSync'


export default function SplitwisePage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Splitwise Integration</h1>
          <p className="text-gray-600">Manage your shared expenses from Splitwise</p>
        </div>
      </div>

      <SplitwiseSync />
      <SplitwiseDashboard />
    </div>
  )
}