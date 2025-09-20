'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CompanyNavigationProps {
  currentCompanyId: string;
  currentCompanyName: string;
}

interface Company {
  id: string;
  name: string;
}

export default function CompanyNavigation({ currentCompanyId, currentCompanyName }: CompanyNavigationProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/companies');
      const result = await response.json();
      
      if (result.success && result.data?.companies) {
        const companyList = result.data.companies;
        setCompanies(companyList);
        
        // Find current company index
        const index = companyList.findIndex((c: Company) => c.id === currentCompanyId);
        setCurrentIndex(index);
      }
    } catch (error) {
      console.error('Error fetching companies for navigation:', error);
    } finally {
      setLoading(false);
    }
  }, [currentCompanyId]);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const getPreviousCompany = () => {
    if (currentIndex > 0) {
      return companies[currentIndex - 1];
    }
    return null;
  };

  const getNextCompany = () => {
    if (currentIndex < companies.length - 1) {
      return companies[currentIndex + 1];
    }
    return null;
  };

  if (loading || currentIndex === -1) {
    return null;
  }

  const previousCompany = getPreviousCompany();
  const nextCompany = getNextCompany();

  return (
    <div className="flex items-center justify-between bg-white border-t border-gray-200 px-6 py-4">
      {/* Previous Company */}
      <div className="flex-1">
        {previousCompany ? (
          <Link
            href={`/companies/${previousCompany.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            <div className="text-left">
              <div className="text-xs text-gray-500">Previous</div>
              <div className="font-medium">{previousCompany.name}</div>
            </div>
          </Link>
        ) : (
          <div className="text-sm text-gray-400">
            <ChevronLeft className="w-4 h-4 mr-2 inline" />
            No previous company
          </div>
        )}
      </div>

      {/* Current Company Info */}
      <div className="flex-1 text-center">
        <div className="text-sm text-gray-500">
          {currentIndex + 1} of {companies.length}
        </div>
        <div className="text-sm font-medium text-gray-900">
          {currentCompanyName}
        </div>
      </div>

      {/* Next Company */}
      <div className="flex-1 text-right">
        {nextCompany ? (
          <Link
            href={`/companies/${nextCompany.id}`}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <div className="text-right">
              <div className="text-xs text-gray-500">Next</div>
              <div className="font-medium">{nextCompany.name}</div>
            </div>
            <ChevronRight className="w-4 h-4 ml-2" />
          </Link>
        ) : (
          <div className="text-sm text-gray-400">
            No next company
            <ChevronRight className="w-4 h-4 ml-2 inline" />
          </div>
        )}
      </div>
    </div>
  );
}
