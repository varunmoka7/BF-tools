import { DashboardHeader } from '@/components/dashboard/dashboard-header'
import { KPICards } from '@/components/dashboard/kpi-cards'
import { GlobalWasteMap } from '@/components/maps/global-waste-map'
import { WasteDataTable } from '@/components/tables/waste-data-table'
import { ChartsSection } from '@/components/charts/charts-section'

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <DashboardHeader />
      
      {/* KPI Overview */}
      <KPICards />
      
      {/* Global Waste Map */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Global Waste Distribution</h2>
        <GlobalWasteMap />
      </div>
      
      {/* Charts Section */}
      <ChartsSection />
      
      {/* Companies Data Table */}
      <div className="bg-white rounded-lg p-6 shadow-sm border">
        <h2 className="text-xl font-semibold mb-4">Waste Management Companies</h2>
        <WasteDataTable />
      </div>
    </div>
  )
}