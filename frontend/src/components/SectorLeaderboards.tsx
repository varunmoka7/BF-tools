import React, { useState, useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { SectorLeaderboard, PerformanceRating } from '@/types/waste'
import { formatNumber, formatPercentage, getPerformanceColor } from '@/lib/utils'
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Search, 
  Filter,
  Trophy,
  TrendingUp,
  BarChart3,
  Globe
} from 'lucide-react'

interface SectorLeaderboardsProps {
  leaderboards: SectorLeaderboard[]
  className?: string
}

type SortField = 'name' | 'recoveryRate' | 'wasteVolume' | 'improvementTrend' | 'marketShare'
type SortDirection = 'asc' | 'desc'

const SectorLeaderboards: React.FC<SectorLeaderboardsProps> = ({ leaderboards, className }) => {
  const [selectedSector, setSelectedSector] = useState<string>(leaderboards[0]?.sector || '')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortField, setSortField] = useState<SortField>('recoveryRate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filterRating, setFilterRating] = useState<PerformanceRating | 'all'>('all')

  const currentLeaderboard = leaderboards.find(board => board.sector === selectedSector)

  const filteredAndSortedCompanies = useMemo(() => {
    if (!currentLeaderboard) return []

    let companies = [...currentLeaderboard.companies]

    // Apply search filter
    if (searchTerm) {
      companies = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.country.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply rating filter
    if (filterRating !== 'all') {
      companies = companies.filter(company => company.performanceRating === filterRating)
    }

    // Apply sorting
    companies.sort((a, b) => {
      let aValue: number | string = a[sortField]
      let bValue: number | string = b[sortField]

      if (sortField === 'name') {
        aValue = (aValue as string).toLowerCase()
        bValue = (bValue as string).toLowerCase()
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    return companies
  }, [currentLeaderboard, searchTerm, filterRating, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 1:
        return <Trophy className="h-5 w-5 text-gray-400" />
      case 2:
        return <Trophy className="h-5 w-5 text-amber-600" />
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">
          {index + 1}
        </span>
    }
  }

  if (!currentLeaderboard) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No leaderboard data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-col space-y-4">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Sector Leaderboards
          </CardTitle>
          
          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Sector Selection */}
            <Select value={selectedSector} onValueChange={setSelectedSector}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Select sector" />
              </SelectTrigger>
              <SelectContent>
                {leaderboards.map((board) => (
                  <SelectItem key={board.sector} value={board.sector}>
                    {board.sector}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search companies or countries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Performance Filter */}
            <Select 
              value={filterRating} 
              onValueChange={(value: PerformanceRating | 'all') => setFilterRating(value)}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Performance</SelectItem>
                <SelectItem value="leader">Leaders</SelectItem>
                <SelectItem value="average">Average</SelectItem>
                <SelectItem value="hotspot">Hotspots</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-2 font-medium">#</th>
                <th className="text-left py-3 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('name')}
                    className="h-auto p-0 font-medium"
                  >
                    Company
                    {getSortIcon('name')}
                  </Button>
                </th>
                <th className="text-left py-3 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('recoveryRate')}
                    className="h-auto p-0 font-medium"
                  >
                    Recovery Rate
                    {getSortIcon('recoveryRate')}
                  </Button>
                </th>
                <th className="text-left py-3 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('wasteVolume')}
                    className="h-auto p-0 font-medium"
                  >
                    Waste Volume
                    {getSortIcon('wasteVolume')}
                  </Button>
                </th>
                <th className="text-left py-3 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('improvementTrend')}
                    className="h-auto p-0 font-medium"
                  >
                    Trend
                    {getSortIcon('improvementTrend')}
                  </Button>
                </th>
                <th className="text-left py-3 px-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSort('marketShare')}
                    className="h-auto p-0 font-medium"
                  >
                    Market Share
                    {getSortIcon('marketShare')}
                  </Button>
                </th>
                <th className="text-left py-3 px-2">Performance</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCompanies.map((company, index) => (
                <tr 
                  key={company.id} 
                  className="border-b hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-2">
                    {getRankIcon(index)}
                  </td>
                  <td className="py-4 px-2">
                    <div className="space-y-1">
                      <div className="font-medium">{company.name}</div>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Globe className="h-3 w-3 mr-1" />
                        {company.country}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">
                        {formatPercentage(company.recoveryRate)}
                      </div>
                      <div className={`h-2 w-16 rounded-full ${
                        company.recoveryRate >= 80 ? 'bg-green-500' :
                        company.recoveryRate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`} />
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="font-medium">
                      {formatNumber(company.wasteVolume, { compact: true, unit: ' tons' })}
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className={`flex items-center gap-1 ${
                      company.improvementTrend > 0 ? 'text-green-600' :
                      company.improvementTrend < 0 ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      <TrendingUp className={`h-4 w-4 ${
                        company.improvementTrend < 0 ? 'rotate-180' : ''
                      }`} />
                      <span className="font-medium">
                        {company.improvementTrend > 0 ? '+' : ''}{formatPercentage(company.improvementTrend)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <div className="font-medium">
                      {formatPercentage(company.marketShare)}
                    </div>
                  </td>
                  <td className="py-4 px-2">
                    <Badge 
                      variant={
                        company.performanceRating === 'leader' ? 'success' :
                        company.performanceRating === 'average' ? 'warning' : 'danger'
                      }
                      className={`${getPerformanceColor(company.performanceRating)} capitalize`}
                    >
                      {company.performanceRating}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSortedCompanies.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No companies match your current filters
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { SectorLeaderboards }