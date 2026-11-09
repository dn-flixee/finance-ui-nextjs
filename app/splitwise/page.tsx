import NavBar from '@/components/NavBar'
import SplitwiseDashboard from '@/components/splitwise/SplitwiseDashboard'

export default function SplitwisePage() {
  return (
    <>
      <NavBar />
      <div className="min-h-screen bg-gray-900 text-white">
        <SplitwiseDashboard />
      </div>
    </>
  )
}
