import React, { useState } from 'react'
import { GlobalWasteFootprintMap } from './GlobalWasteFootprintMap'
import { KPIInsightCards } from './KPIInsightCards'
import { SectorLeaderboards } from './SectorLeaderboards'
import { Button } from './ui/button'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { WasteData, Company, KPIMetric, SectorLeaderboard } from '@/types/waste'
import { BarChart3, Globe, Building2, TrendingUp, ArrowLeft } from 'lucide-react'

interface WasteDashboardProps {
  wasteData: WasteData[]
  companyData: Company[]
  kpiMetrics: KPIMetric[]
  sectorLeaderboards: SectorLeaderboard[]
  className?: string
}

type DashboardView = 'overview' | 'company-profile'

export const WasteDashboard: React.FC<WasteDashboardProps> = ({
  wasteData,
  companyData,
  kpiMetrics,
  sectorLeaderboards,
  className
}) => {
  const [currentView, setCurrentView] = useState<DashboardView>('overview')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)

  const selectedCompany = selectedCompanyId 
    ? companyData.find(company => company.id === selectedCompanyId)
    : null

  const handleCompanySelect = (companyId: string) => {
    setSelectedCompanyId(companyId)
    setCurrentView('company-profile')
  }

  const handleBackToOverview = () => {
    setCurrentView('overview')
    setSelectedCompanyId(null)
  }

  if (currentView === 'company-profile' && selectedCompany) {
    return (
      <div className={`space-y-6 ${className || ''}`}>
        {/* Header with Back Button */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button 
                variant="outline" 
                onClick={handleBackToOverview}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
              <Badge variant="outline" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Company Profile
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold">{selectedCompany.company_name}</h3>
              <p className="text-muted-foreground">Company profile coming soon...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Dashboard Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-3xl font-bold flex items-center gap-3">
                <Globe className="h-8 w-8 text-primary" />
                Waste Intelligence Platform
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Global waste management insights, recovery analytics, and sustainability metrics
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Dashboard Overview
              </Badge>
              <Badge variant="secondary">
                {wasteData.length} Countries • {companyData.length} Companies
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* KPI Cards */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Key Performance Indicators
        </h2>
        <KPIInsightCards metrics={kpiMetrics} />
      </div>

      {/* Global Map */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Globe className="h-6 w-6" />
          Global Waste Footprint
        </h2>
        <GlobalWasteFootprintMap data={wasteData} />
      </div>

      {/* Sector Leaderboards */}
      <div>
        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Company Performance Rankings
        </h2>
        <SectorLeaderboards 
          leaderboards={sectorLeaderboards}
          // Note: In a real implementation, you'd pass a callback to handle row clicks
          // onCompanySelect={handleCompanySelect}
        />
      </div>

      {/* Quick Company Access */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Company Profiles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {companyData.slice(0, 6).map((company) => (
              <Button
                key={company.id}
                variant="outline"
                className="p-4 h-auto justify-start"
                onClick={() => handleCompanySelect(company.id)}
              >
                <div className="text-left">
                  <div className="font-medium">{company.company_name}</div>
                  <div className="text-sm text-muted-foreground">
                    {company.country} • {company.sector}
                  </div>
                  <div className="text-sm text-primary mt-1">
                    Company Profile
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}