"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard-layout';
import { WasteService } from '@/services/waste-service';
import { CompanyWithMetrics, CompanyQueryParams, PaginatedResponse } from '@/types/waste';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react';

export default function CompaniesPage() {
  const router = useRouter();
  const [companiesData, setCompaniesData] = useState<PaginatedResponse<CompanyWithMetrics> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{
    key: CompanyQueryParams['sortBy'];
    direction: 'asc' | 'desc';
  }>({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const loadCompanies = async (params?: CompanyQueryParams) => {
    setLoading(true);
    try {
      const data = await WasteService.getCompaniesWithMetrics({
        search: searchTerm,
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        page: currentPage,
        limit: pageSize,
        ...params,
      });
      setCompaniesData(data);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sortConfig, currentPage]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSort = (key: CompanyQueryParams['sortBy']) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleCompanyClick = (companyId: string) => {
    router.push(`/company/${companyId}`);
  };

  const getSortIcon = (columnKey: CompanyQueryParams['sortBy']) => {
    if (sortConfig.key !== columnKey) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const formatWasteAmount = (amount?: number) => {
    if (!amount) return 'N/A';
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(1)}M kg`;
    }
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K kg`;
    }
    return `${amount.toLocaleString()} kg`;
  };

  const formatRecoveryRate = (rate?: number) => {
    if (!rate) return 'N/A';
    return `${rate.toFixed(1)}%`;
  };

  const getSizeBadgeVariant = (size: string) => {
    switch (size) {
      case 'large':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'small':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const totalPages = companiesData?.totalPages || 0;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  if (loading && !companiesData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading companies...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Company Directory</h2>
            <p className="text-muted-foreground">
              Browse and analyze waste management performance across companies
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Search & Filter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search companies..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-1 hidden sm:block">
                  Search by name, industry, sector, or location
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                Companies ({companiesData?.total || 0})
              </CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, companiesData?.total || 0)} of {companiesData?.total || 0}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('name')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Company Name
                        {getSortIcon('name')}
                      </Button>
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">Country</TableHead>
                    <TableHead className="hidden md:table-cell">Sector</TableHead>
                    <TableHead className="hidden lg:table-cell">Industry</TableHead>
                    <TableHead className="hidden sm:table-cell">Size</TableHead>
                    <TableHead className="hidden md:table-cell">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('created_at')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Latest Year
                        {getSortIcon('created_at')}
                      </Button>
                    </TableHead>
                    <TableHead className="min-w-[120px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('total_waste')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Total Waste
                        {getSortIcon('total_waste')}
                      </Button>
                    </TableHead>
                    <TableHead className="min-w-[140px]">
                      <Button
                        variant="ghost"
                        onClick={() => handleSort('recycling_rate')}
                        className="h-auto p-0 font-medium hover:bg-transparent"
                      >
                        Recovery Rate
                        {getSortIcon('recycling_rate')}
                      </Button>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companiesData?.data.map((company) => (
                    <TableRow
                      key={company.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleCompanyClick(company.id)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span className="font-semibold text-primary hover:underline">
                            {company.name}
                          </span>
                          <div className="text-xs text-muted-foreground space-y-1">
                            <div>{company.location}</div>
                            <div className="sm:hidden flex items-center gap-2">
                              <Badge variant={getSizeBadgeVariant(company.size)} className="text-xs">
                                {company.size.charAt(0).toUpperCase() + company.size.slice(1)}
                              </Badge>
                              {company.country && (
                                <span>{company.country}</span>
                              )}
                            </div>
                            <div className="md:hidden">
                              <span>{company.sector || company.industry}</span>
                              {company.latest_year && (
                                <span className="ml-2">• {company.latest_year}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <span className="font-medium">
                          {company.country || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="text-sm">
                          {company.sector || company.industry}
                        </span>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <span className="text-sm">
                          {company.industry}
                        </span>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge variant={getSizeBadgeVariant(company.size)}>
                          {company.size.charAt(0).toUpperCase() + company.size.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <span className="font-mono">
                          {company.latest_year || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">
                          {formatWasteAmount(company.total_waste)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          <span className="font-mono text-sm">
                            {formatRecoveryRate(company.recovery_rate)}
                          </span>
                          {company.recovery_rate && (
                            <div className="w-12 sm:w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${Math.min(company.recovery_rate, 100)}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-4">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center gap-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={!canGoPrevious}
                  >
                    <ChevronLeft className="h-4 w-4 sm:mr-1" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  <div className="text-sm text-muted-foreground px-2 sm:hidden">
                    {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!canGoNext}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4 sm:ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {companiesData?.data.length === 0 && (
              <div className="text-center py-12">
                <div className="text-lg font-medium text-muted-foreground">No companies found</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search criteria or clear the filters
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}