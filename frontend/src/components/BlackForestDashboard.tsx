import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs'
import { 
  Building2, 
  Target, 
  AlertTriangle, 
  DollarSign,
  Shield,
  BarChart3,
  Globe,
  Map,
  ArrowRight
} from 'lucide-react'
import { WasteData, Company, SectorLeaderboard } from '@/types/waste'
import TopWasteCompanies from './TopWasteCompanies'

interface BlackForestDashboardProps {
  wasteData: WasteData[]
  companyData: Company[]
  sectorLeaderboards: SectorLeaderboard[]
  className?: string
}

type LeadPriority = 'high' | 'medium' | 'low'

interface LeadOpportunity {
  companyId: string
  companyName: string
  country: string
  sector: string
  priority: LeadPriority
  opportunityValue: number
  recoveryRateGap: number
  complianceRisk: 'high' | 'medium' | 'low'
  nextAction: string
}

export const BlackForestDashboard: React.FC<BlackForestDashboardProps> = ({
  wasteData,
  companyData,
  sectorLeaderboards,
  className
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>('all')
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('leads')

  // Generate lead opportunities based on data analysis
  const leadOpportunities: LeadOpportunity[] = useMemo(() => {
    return companyData.map(company => {
      // For now, use mock data since we don't have recovery rates in the Company type yet
      const mockRecoveryRate = Math.random() * 40 + 30 // 30-70% range
      const recoveryRateGap = 85 - mockRecoveryRate // Target 85% recovery rate
      
      let priority: LeadPriority = 'low'
      if (recoveryRateGap > 30) priority = 'high'
      else if (recoveryRateGap > 15) priority = 'medium'
      
      let complianceRisk: 'high' | 'medium' | 'low' = 'low'
      if (mockRecoveryRate < 50) complianceRisk = 'high'
      else if (mockRecoveryRate < 70) complianceRisk = 'medium'
      
      // Mock waste data for opportunity calculation
      const mockWasteGenerated = Math.random() * 20000 + 5000 // 5k-25k tonnes
      const opportunityValue = Math.round(
        (recoveryRateGap * mockWasteGenerated * 0.15) / 1000
      ) // €150/tonne improvement potential
      
      return {
        companyId: company.id,
        companyName: company.company_name,
        country: company.country,
        sector: company.sector,
        priority,
        opportunityValue,
        recoveryRateGap,
        complianceRisk,
        nextAction: priority === 'high' ? 'Immediate outreach' : 
                   priority === 'medium' ? 'Schedule meeting' : 'Add to nurture campaign'
      }
    }).sort((a, b) => b.opportunityValue - a.opportunityValue)
  }, [companyData])

  // Filter opportunities based on selections
  const filteredOpportunities = useMemo(() => {
    return leadOpportunities.filter(opportunity => {
      const countryMatch = selectedCountry === 'all' || opportunity.country === selectedCountry
      const sectorMatch = selectedSector === 'all' || opportunity.sector === selectedSector
      const searchMatch = opportunity.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opportunity.country.toLowerCase().includes(searchQuery.toLowerCase())
      return countryMatch && sectorMatch && searchMatch
    })
  }, [leadOpportunities, selectedCountry, selectedSector, searchQuery])

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Dashboard Header - match previous design style */}
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Priority Leads</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredOpportunities.filter(opp => opp.priority === 'high').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Pipeline Value</p>
                <p className="text-2xl font-bold text-green-600">
                  €{Math.round(filteredOpportunities.reduce((sum, opp) => sum + opp.opportunityValue, 0))}M
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Countries Covered</p>
                <p className="text-2xl font-bold text-blue-600">
                  {new Set(filteredOpportunities.map(opp => opp.country)).size}
                </p>
              </div>
              <Globe className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Sectors Active</p>
                <p className="text-2xl font-bold text-purple-600">
                  {new Set(filteredOpportunities.map(opp => opp.sector)).size}
                </p>
              </div>
              <Building2 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="leads" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Lead Generation
          </TabsTrigger>
          <TabsTrigger value="competitive" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Competitive Intel
          </TabsTrigger>
          <TabsTrigger value="geographic" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Geographic Strategy
          </TabsTrigger>
          <TabsTrigger value="waste-ranking" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Top Waste Companies
          </TabsTrigger>
        </TabsList>

        {/* Lead Generation Tab */}
        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <CardTitle className="text-xl font-semibold">Lead Opportunities</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Companies with high waste optimization potential
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Search companies..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64"
                  />
                  <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Countries</SelectItem>
                      {Array.from(new Set(leadOpportunities.map(opp => opp.country))).map(country => (
                        <SelectItem key={country} value={country}>{country}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedSector} onValueChange={setSelectedSector}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Sector" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Sectors</SelectItem>
                      {Array.from(new Set(leadOpportunities.map(opp => opp.sector))).map(sector => (
                        <SelectItem key={sector} value={sector}>{sector}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredOpportunities.slice(0, 20).map((opportunity) => (
                  <div key={opportunity.companyId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={opportunity.priority === 'high' ? 'destructive' : 
                                   opportunity.priority === 'medium' ? 'secondary' : 'outline'}
                          >
                            {opportunity.priority.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {opportunity.complianceRisk}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{opportunity.companyName}</h3>
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>{opportunity.country}</span>
                        <span>•</span>
                        <span>{opportunity.sector}</span>
                        <span>•</span>
                        <span className="text-red-600">
                          Recovery Gap: {opportunity.recoveryRateGap.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        €{opportunity.opportunityValue}M
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {opportunity.nextAction}
                      </div>
                    </div>
                    <Link to={`/company/${opportunity.companyId}`}>
                      <Button variant="outline" size="sm" className="ml-4">
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Competitive Intelligence Tab */}
        <TabsContent value="competitive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Sector Performance Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Recovery rates by sector - identify market gaps
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sectorLeaderboards.map((sector) => {
                  const avgRecoveryRate = sector.companies.reduce((sum, company) => sum + company.recoveryRate, 0) / sector.companies.length
                  const opportunityScore = Math.round((85 - avgRecoveryRate) * sector.companies.length * 0.1)
                  
                  return (
                    <div key={sector.sector} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{sector.sector}</h4>
                        <p className="text-sm text-muted-foreground">
                          {sector.companies.length} companies
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          {avgRecoveryRate.toFixed(1)}%
                        </div>
                        <div className="text-sm text-green-600">
                          €{opportunityScore}M opportunity
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Geographic Strategy Tab */}
        <TabsContent value="geographic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Country Market Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Geographic expansion opportunities by market size
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wasteData.map((country) => (
                  <div key={country.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{country.country}</h4>
                      <p className="text-sm text-muted-foreground">
                        Recovery Rate: {country.recoveryRate.toFixed(1)}%
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        €{Math.round(country.marketOpportunity)}M
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Market Opportunity
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Top Waste Companies Tab */}
        <TabsContent value="waste-ranking" className="space-y-4">
          <TopWasteCompanies companyData={companyData} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
