'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { WasteService } from '@/services/waste-service';
import { CompanyDetailed, WasteStream } from '@/types/waste';
import { DashboardLayout } from '@/components/dashboard-layout';
import { 
  ArrowUpIcon, 
  ArrowDownIcon, 
  TrendingUpIcon, 
  RecycleIcon, 
  TrashIcon, 
  UsersIcon, 
  ExternalLinkIcon,
  MapPinIcon,
  BuildingIcon,
  CalendarIcon
} from 'lucide-react';

interface ChartData {
  month: string;
  generated: number;
  disposed: number;
  recovered: number;
}

interface DonutData {
  name: string;
  value: number;
  color: string;
}

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params?.id as string;

  const [company, setCompany] = useState<CompanyDetailed | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (companyId) {
      fetchCompanyData();
    }
  }, [companyId]);

  const fetchCompanyData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await WasteService.getCompanyById(companyId);
      if (data) {
        setCompany(data);
      } else {
        setError('Company not found');
      }
    } catch (err) {
      console.error('Error fetching company data:', err);
      setError('Failed to load company data');
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = (wasteStreams: WasteStream[]): ChartData[] => {
    const monthlyData = new Map<string, { generated: number; disposed: number; recovered: number }>();

    wasteStreams.forEach(stream => {
      const month = new Date(stream.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyData.has(month)) {
        monthlyData.set(month, { generated: 0, disposed: 0, recovered: 0 });
      }
      
      const data = monthlyData.get(month)!;
      data.generated += stream.quantity;
      
      if (stream.disposal_method?.toLowerCase().includes('recycle') || 
          stream.disposal_method?.toLowerCase().includes('reuse') ||
          stream.disposal_method?.toLowerCase().includes('compost')) {
        data.recovered += stream.quantity;
      } else {
        data.disposed += stream.quantity;
      }
    });

    return Array.from(monthlyData.entries())
      .map(([month, data]) => ({
        month,
        ...data
      }))
      .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
      .slice(-12); // Last 12 months
  };

  const generateDonutData = (wasteStreams: WasteStream[]): DonutData[] => {
    const totalWaste = wasteStreams.reduce((sum, stream) => sum + stream.quantity, 0);
    const recoveredWaste = wasteStreams
      .filter(stream => 
        stream.disposal_method?.toLowerCase().includes('recycle') || 
        stream.disposal_method?.toLowerCase().includes('reuse') ||
        stream.disposal_method?.toLowerCase().includes('compost')
      )
      .reduce((sum, stream) => sum + stream.quantity, 0);
    
    const disposedWaste = totalWaste - recoveredWaste;

    return [
      { name: 'Recovered', value: recoveredWaste, color: 'hsl(var(--chart-2))' },
      { name: 'Disposed', value: disposedWaste, color: 'hsl(var(--chart-1))' }
    ];
  };

  const formatNumber = (num: number, unit?: string) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M${unit ? ` ${unit}` : ''}`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K${unit ? ` ${unit}` : ''}`;
    }
    return `${num.toLocaleString()}${unit ? ` ${unit}` : ''}`;
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="h-80 bg-gray-200 rounded"></div>
              <div className="h-80 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !company) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <TrashIcon className="h-12 w-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {error || 'Company not found'}
              </h2>
              <p className="text-gray-600 mb-4">
                We couldn&apos;t load the company information. Please try again.
              </p>
              <Button onClick={fetchCompanyData}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const chartData = generateChartData(company.waste_streams || []);
  const donutData = generateDonutData(company.waste_streams || []);
  const recoveryRate = company.metrics?.recycling_rate || 0;
  const totalWaste = company.metrics?.total_waste || 0;
  const wastePerEmployee = company.employee_count ? 
    Math.round(totalWaste / company.employee_count) : 0;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Company Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <BuildingIcon className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-gray-600">
              <div className="flex items-center gap-1">
                <MapPinIcon className="h-4 w-4" />
                <span>{company.location}</span>
              </div>
              <Badge variant="secondary">{company.industry}</Badge>
              <Badge variant="outline" className="capitalize">{company.size}</Badge>
              {company.employee_count && (
                <div className="flex items-center gap-1">
                  <UsersIcon className="h-4 w-4" />
                  <span>{company.employee_count.toLocaleString()} employees</span>
                </div>
              )}
            </div>
            {company.description && (
              <p className="text-gray-700 mt-3 max-w-2xl">{company.description}</p>
            )}
          </div>
          <div className="flex gap-2">
            {company.website && (
              <Button variant="outline" size="sm" asChild>
                <a href={company.website} target="_blank" rel="noopener noreferrer">
                  <ExternalLinkIcon className="h-4 w-4 mr-2" />
                  Website
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* KPI Scorecards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Waste Generated</CardTitle>
              <TrashIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(totalWaste, 'kg')}</div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <TrendingUpIcon className="h-3 w-3 mr-1" />
                <span>Last 12 months</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recovery Rate</CardTitle>
              <RecycleIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recoveryRate.toFixed(1)}%</div>
              <div className="flex items-center text-xs mt-1">
                {recoveryRate >= 75 ? (
                  <ArrowUpIcon className="h-3 w-3 mr-1 text-green-600" />
                ) : (
                  <ArrowDownIcon className="h-3 w-3 mr-1 text-red-600" />
                )}
                <span className={recoveryRate >= 75 ? 'text-green-600' : 'text-red-600'}>
                  {recoveryRate >= 75 ? 'Excellent' : 'Needs improvement'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waste per Employee</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {wastePerEmployee > 0 ? formatNumber(wastePerEmployee, 'kg') : 'N/A'}
              </div>
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                <CalendarIcon className="h-3 w-3 mr-1" />
                <span>Annual average</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Historical Trend Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Waste Generation Trends</CardTitle>
              <CardDescription>
                Monthly waste generation vs disposal over the last 12 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="month" 
                      fontSize={12}
                      tickMargin={8}
                      axisLine={false}
                    />
                    <YAxis 
                      fontSize={12}
                      tickMargin={8}
                      axisLine={false}
                      tickFormatter={(value) => formatNumber(value)}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [
                        `${formatNumber(value, 'kg')}`,
                        name.charAt(0).toUpperCase() + name.slice(1)
                      ]}
                      labelStyle={{ color: 'hsl(var(--foreground))' }}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar 
                      dataKey="generated" 
                      name="Generated"
                      fill="hsl(var(--chart-1))"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="disposed" 
                      name="Disposed"
                      fill="hsl(var(--chart-3))"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="recovered" 
                      name="Recovered"
                      fill="hsl(var(--chart-2))"
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Donut Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Waste Recovery Overview</CardTitle>
              <CardDescription>
                Distribution of recovered vs disposed waste
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => [formatNumber(value, 'kg'), 'Amount']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {recoveryRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Recovery Rate</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Metrics Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Waste Stream Activity</CardTitle>
            <CardDescription>
              Detailed breakdown of recent waste management activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableCaption>
                Showing {company.recent_activity?.length || 0} most recent waste stream records
              </TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Waste Type</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Disposal Method</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {company.recent_activity?.map((stream) => (
                  <TableRow key={stream.id}>
                    <TableCell className="font-medium">
                      {new Date(stream.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{stream.waste_type}</Badge>
                    </TableCell>
                    <TableCell>{stream.location}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(stream.quantity)} {stream.unit}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          stream.disposal_method?.toLowerCase().includes('recycle') ||
                          stream.disposal_method?.toLowerCase().includes('reuse') ||
                          stream.disposal_method?.toLowerCase().includes('compost')
                            ? 'default' 
                            : 'secondary'
                        }
                      >
                        {stream.disposal_method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(stream.cost)}
                    </TableCell>
                    <TableCell>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          // Mock action - in real app would open document or link
                          alert(`View source document for ${stream.waste_type} waste stream`);
                        }}
                      >
                        <ExternalLinkIcon className="h-4 w-4 mr-2" />
                        View Source
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {(!company.recent_activity || company.recent_activity.length === 0) && (
              <div className="text-center py-12">
                <TrashIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No recent activity</h3>
                <p className="text-gray-600">
                  No waste stream data available for this company.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Metrics Section */}
        {company.metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {company.metrics.waste_diversion_rate !== undefined && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Waste Diversion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {company.metrics.waste_diversion_rate.toFixed(1)}%
                  </div>
                </CardContent>
              </Card>
            )}
            
            {company.metrics.compliance_score !== undefined && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {company.metrics.compliance_score.toFixed(1)}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {company.metrics.sustainability_score !== undefined && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Sustainability Score</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {company.metrics.sustainability_score.toFixed(1)}
                  </div>
                </CardContent>
              </Card>
            )}
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(company.metrics.cost_savings)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}