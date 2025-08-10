import React from 'react'
import { WasteDashboard } from './components/WasteDashboard'
import { mockWasteData, mockCompanyData, mockKPIMetrics, mockSectorLeaderboards } from './data/mockData'
import './globals.css'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <WasteDashboard
          wasteData={mockWasteData}
          companyData={mockCompanyData}
          kpiMetrics={mockKPIMetrics}
          sectorLeaderboards={mockSectorLeaderboards}
        />
      </div>
    </div>
  )
}

export default App