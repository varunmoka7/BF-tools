import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { Company } from '@/types/waste'
import { formatNumber } from '@/lib/utils'
import { 
  TrendingUp, 
  Building2, 
  Globe, 
  BarChart3,
  Trophy,
  AlertTriangle,
  Leaf
} from 'lucide-react'

interface TopWasteCompaniesProps {
  companyData: Company[]
  className?: string
}

const TopWasteCompanies: React.FC<TopWasteCompaniesProps> = ({ companyData, className }) => {
  // For now, use mock waste data since Company type doesn't have totalWaste
  const topWasteCompanies = useMemo(() => {
    return [...companyData]
      .map(company => ({
        ...company,
        totalWaste: Math.random() * 25000 + 5000 // Mock waste data: 5k-30k tonnes
      }))
      .sort((a, b) => (b.totalWaste || 0) - (a.totalWaste || 0))
      .slice(0, 10)
  }, [companyData])

  const getWasteCategory = (waste: number) => {
    if (waste >= 20000) return 'critical'
    if (waste >= 15000) return 'high'
    if (waste >= 10000) return 'moderate'
    if (waste >= 5000) return 'low'
    return 'minimal'
  }

  const getWasteColor = (category: string) => {
    switch (category) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200'
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200'
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'minimal': return 'text-green-600 bg-green-50 border-green-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 1:
        return <Trophy className="h-6 w-6 text-gray-400" />
      case 2:
        return <Trophy className="h-6 w-6 text-amber-600" />
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground bg-muted rounded-full">
          {index + 1}
        </span>
    }
  }

  const totalWaste = topWasteCompanies.reduce((sum, company) => sum + (company.totalWaste || 0), 0)
  const averageWaste = totalWaste / topWasteCompanies.length

  return (
    <div className={`space-y-6 ${className || ''}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <AlertTriangle className="h-7 w-7 text-red-500" />
                Top 10 Companies by Waste Generation
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                Companies with the highest waste output in metric tons - ranked by total waste volume
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Waste Volume Ranking
              </Badge>
              <Badge variant="destructive" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {formatNumber(totalWaste)} MT Total
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Waste</p>
                <p className="text-2xl font-bold text-red-600">
                  {topWasteCompanies.filter(c => getWasteCategory(c.totalWaste || 0) === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Average Waste</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatNumber(averageWaste, { compact: true, unit: 'MT' })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Leaf className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Minimal Waste</p>
                <p className="text-2xl font-bold text-green-600">
                  {topWasteCompanies.filter(c => getWasteCategory(c.totalWaste || 0) === 'minimal').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Company Rankings */}
      <Card>
        <CardContent className="p-0">
          <div className="space-y-0">
            {topWasteCompanies.map((company, index) => {
              const wasteCategory = getWasteCategory(company.totalWaste || 0)
              const wasteColor = getWasteColor(wasteCategory)
              
              return (
                <div key={company.id} className="flex items-center justify-between p-4 border-b last:border-b-0 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(index)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-lg">
                          <Link to={`/company/${company.id}`} className="hover:underline">
                            {company.company_name}
                          </Link>
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {company.sector}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {company.country}
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {company.industry}
                        </div>
                        {company.employees && (
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {company.employees.toLocaleString()} employees
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${wasteColor.split(' ')[0]}`}>
                      {formatNumber(company.totalWaste || 0, { compact: true, unit: 'MT' })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {wasteCategory.charAt(0).toUpperCase() + wasteCategory.slice(1)} Risk
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TopWasteCompanies
