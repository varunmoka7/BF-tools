import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { BlackForestDashboard } from './components/BlackForestDashboard'
import { CompanyDetailPage } from './components/CompanyDetailPage'
import { supabaseService } from './services/supabaseService'
import { Company, WasteData, SectorLeaderboard } from '@/types/waste'
import './globals.css'

function App() {
  const [companyData, setCompanyData] = useState<Company[]>([])
  const [wasteData, setWasteData] = useState<WasteData[]>([])
  const [sectorLeaderboards, setSectorLeaderboards] = useState<SectorLeaderboard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🚀 Starting to load data...')
        setLoading(true)
        
        console.log('📊 Fetching companies...')
        const companies = await supabaseService.getCompanies()
        console.log('✅ Companies loaded:', companies)
        
        console.log('🗑️ Fetching waste data...')
        const waste = await supabaseService.getWasteData()
        console.log('✅ Waste data loaded:', waste)
        
        console.log('🏆 Fetching sector leaderboards...')
        const sectors = await supabaseService.getSectorLeaderboards()
        console.log('✅ Sectors loaded:', sectors)
        
        setCompanyData(companies.data || [])
        setWasteData(waste)
        setSectorLeaderboards(sectors)
        
        console.log('🎉 All data loaded successfully!')
      } catch (error) {
        console.error('❌ Error loading data:', error)
        setError(error instanceof Error ? error.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-lg">Loading company data...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="min-h-screen bg-background">
        <Routes>
          <Route path="/" element={
            <div className="container mx-auto px-4 py-8">
              <BlackForestDashboard
                wasteData={wasteData}
                companyData={companyData}
                sectorLeaderboards={sectorLeaderboards}
              />
            </div>
          } />
          <Route path="/company/:id" element={<CompanyDetailPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App