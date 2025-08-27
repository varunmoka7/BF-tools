'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Recycle,
  BarChart3,
  TrendingUp,
  AlertTriangle
} from 'lucide-react'
import { formatNumber } from '@/lib/utils'

interface WasteMetrics {
  total_waste_generated: number | null;
  total_waste_recovered: number | null;
  total_waste_disposed: number | null;
  recovery_rate: number | null;
  hazardous_waste: {
    generated: number | null;
    recovered: number | null;
    disposed: number | null;
    recovery_rate: number | null;
  };
  non_hazardous_waste: {
    generated: number | null;
    recovered: number | null;
    disposed: number | null;
    recovery_rate: number | null;
  };
  reporting_period: string;
}

interface WasteStream {
  id: string;
  waste_type: string;
  generated: number | null;
  recovered: number | null;
  disposed: number | null;
  hazardousness: 'Hazardous' | 'Non-Hazardous';
  treatment_method: string;
  unit: string;
  data_quality: 'Complete' | 'Partial' | 'Estimated';
  reporting_period: string;
}

interface WasteMetricsDashboardProps {
  metricsData: WasteMetrics[] | null;
  streamsData: {
    groupedByYear: Record<string, WasteStream[]>;
    years: string[];
    latestYear: string;
  } | null;
}

export function WasteMetricsDashboard({ metricsData, streamsData }: WasteMetricsDashboardProps) {
  const [activeTab, setActiveTab] = useState(
    String(metricsData?.[0]?.reporting_period || streamsData?.latestYear || 'latest')
  )

  // Define helper functions first
  const renderMetricsForYear = (year: string) => {
    const yearMetrics = metricsData?.find(m => String(m.reporting_period) === year)
    
    if (!yearMetrics) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No metrics data available for {year}</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Waste Generation */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
            <TrendingUp className="h-4 w-4" />
            Waste Generation
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 font-medium">Total Generated:</span>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">
                  {yearMetrics.total_waste_generated !== null 
                    ? formatNumber(yearMetrics.total_waste_generated)
                    : 'N/A'
                  }
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">tons</div>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 font-medium">Hazardous:</span>
              <div className="text-right">
                <div className="text-lg font-semibold text-red-600">
                  {yearMetrics.hazardous_waste.generated !== null 
                    ? formatNumber(yearMetrics.hazardous_waste.generated)
                    : 'N/A'
                  }
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">tons</div>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 font-medium">Non-Hazardous:</span>
              <div className="text-right">
                <div className="text-lg font-semibold text-blue-600">
                  {yearMetrics.non_hazardous_waste.generated !== null 
                    ? formatNumber(yearMetrics.non_hazardous_waste.generated)
                    : 'N/A'
                  }
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">tons</div>
              </div>
            </div>
          </div>
        </div>

        {/* Recovery & Disposal */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
            <Recycle className="h-4 w-4" />
            Recovery & Disposal
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 font-medium">Total Recovered:</span>
              <div className="text-right">
                <div className="text-lg font-semibold text-green-600">
                  {yearMetrics.total_waste_recovered !== null 
                    ? formatNumber(yearMetrics.total_waste_recovered)
                    : 'N/A'
                  }
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">tons</div>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 font-medium">Total Disposed:</span>
              <div className="text-right">
                <div className="text-lg font-semibold text-red-600">
                  {yearMetrics.total_waste_disposed !== null 
                    ? formatNumber(yearMetrics.total_waste_disposed)
                    : 'N/A'
                  }
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">tons</div>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 font-medium">Overall Recovery Rate:</span>
              <div className="text-right">
                <div className="text-xl font-bold text-green-600">
                  {yearMetrics.recovery_rate !== null ? `${yearMetrics.recovery_rate}%` : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recovery Rates */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-700 flex items-center gap-2 text-sm uppercase tracking-wide">
            <BarChart3 className="h-4 w-4" />
            Recovery Rates
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 font-medium">Hazardous:</span>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {yearMetrics.hazardous_waste.recovery_rate !== null 
                    ? `${yearMetrics.hazardous_waste.recovery_rate}%` 
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 font-medium">Non-Hazardous:</span>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {yearMetrics.non_hazardous_waste.recovery_rate !== null 
                    ? `${yearMetrics.non_hazardous_waste.recovery_rate}%` 
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
            <div className="flex justify-between items-center py-2 mt-6 pt-4 border-t border-gray-100">
              <span className="text-sm text-gray-600 font-medium">Data Quality:</span>
              <Badge variant="outline" className="text-xs font-semibold">Real Data</Badge>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600 font-medium">Reporting Year:</span>
              <Badge variant="secondary" className="text-xs font-semibold">{year}</Badge>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderStreamsForYear = (year: string) => {
    const yearStreams = streamsData?.groupedByYear[year]
    
    if (!yearStreams || yearStreams.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-500">No waste streams data available for {year}</p>
        </div>
      )
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-full table-auto">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-2/5">
                Waste Type
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Generated
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Hazardousness
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                Treatment Method
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Data Quality
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {yearStreams.map((stream) => (
              <tr key={stream.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 w-2/5">
                  <div className="font-medium text-gray-900 leading-5 break-words">
                    {stream.waste_type}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-1/6">
                  <div className="flex flex-col">
                    <span className="text-gray-900 font-medium">
                      {stream.generated !== null ? formatNumber(stream.generated) : 'N/A'}
                    </span>
                    <span className="text-xs text-gray-500">{stream.unit}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-1/6">
                  <Badge 
                    variant={stream.hazardousness === 'Hazardous' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {stream.hazardousness}
                  </Badge>
                </td>
                <td className="px-6 py-4 w-1/4">
                  <div className="text-sm text-gray-900 leading-5 break-words">
                    {stream.treatment_method}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap w-1/6">
                  <Badge 
                    variant={
                      stream.data_quality === 'Complete' ? 'default' : 
                      stream.data_quality === 'Partial' ? 'secondary' : 'outline'
                    }
                    className="text-xs"
                  >
                    {stream.data_quality}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  // If neither data is available, show nothing
  if (!metricsData && !streamsData) {
    return null
  }

  // If only streams data and no metrics, show just streams
  if (!metricsData && streamsData) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detailed Waste Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {streamsData.years.length > 1 ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  {streamsData.years.slice(0, 4).map((year) => (
                    <TabsTrigger key={year} value={year} className="text-sm">
                      {year}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {streamsData.years.map((year) => (
                  <TabsContent key={year} value={year} className="mt-6">
                    {renderStreamsForYear(year)}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              renderStreamsForYear(streamsData.years[0] || streamsData.latestYear)
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get available years from metrics data only (for metrics-only display)
  const availableYears = Array.from(new Set([
    ...(metricsData?.map(m => String(m.reporting_period)) || [])
  ])).sort((a, b) => b.localeCompare(a))

  // If only metrics data and no streams, show just metrics
  if (metricsData && !streamsData) {
    return (
      <div className="space-y-6">
        <Card className="min-h-[400px]">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
              <Recycle className="h-5 w-5" />
              Waste Management Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0 pb-6">
            {availableYears.length > 1 ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  {availableYears.slice(0, 4).map((year) => (
                    <TabsTrigger key={year} value={year} className="text-sm">
                      {year}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {availableYears.map((year) => (
                  <TabsContent key={year} value={year} className="mt-6">
                    {renderMetricsForYear(year)}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              renderMetricsForYear(availableYears[0] || 'latest')
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // If both data available, show both (original behavior)
  const allAvailableYears = Array.from(new Set([
    ...(metricsData?.map(m => String(m.reporting_period)) || []),
    ...(streamsData?.years || [])
  ])).sort((a, b) => b.localeCompare(a))

  return (
    <div className="space-y-6">
      {/* Multi-Year Waste Metrics */}
      <Card className="min-h-[400px]">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-lg font-bold text-gray-900">
            <Recycle className="h-5 w-5" />
            Waste Management Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-6">
          {allAvailableYears.length > 1 ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                {allAvailableYears.slice(0, 4).map((year) => (
                  <TabsTrigger key={year} value={year} className="text-sm">
                    {year}
                  </TabsTrigger>
                ))}
              </TabsList>
              {allAvailableYears.map((year) => (
                <TabsContent key={year} value={year} className="mt-6">
                  {renderMetricsForYear(year)}
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            renderMetricsForYear(allAvailableYears[0] || 'latest')
          )}
        </CardContent>
      </Card>

      {/* Detailed Waste Streams */}
      {streamsData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Detailed Waste Streams
            </CardTitle>
          </CardHeader>
          <CardContent>
            {streamsData.years.length > 1 ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
                  {streamsData.years.slice(0, 4).map((year) => (
                    <TabsTrigger key={year} value={year} className="text-sm">
                      {year}
                    </TabsTrigger>
                  ))}
                </TabsList>
                {streamsData.years.map((year) => (
                  <TabsContent key={year} value={year} className="mt-6">
                    {renderStreamsForYear(year)}
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              renderStreamsForYear(streamsData.years[0] || streamsData.latestYear)
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}