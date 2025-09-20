'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Recycle, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface WasteMetricsSectionProps {
  companyId: string;
  wasteManagement: any;
}

export default function WasteMetricsSection({ companyId, wasteManagement }: WasteMetricsSectionProps) {
  const [metrics, setMetrics] = useState(wasteManagement);
  const [loading, setLoading] = useState(false);

  const fetchWasteMetrics = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/${companyId}/waste-metrics`);
      const result = await response.json();
      
      if (result.success) {
        setMetrics(result.data);
      }
    } catch (error) {
      console.error('Error fetching waste metrics:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (!wasteManagement) {
      fetchWasteMetrics();
    }
  }, [companyId, wasteManagement, fetchWasteMetrics]);

  const formatNumber = (num?: number) => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 1,
    }).format(num);
  };

  const getTrendIcon = (rate?: number) => {
    if (!rate) return <Minus className="w-4 h-4 text-gray-400" />;
    if (rate >= 70) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (rate >= 40) return <Minus className="w-4 h-4 text-yellow-500" />;
    return <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Recycle className="w-5 h-5 mr-2" />
          Waste Management Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {formatNumber(metrics?.total_waste_generated)}t
            </div>
            <div className="text-sm text-gray-600">Total Waste Generated</div>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatNumber(metrics?.total_waste_recovered)}t
            </div>
            <div className="text-sm text-gray-600">Waste Recovered</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600 mb-1 flex items-center justify-center">
              {formatNumber(metrics?.recovery_rate)}%
              {getTrendIcon(metrics?.recovery_rate)}
            </div>
            <div className="text-sm text-gray-600">Recovery Rate</div>
          </div>
        </div>
        
        {/* Waste Types Breakdown */}
        {metrics?.waste_types && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Types</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(metrics.waste_types).map(([type, value]: [string, any]) => (
                <div key={type} className="text-center">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(value)}t
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {type.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Treatment Methods */}
        {metrics?.treatment_methods && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Treatment Methods</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(metrics.treatment_methods).map(([method, percentage]: [string, any]) => (
                <div key={method} className="text-center p-3 border rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(percentage)}%
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {method.replace('_', ' ')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
