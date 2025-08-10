'use client'

import { Button } from '@/components/ui/button'
import { Download, Filter, RefreshCcw } from 'lucide-react'

export function DashboardHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Waste Intelligence Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Monitor global waste management operations and compliance metrics
        </p>
      </div>
      
      <div className="flex items-center space-x-3 mt-4 sm:mt-0">
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
        <Button size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>
    </div>
  )
}