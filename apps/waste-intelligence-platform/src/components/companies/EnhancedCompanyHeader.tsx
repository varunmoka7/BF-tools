'use client'

import React from 'react';
import { Building2, MapPin, Users, TrendingUp, Award, Globe } from 'lucide-react';

interface EnhancedCompanyHeaderProps {
  company: {
    name: string;
    country: string;
    sector: string;
    industry: string;
    employees: number;
    ticker: string;
    exchange: string;
  };
  profile: {
    description: string;
    founded_year: number;
    headquarters: string;
    revenue_usd: number;
    market_cap_usd: number;
    sustainability_rating: number;
  };
  wasteData: {
    total_waste_generated: number;
    recovery_rate: number;
  };
  performance: {
    performance_score: number;
  };
}

export default function EnhancedCompanyHeader({ 
  company, 
  profile, 
  wasteData, 
  performance 
}: EnhancedCompanyHeaderProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
    return `$${value.toLocaleString()}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return value.toLocaleString();
  };

  const getSustainabilityColor = (rating: number) => {
    switch (rating) {
      case 5: return 'text-green-600 bg-green-100';
      case 4: return 'text-blue-600 bg-blue-100';
      case 3: return 'text-yellow-600 bg-yellow-100';
      case 2: return 'text-orange-600 bg-orange-100';
      case 1: return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-blue-600 bg-blue-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 border-b border-gray-200">
      <div className="container mx-auto px-6 py-8">
        {/* Company Name and Basic Info */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-200">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{company.name}</h1>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{company.country}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Globe className="h-4 w-4" />
                    <span>{company.sector}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{formatNumber(company.employees)} employees</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Stock Info */}
            <div className="flex items-center space-x-4 mt-3">
              <div className="bg-white px-3 py-1 rounded-full border border-gray-200">
                <span className="text-sm font-medium text-gray-700">
                  {company.ticker} • {company.exchange}
                </span>
              </div>
              {profile.founded_year && (
                <div className="bg-white px-3 py-1 rounded-full border border-gray-200">
                  <span className="text-sm text-gray-600">
                    Founded {profile.founded_year}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Key Metrics */}
          <div className="flex flex-wrap gap-3 mt-4 lg:mt-0">
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {wasteData.recovery_rate}%
                </div>
                <div className="text-xs text-gray-600">Recovery Rate</div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {performance.performance_score}
                </div>
                <div className="text-xs text-gray-600">Performance</div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">
                  {profile.sustainability_rating}/5
                </div>
                <div className="text-xs text-gray-600">Sustainability</div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        {profile.description && (
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Company Overview</h2>
            <p className="text-gray-700 leading-relaxed">{profile.description}</p>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Revenue */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Revenue</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(profile.revenue_usd)}
                </div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          {/* Market Cap */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Market Cap</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatCurrency(profile.market_cap_usd)}
                </div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Award className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Waste Generated */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Waste Generated</div>
                <div className="text-xl font-bold text-gray-900">
                  {formatNumber(wasteData.total_waste_generated)} tons
                </div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Building2 className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>

          {/* Headquarters */}
          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Headquarters</div>
                <div className="text-xl font-bold text-gray-900">
                  {profile.headquarters || company.country}
                </div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <MapPin className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="mt-6 flex flex-wrap gap-3">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSustainabilityColor(profile.sustainability_rating)}`}>
            Sustainability Rating: {profile.sustainability_rating}/5
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getPerformanceColor(performance.performance_score)}`}>
            Performance Score: {performance.performance_score}/100
          </div>
          <div className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
            Industry: {company.industry}
          </div>
        </div>
      </div>
    </div>
  );
}
