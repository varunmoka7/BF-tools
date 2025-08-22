import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CompanyMetricsCardProps {
  wasteGenerated?: number;
  wasteRecovered?: number;
  recoveryRate?: number;
  performanceScore?: number;
}

export default function CompanyMetricsCard({ 
  wasteGenerated, 
  wasteRecovered, 
  recoveryRate, 
  performanceScore 
}: CompanyMetricsCardProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Key Metrics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Waste Generated */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Waste Generated</span>
          <span className="font-medium">{formatNumber(wasteGenerated)}t</span>
        </div>
        
        {/* Waste Recovered */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Waste Recovered</span>
          <span className="font-medium">{formatNumber(wasteRecovered)}t</span>
        </div>
        
        {/* Recovery Rate */}
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Recovery Rate</span>
          <div className="flex items-center space-x-1">
            <span className="font-medium">{formatNumber(recoveryRate)}%</span>
            {getTrendIcon(recoveryRate)}
          </div>
        </div>
        
        {/* Performance Score */}
        {performanceScore && (
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Performance Score</span>
            <div className="flex items-center space-x-1">
              <span className="font-medium">{formatNumber(performanceScore)}%</span>
              {getTrendIcon(performanceScore)}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
