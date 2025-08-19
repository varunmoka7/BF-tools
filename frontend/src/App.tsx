import { useState, useEffect } from 'react'
import { BlackForestDashboard } from './components/BlackForestDashboard'
import { getCompanyData, getWasteData, getSectorLeaderboards } from './services/dataService'
import './globals.css'

function App() {
  const [companyData, setCompanyData] = useState([])
  const [wasteData, setWasteData] = useState([])
  const [sectorLeaderboards, setSectorLeaderboards] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [companies, waste, sectors] = await Promise.all([
          getCompanyData(),
          getWasteData(),
          getSectorLeaderboards()
        ])
        setCompanyData(companies)
        setWasteData(waste)
        setSectorLeaderboards(sectors)
      } catch (error) {
        console.error('Error loading data:', error)
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

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <BlackForestDashboard
          wasteData={wasteData}
          companyData={companyData}
          sectorLeaderboards={sectorLeaderboards}
        />
      </div>
    </div>
  )
}

export default App