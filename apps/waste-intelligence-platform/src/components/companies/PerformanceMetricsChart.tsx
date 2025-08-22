'use client'

import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';

interface PerformanceMetricsChartProps {
  performance: {
    performance_score: number;
    opportunity_score: number;
    benchmarks: {
      industry: number;
      regional: number;
      global: number;
    };
    trends: Array<{
      year: number;
      recovery_rate: number;
    }>;
  };
}

export default function PerformanceMetricsChart({ performance }: PerformanceMetricsChartProps) {
  // Prepare data for radar chart
  const radarData = [
    { metric: 'Performance Score', value: performance.performance_score, fullMark: 100 },
    { metric: 'Industry Benchmark', value: performance.benchmarks.industry, fullMark: 100 },
    { metric: 'Regional Benchmark', value: performance.benchmarks.regional, fullMark: 100 },
    { metric: 'Global Benchmark', value: performance.benchmarks.global, fullMark: 100 },
  ];

  // Prepare data for benchmark comparison
  const benchmarkData = [
    { name: 'Company Performance', value: performance.performance_score, color: '#10B981' },
    { name: 'Industry Average', value: performance.benchmarks.industry, color: '#3B82F6' },
    { name: 'Regional Average', value: performance.benchmarks.regional, color: '#F59E0B' },
    { name: 'Global Average', value: performance.benchmarks.global, color: '#8B5CF6' },
  ];

  // Prepare data for trend analysis
  const trendData = performance.trends.map(trend => ({
    year: trend.year.toString(),
    recovery_rate: trend.recovery_rate,
  }));

  return (
    <div className="space-y-6">
      {/* Performance Radar Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis 
              dataKey="metric" 
              tick={{ fontSize: 12, fill: '#6B7280' }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: '#6B7280' }}
            />
            <Radar
              name="Performance Score"
              dataKey="value"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`${value}`, 'Score']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Benchmark Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Benchmark Comparison</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={benchmarkData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="name" 
              stroke="#6B7280"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              domain={[0, 100]}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`${value}`, 'Score']}
            />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {benchmarkData.map((entry, index) => (
                <Bar key={`cell-${index}`} dataKey="value" fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Performance Score Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-800">
              {performance.performance_score}
            </div>
            <div className="text-sm text-green-600 font-medium">Performance Score</div>
            <div className="mt-2">
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                performance.performance_score >= 80 
                  ? 'bg-green-200 text-green-800' 
                  : performance.performance_score >= 60 
                  ? 'bg-yellow-200 text-yellow-800' 
                  : 'bg-red-200 text-red-800'
              }`}>
                {performance.performance_score >= 80 
                  ? 'Excellent' 
                  : performance.performance_score >= 60 
                  ? 'Good' 
                  : 'Needs Improvement'
                }
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-800">
              {performance.opportunity_score}
            </div>
            <div className="text-sm text-blue-600 font-medium">Opportunity Score</div>
            <div className="mt-2">
              <div className="text-xs text-blue-700">
                Room for improvement
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-800">
              {performance.benchmarks.industry}
            </div>
            <div className="text-sm text-purple-600 font-medium">Industry Average</div>
            <div className="mt-2">
              <div className={`text-xs font-medium ${
                performance.performance_score > performance.benchmarks.industry 
                  ? 'text-green-700' 
                  : 'text-red-700'
              }`}>
                {performance.performance_score > performance.benchmarks.industry 
                  ? 'Above Average' 
                  : 'Below Average'
                }
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Trends</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {performance.trends.map((trend, index) => (
            <div key={trend.year} className="bg-gray-50 rounded-lg p-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {trend.recovery_rate}%
                </div>
                <div className="text-sm text-gray-600">{trend.year}</div>
                <div className="mt-2">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    index > 0 && trend.recovery_rate > performance.trends[index - 1].recovery_rate
                      ? 'bg-green-100 text-green-800'
                      : index > 0 && trend.recovery_rate < performance.trends[index - 1].recovery_rate
                      ? 'bg-red-100 text-red-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {index > 0 && trend.recovery_rate > performance.trends[index - 1].recovery_rate
                      ? '↗ Improving'
                      : index > 0 && trend.recovery_rate < performance.trends[index - 1].recovery_rate
                      ? '↘ Declining'
                      : '→ Stable'
                    }
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
