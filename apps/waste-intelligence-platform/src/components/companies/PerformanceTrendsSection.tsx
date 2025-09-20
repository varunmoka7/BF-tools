'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface PerformanceTrendsSectionProps {
  companyId: string;
  performance: any;
}

export default function PerformanceTrendsSection({ companyId, performance }: PerformanceTrendsSectionProps) {
  const [data, setData] = useState(performance);
  const [loading, setLoading] = useState(false);

  const fetchPerformanceData = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/companies/${companyId}/performance`);
      const result = await response.json();
      
      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    if (!performance) {
      fetchPerformanceData();
    }
  }, [companyId, performance, fetchPerformanceData]);

  const formatNumber = (num?: number) => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 1,
    }).format(num);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-200 rounded"></div>
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
        <CardTitle>Performance & Benchmarks</CardTitle>
      </CardHeader>
      <CardContent>
        
        {/* Performance Score */}
        {data?.performance_score && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Score</h3>
            <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {formatNumber(data.performance_score)}%
              </div>
              <p className="text-sm text-gray-600">Overall Performance</p>
            </div>
          </div>
        )}
        
        {/* Benchmarks */}
        {data?.benchmarks && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Industry Benchmarks</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(data.benchmarks).map(([type, value]: [string, any]) => (
                <div key={type} className="text-center p-4 border rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">
                    {formatNumber(value)}%
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {type.replace('_', ' ')} Average
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Trends */}
        {data?.trends && data.trends.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
            <div className="space-y-3">
              {data.trends.map((trend: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{trend.year}</div>
                    <div className="text-sm text-gray-600">{trend.description}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatNumber(trend.value)}%</div>
                    <div className="text-sm text-gray-600">{trend.change}</div>
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
