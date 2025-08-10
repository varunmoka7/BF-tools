'use client'

import { Button } from '@/components/ui/button'
import { Download, Filter, RefreshCcw } from 'lucide-react'

export function DashboardHeader() {
  const handleRefresh = () => {
    window.location.reload()
  }

  const handleExport = async () => {
    try {
      const response = await fetch('/api/waste-data');
      const data = await response.json();
      
      const csvContent = [
        Object.keys(data[0]).join(','), 
        ...data.map(item => Object.values(item).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "waste_data.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Failed to export data:", error);
    }
  };

  const handleFilter = () => {
    console.log("Filter button clicked");
    // Placeholder for filter functionality
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
        <Button variant="outline" size="sm" onClick={handleFilter}>
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
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