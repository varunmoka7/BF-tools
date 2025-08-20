import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { ChartsSection } from '@/components/charts/charts-section'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader />
        
        <div className="mt-8 space-y-8">
          <KPICards />
          <ChartsSection />
        </div>
      </div>
    </div>
  )
}