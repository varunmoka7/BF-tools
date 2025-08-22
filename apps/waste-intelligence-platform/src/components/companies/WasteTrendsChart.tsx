'use client'

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface WasteTrendsChartProps {
  trends: Array<{
    year: number;
    recovery_rate: number;
  }>;
  wasteData: {
    total_waste_generated: number;
    total_waste_recovered: number;
    total_waste_disposed: number;
    recovery_rate: number;
  };
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6'];

export default function WasteTrendsChart({ trends, wasteData }: WasteTrendsChartProps) {
  // Prepare data for pie chart
  const pieData = [
    { name: 'Recovered', value: wasteData.total_waste_recovered, color: '#10B981' },
    { name: 'Disposed', value: wasteData.total_waste_disposed, color: '#EF4444' }
  ];

  // Prepare data for bar chart
  const barData = [
    { name: 'Generated', value: wasteData.total_waste_generated, color: '#3B82F6' },
    { name: 'Recovered', value: wasteData.total_waste_recovered, color: '#10B981' },
    { name: 'Disposed', value: wasteData.total_waste_disposed, color: '#EF4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Recovery Rate Trends */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recovery Rate Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trends}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis 
              dataKey="year" 
              stroke="#6B7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
              formatter={(value: number) => [`${value}%`, 'Recovery Rate']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="recovery_rate" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Waste Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart - Waste Distribution */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [`${value.toLocaleString()} tons`, 'Waste']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Waste Comparison */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Waste Comparison</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                stroke="#6B7280"
                fontSize={12}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E5E7EB',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [`${value.toLocaleString()} tons`, 'Waste']}
              />
              <Bar dataKey="value" fill="#3B82F6" radius={[4, 4, 0, 0]}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recovery Rate Indicator */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recovery Rate Performance</h3>
        <div className="flex items-center justify-center">
          <div className="relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={wasteData.recovery_rate >= 70 ? '#10B981' : wasteData.recovery_rate >= 50 ? '#F59E0B' : '#EF4444'}
                strokeWidth="8"
                fill="transparent"
                strokeDasharray={`${(wasteData.recovery_rate / 100) * 352} 352`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">
                  {wasteData.recovery_rate}%
                </div>
                <div className="text-sm text-gray-600">Recovery Rate</div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
            wasteData.recovery_rate >= 70 
              ? 'bg-green-100 text-green-800' 
              : wasteData.recovery_rate >= 50 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {wasteData.recovery_rate >= 70 
              ? 'Excellent Performance' 
              : wasteData.recovery_rate >= 50 
              ? 'Good Performance' 
              : 'Needs Improvement'
            }
          </div>
        </div>
      </div>
    </div>
  );
}
