"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WasteAnalytics } from '@/types/waste';

interface MetricsCardsProps {
  analytics: WasteAnalytics;
}

export function MetricsCards({ analytics }: MetricsCardsProps) {
  const metrics = [
    {
      title: "Total Waste",
      value: `${analytics.totalWaste.toLocaleString()} kg`,
      change: `${analytics.wasteReduction.toFixed(1)}% reduction`,
      changeType: "positive" as const,
    },
    {
      title: "Cost Savings",
      value: `$${analytics.costSavings.toLocaleString()}`,
      change: "vs last month",
      changeType: "positive" as const,
    },
    {
      title: "Recycling Rate",
      value: `${analytics.recyclingRate.toFixed(1)}%`,
      change: "+5% from target",
      changeType: "positive" as const,
    },
    {
      title: "Carbon Footprint",
      value: `${analytics.carbonFootprint.toFixed(1)} CO2e`,
      change: "-12% this month",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {metric.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metric.value}</div>
            <Badge 
              variant={metric.changeType === "positive" ? "default" : "destructive"}
              className="mt-1"
            >
              {metric.change}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}