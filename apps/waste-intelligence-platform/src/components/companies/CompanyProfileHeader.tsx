import React from 'react';
import Link from 'next/link';
import { Star, MapPin, Calendar, Users, ArrowLeft } from 'lucide-react';

interface CompanyProfileHeaderProps {
  company: {
    name: string;
    ticker?: string;
    country: string;
    sector: string;
    industry: string;
    employees?: number;
    founded_year?: number;
    sustainability_rating?: number;
  };
}

export default function CompanyProfileHeader({ company }: CompanyProfileHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-8">
        {/* Mobile Back Button */}
        <div className="lg:hidden mb-4">
          <Link 
            href="/companies"
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Companies
          </Link>
        </div>
        
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          
          {/* Company Info */}
          <div className="flex items-start space-x-6">
            {/* Company Logo/Avatar */}
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-2xl font-bold text-white">
                {company.name.charAt(0)}
              </span>
            </div>
            
            {/* Company Details */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {company.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                {company.ticker && (
                  <span className="bg-gray-100 px-2 py-1 rounded font-medium">
                    {company.ticker}
                  </span>
                )}
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {company.country}
                </div>
                {company.employees && (
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {company.employees.toLocaleString()} employees
                  </div>
                )}
                {company.founded_year && (
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Founded {company.founded_year}
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                  {company.sector}
                </span>
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {company.industry}
                </span>
              </div>
            </div>
          </div>
          
          {/* Sustainability Rating and Navigation */}
          <div className="mt-6 lg:mt-0 text-center lg:text-right space-y-4">
            {company.sustainability_rating && (
              <div>
                <div className="flex items-center justify-center lg:justify-end space-x-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`w-5 h-5 ${
                        i < company.sustainability_rating! 
                          ? 'text-yellow-400 fill-current' 
                          : 'text-gray-300'
                      }`} 
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  Sustainability Rating: {company.sustainability_rating}/5
                </p>
              </div>
            )}
            
            {/* View All Companies Button */}
            <div className="hidden lg:block">
              <Link
                href="/companies"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                View All Companies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
