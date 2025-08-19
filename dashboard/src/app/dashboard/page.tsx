"use client";

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { MetricsCards } from '@/components/metrics-cards';
import { WasteService } from '@/services/waste-service';
import { DashboardMetrics } from '@/types/waste';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Building2, TrendingUp, Users } from 'lucide-react';

export default function DashboardOverview() {
  const [dashboardData, setDashboardData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const data = await WasteService.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Set mock data for development
        setDashboardData({
          companies: [],
          wasteData: [],
          analytics: {
            totalWaste: 125000,
            wasteReduction: 15.2,
            costSavings: 45000,
            recyclingRate: 67.8,
            carbonFootprint: 62.5,
          },
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-muted-foreground">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!dashboardData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Error loading dashboard data</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
            <p className="text-muted-foreground">
              Monitor your waste management performance and key metrics
            </p>
          </div>
          <div className="flex gap-3">
            <Button asChild>
              <Link href="/companies">
                <Building2 className="mr-2 h-4 w-4" />
                View Companies
              </Link>
            </Button>
          </div>
        </div>
        
        <MetricsCards analytics={dashboardData.analytics} />
        
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Companies</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.companies.length || 8}
              </div>
              <p className="text-xs text-muted-foreground">
                Active companies tracked
              </p>
              <div className="mt-3">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/companies">View All</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Waste Entries</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.wasteData.length || 156}
              </div>
              <p className="text-xs text-muted-foreground">
                Total waste records this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Recovery Rate</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.analytics.recyclingRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across all tracked companies
              </p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <p className="text-sm text-muted-foreground">
              Get started with common tasks
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Button variant="outline" asChild className="h-auto p-4 flex flex-col items-start">
                <Link href="/companies">
                  <Building2 className="h-6 w-6 mb-2" />
                  <div className="text-left">
                    <div className="font-medium">Browse Companies</div>
                    <div className="text-xs text-muted-foreground">
                      View all companies and their performance
                    </div>
                  </div>
                </Link>
              </Button>
              
              <Button variant="outline" disabled className="h-auto p-4 flex flex-col items-start">
                <TrendingUp className="h-6 w-6 mb-2" />
                <div className="text-left">
                  <div className="font-medium">View Analytics</div>
                  <div className="text-xs text-muted-foreground">
                    Detailed waste management insights
                  </div>
                </div>
              </Button>
              
              <Button variant="outline" disabled className="h-auto p-4 flex flex-col items-start">
                <Users className="h-6 w-6 mb-2" />
                <div className="text-left">
                  <div className="font-medium">Add Company</div>
                  <div className="text-xs text-muted-foreground">
                    Register a new company for tracking
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              Welcome to your Waste Management BI Dashboard! This platform helps you track, analyze, and optimize your waste management operations.
            </div>
            <div className="text-sm">
              <strong>Next steps:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Configure your Supabase connection in .env.local</li>
                <li>Set up your database tables for companies and waste data</li>
                <li>Browse the company directory to see sample data</li>
                <li>Add your first company and start tracking waste metrics</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}