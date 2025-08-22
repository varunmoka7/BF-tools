import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Building, DollarSign, TrendingUp } from 'lucide-react';

interface CompanyInfoCardProps {
  company: {
    name: string;
    ticker?: string;
    website_url?: string;
    founded_year?: number;
    headquarters?: string;
    revenue_usd?: number;
    market_cap_usd?: number;
    is_public?: boolean;
    stock_exchange?: string;
    description?: string;
  };
}

export default function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Building className="w-5 h-5 mr-2" />
          Company Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Basic Info */}
        <div className="space-y-3">
          {company.founded_year && (
            <div>
              <label className="text-sm font-medium text-gray-500">Founded</label>
              <p className="text-sm">{company.founded_year}</p>
            </div>
          )}
          
          {company.headquarters && (
            <div>
              <label className="text-sm font-medium text-gray-500">Headquarters</label>
              <p className="text-sm">{company.headquarters}</p>
            </div>
          )}
          
          {company.website_url && (
            <div>
              <label className="text-sm font-medium text-gray-500">Website</label>
              <a 
                href={company.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
              >
                Visit Website
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          )}
        </div>
        
        {/* Financial Info */}
        {(company.revenue_usd || company.market_cap_usd) && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-1" />
              Financial Information
            </h4>
            <div className="space-y-3">
              {company.revenue_usd && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Revenue</label>
                  <p className="text-sm font-medium">{formatCurrency(company.revenue_usd)}</p>
                </div>
              )}
              
              {company.market_cap_usd && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Market Cap</label>
                  <p className="text-sm font-medium">{formatCurrency(company.market_cap_usd)}</p>
                </div>
              )}
              
              {company.is_public && (
                <div>
                  <Badge variant="secondary">
                    {company.is_public ? 'Public Company' : 'Private Company'}
                  </Badge>
                  {company.stock_exchange && (
                    <Badge variant="outline" className="ml-2">
                      {company.stock_exchange}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Description */}
        {company.description && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-900 mb-2">About</h4>
            <p className="text-sm text-gray-600 leading-relaxed">
              {company.description}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
