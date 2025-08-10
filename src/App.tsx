// React 19 no longer requires explicit React import
// import React from 'react'
// import { WasteDashboard } from './components/WasteDashboard'
import { BlackForestDashboard } from './components/BlackForestDashboard'
import { mockWasteData, mockCompanyData, mockSectorLeaderboards } from './data/mockData'
import './globals.css'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Replace the generic dashboard with BlackForestDashboard for focused BD use-cases */}
        <BlackForestDashboard
          wasteData={mockWasteData}
          companyData={mockCompanyData}
          sectorLeaderboards={mockSectorLeaderboards}
        />
      </div>
    </div>
  )
}

export default App