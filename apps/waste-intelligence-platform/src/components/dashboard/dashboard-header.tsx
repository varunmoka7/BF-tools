'use client'

import { Button } from '@/components/ui/button'
import { Download, RefreshCcw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export function DashboardHeader() {
  const { toast } = useToast()
  
  const handleRefresh = () => {
    window.location.reload()
  }

  const handleExport = async () => {
    try {
      toast({
        title: 'Exporting data...',
        description: 'Please wait while we prepare your CSV file.',
      })
      
      const response = await fetch('/api/waste-data');
      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }
      
      const result = await response.json()
      const data = result.data || result // Handle both new and old API structure
      
      if (!data || data.length === 0) {
        toast({
          title: 'No data to export',
          description: 'There is no data available to export.',
          variant: 'destructive',
        })
        return
      }
      
      // Create CSV content
      const headers = ['Name', 'Country', 'Region', 'Waste Type', 'Annual Volume', 'Recycling Rate', 'Compliance Score', 'Certifications']
      const csvContent = [
        headers.join(','),
        ...data.map((company: any) => [
          `"${company.name}"`,
          `"${company.country}"`,
          `"${company.region}"`,
          `"${company.wasteType}"`,
          company.annualVolume,
          company.recyclingRate,
          company.complianceScore,
          `"${company.certifications.join('; ')}"`
        ].join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `waste_data_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast({
          title: 'Export successful',
          description: 'Your CSV file has been downloaded successfully.',
          variant: 'success',
        })
      }
    } catch (error) {
      console.error("Failed to export data:", error);
      toast({
        title: 'Export failed',
        description: 'There was an error exporting your data. Please try again.',
        variant: 'destructive',
      })
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Waste Intelligence Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Monitor global waste management operations and compliance metrics
        </p>
      </div>
      
      <div className="flex items-center space-x-3 mt-4 sm:mt-0">
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm" onClick={handleExport}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}