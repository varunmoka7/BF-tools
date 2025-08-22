import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import EnhancedCompanyHeader from '@/components/companies/EnhancedCompanyHeader';
import WasteTrendsChart from '@/components/companies/WasteTrendsChart';
import PerformanceMetricsChart from '@/components/companies/PerformanceMetricsChart';
import CompanyInfoCard from '@/components/companies/CompanyInfoCard';
import CompanyMetricsCard from '@/components/companies/CompanyMetricsCard';
import FloatingBackButton from '@/components/companies/FloatingBackButton';
import { NavigationProvider, BackNavigation, BreadcrumbNavigation } from '@/components/companies/NavigationContext';
import CompanyNavigation from '@/components/companies/CompanyNavigation';

interface CompanyProfilePageProps {
  params: { id: string };
}

async function getCompanyProfile(id: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/companies/${id}/profile`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const result = await response.json();
    return result.success ? result.data : null;
  } catch (error) {
    console.error('Error fetching company profile:', error);
    return null;
  }
}

export async function generateMetadata({ params }: CompanyProfilePageProps): Promise<Metadata> {
  const companyData = await getCompanyProfile(params.id);
  
  if (!companyData) {
    return {
      title: 'Company Not Found',
    };
  }

  return {
    title: `${companyData.company.name} - Company Profile`,
    description: `Detailed waste management profile for ${companyData.company.name} including sustainability metrics, waste data, and performance analysis.`,
  };
}

export default async function CompanyProfilePage({ params }: CompanyProfilePageProps) {
  const companyData = await getCompanyProfile(params.id);

  if (!companyData) {
    notFound();
  }

  const { company, profile, waste_management, performance } = companyData;

  return (
    <NavigationProvider currentCompany={company.name}>
      <div className="min-h-screen bg-gray-50">
        {/* Back Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="container mx-auto px-6 py-4">
            <BreadcrumbNavigation companyName={company.name} />
            <BackNavigation />
          </div>
        </div>

        {/* Enhanced Header Section */}
        <EnhancedCompanyHeader 
          company={company}
          profile={profile}
          wasteData={waste_management}
          performance={performance}
        />
        
        {/* Main Content */}
        <div className="container mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* Left Column - Company Info */}
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <CompanyInfoCard company={company} />
                <CompanyMetricsCard 
                  wasteGenerated={waste_management?.total_waste_generated}
                  wasteRecovered={waste_management?.total_waste_recovered}
                  recoveryRate={waste_management?.recovery_rate}
                  performanceScore={performance?.performance_score}
                />
              </div>
            </div>
            
            {/* Right Column - Enhanced Charts and Data */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                {/* Waste Trends Charts */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Waste Management Analytics</h2>
                  <WasteTrendsChart 
                    trends={performance?.trends || []}
                    wasteData={waste_management}
                  />
                </div>

                {/* Performance Metrics Charts */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Performance Analytics</h2>
                  <PerformanceMetricsChart 
                    performance={performance}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Company Navigation */}
        <CompanyNavigation 
          currentCompanyId={params.id}
          currentCompanyName={company.name}
        />
        
        {/* Floating Back Button for Mobile */}
        <FloatingBackButton />
      </div>
    </NavigationProvider>
  );
}
