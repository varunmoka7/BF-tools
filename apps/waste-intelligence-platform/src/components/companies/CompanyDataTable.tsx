'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Building, 
  MapPin, 
  Users, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Recycle, 
  AlertTriangle,
  Star,
  Globe,
  Factory,
  Truck
} from 'lucide-react';

interface CompanyDataTableProps {
  company: {
    id: string;
    name: string;
    ticker?: string;
    country: string;
    sector: string;
    industry: string;
    employees?: number;
    year_of_disclosure: number;
    description?: string;
    website_url?: string;
    founded_year?: number;
    headquarters?: string;
    revenue_usd?: number;
    market_cap_usd?: number;
    sustainability_rating?: number;
    is_public?: boolean;
    stock_exchange?: string;
  };
  profile: any;
  waste_management: any;
  performance: any;
}

export default function CompanyDataTable({ company, profile, waste_management, performance }: CompanyDataTableProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  const formatNumber = (num?: number) => {
    if (num === null || num === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 1,
    }).format(num);
  };

  const formatPercentage = (num?: number) => {
    if (num === null || num === undefined) return 'N/A';
    return `${formatNumber(num)}%`;
  };

  const getSustainabilityStars = (rating?: number) => {
    if (!rating) return 'N/A';
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="space-y-6">
      {/* Basic Company Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 mr-2" />
            Basic Company Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Company ID</label>
              <p className="text-sm font-mono bg-gray-50 p-2 rounded">{company.id}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Company Name</label>
              <p className="text-sm font-medium">{company.name}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Ticker Symbol</label>
              <p className="text-sm">{company.ticker || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Country</label>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                <p className="text-sm">{company.country}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Sector</label>
              <Badge variant="outline">{company.sector}</Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Industry</label>
              <Badge variant="secondary">{company.industry}</Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Employee Count</label>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1 text-gray-400" />
                <p className="text-sm">{company.employees ? company.employees.toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Founded Year</label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                <p className="text-sm">{company.founded_year || 'N/A'}</p>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Headquarters</label>
              <p className="text-sm">{company.headquarters || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Website</label>
              <p className="text-sm">
                {company.website_url ? (
                  <a href={company.website_url} target="_blank" rel="noopener noreferrer" 
                     className="text-blue-600 hover:text-blue-800 underline">
                    Visit Website
                  </a>
                ) : 'N/A'}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Year of Disclosure</label>
              <p className="text-sm">{company.year_of_disclosure}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Company Type</label>
              <Badge variant={company.is_public ? "default" : "outline"}>
                {company.is_public ? 'Public Company' : 'Private Company'}
              </Badge>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Stock Exchange</label>
              <p className="text-sm">{company.stock_exchange || 'N/A'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="w-5 h-5 mr-2" />
            Financial Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Revenue (USD)</label>
              <p className="text-sm font-medium">{formatCurrency(company.revenue_usd)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Market Cap (USD)</label>
              <p className="text-sm font-medium">{formatCurrency(company.market_cap_usd)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Sustainability Rating</label>
              <div className="flex items-center">
                <Star className="w-4 h-4 mr-1 text-yellow-400" />
                <p className="text-sm">{getSustainabilityStars(company.sustainability_rating)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Description */}
      {(company.description || profile?.description) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Company Description
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 leading-relaxed">
              {company.description || profile?.description || 'N/A'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Waste Management Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Recycle className="w-5 h-5 mr-2" />
            Waste Management Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Total Waste Generated</label>
              <p className="text-lg font-semibold text-blue-600">
                {formatNumber(waste_management?.total_waste_generated)}t
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Total Waste Recovered</label>
              <p className="text-lg font-semibold text-green-600">
                {formatNumber(waste_management?.total_waste_recovered)}t
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Total Waste Disposed</label>
              <p className="text-lg font-semibold text-red-600">
                {formatNumber(waste_management?.total_waste_disposed)}t
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Recovery Rate</label>
              <p className="text-lg font-semibold text-purple-600">
                {formatPercentage(waste_management?.recovery_rate)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hazardous Waste Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Hazardous Waste Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Hazardous Waste Generated</label>
              <p className="text-sm font-medium">{formatNumber(waste_management?.hazardous_waste?.generated)}t</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Hazardous Waste Recovered</label>
              <p className="text-sm font-medium">{formatNumber(waste_management?.hazardous_waste?.recovered)}t</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Hazardous Waste Disposed</label>
              <p className="text-sm font-medium">{formatNumber(waste_management?.hazardous_waste?.disposed)}t</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Hazardous Recovery Rate</label>
              <p className="text-sm font-medium">{formatPercentage(waste_management?.hazardous_waste?.recovery_rate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Non-Hazardous Waste Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Factory className="w-5 h-5 mr-2" />
            Non-Hazardous Waste Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Non-Hazardous Waste Generated</label>
              <p className="text-sm font-medium">{formatNumber(waste_management?.non_hazardous_waste?.generated)}t</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Non-Hazardous Waste Recovered</label>
              <p className="text-sm font-medium">{formatNumber(waste_management?.non_hazardous_waste?.recovered)}t</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Non-Hazardous Waste Disposed</label>
              <p className="text-sm font-medium">{formatNumber(waste_management?.non_hazardous_waste?.disposed)}t</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Non-Hazardous Recovery Rate</label>
              <p className="text-sm font-medium">{formatPercentage(waste_management?.non_hazardous_waste?.recovery_rate)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Treatment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            Waste Treatment Methods
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Recycling</label>
              <p className="text-sm font-medium">{formatPercentage(waste_management?.treatment_methods?.recycling)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Composting</label>
              <p className="text-sm font-medium">{formatPercentage(waste_management?.treatment_methods?.composting)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Energy Recovery</label>
              <p className="text-sm font-medium">{formatPercentage(waste_management?.treatment_methods?.energy_recovery)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Landfill</label>
              <p className="text-sm font-medium">{formatPercentage(waste_management?.treatment_methods?.landfill)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Incineration</label>
              <p className="text-sm font-medium">{formatPercentage(waste_management?.treatment_methods?.incineration)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Waste Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Recycle className="w-5 h-5 mr-2" />
            Waste Types Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Municipal Waste</label>
              <p className="text-sm font-medium">{formatNumber(waste_management?.waste_types?.municipal)}t</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Industrial Waste</label>
              <p className="text-sm font-medium">{formatNumber(waste_management?.waste_types?.industrial)}t</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Construction Waste</label>
              <p className="text-sm font-medium">{formatNumber(waste_management?.waste_types?.construction)}t</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Electronic Waste</label>
              <p className="text-sm font-medium">{formatNumber(waste_management?.waste_types?.electronic)}t</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Medical Waste</label>
              <p className="text-sm font-medium">{formatNumber(waste_management?.waste_types?.medical)}t</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Performance Score</label>
              <p className="text-lg font-semibold text-blue-600">
                {formatPercentage(performance?.performance_score)}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Opportunity Score</label>
              <p className="text-lg font-semibold text-green-600">
                {formatPercentage(performance?.opportunity_score)}
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Industry Benchmark</label>
              <p className="text-sm font-medium">{formatPercentage(performance?.benchmarks?.industry)}</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-500">Global Benchmark</label>
              <p className="text-sm font-medium">{formatPercentage(performance?.benchmarks?.global)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Profile Data */}
      {(profile?.ceo || profile?.logo_url || profile?.business_overview) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="w-5 h-5 mr-2" />
              Additional Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile?.ceo && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">CEO</label>
                  <p className="text-sm">{profile.ceo}</p>
                </div>
              )}
              {profile?.logo_url && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-500">Logo URL</label>
                  <p className="text-sm">
                    <a href={profile.logo_url} target="_blank" rel="noopener noreferrer" 
                       className="text-blue-600 hover:text-blue-800 underline">
                      View Logo
                    </a>
                  </p>
                </div>
              )}
              {profile?.business_overview && (
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">Business Overview</label>
                  <p className="text-sm text-gray-700 leading-relaxed">{profile.business_overview}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
