// Performance monitoring and metrics collection
import * as React from 'react'
export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: Map<string, number[]> = new Map();
  private observers: Set<(metrics: any) => void> = new Set();
  
  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }
  
  // Measure page load performance
  measurePageLoad() {
    if (typeof window !== 'undefined' && window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.recordMetric('pageLoad', navigation.loadEventEnd - navigation.loadEventStart);
        this.recordMetric('domContentLoaded', navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart);
        this.recordMetric('firstPaint', performance.getEntriesByName('first-paint')[0]?.startTime || 0);
        this.recordMetric('firstContentfulPaint', performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0);
      }
    }
  }
  
  // Measure API response times
  measureApiCall(url: string, startTime: number) {
    const duration = Date.now() - startTime;
    this.recordMetric(`api_${url}`, duration);
  }
  
  // Measure component render time
  measureComponentRender(componentName: string, startTime: number) {
    const duration = Date.now() - startTime;
    this.recordMetric(`component_${componentName}`, duration);
  }
  
  // Record a metric
  private recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name)!.push(value);
    
    // Keep only last 100 measurements
    if (this.metrics.get(name)!.length > 100) {
      this.metrics.get(name)!.shift();
    }
    
    // Notify observers
    this.notifyObservers();
  }
  
  // Get metric statistics
  getMetricStats(name: string) {
    const values = this.metrics.get(name) || [];
    
    if (values.length === 0) return null;
    
    const sorted = values.sort((a, b) => a - b);
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / values.length;
    const median = sorted[Math.floor(sorted.length / 2)];
    
    return {
      name,
      count: values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      mean: Math.round(mean * 100) / 100,
      median: Math.round(median * 100) / 100,
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }
  
  // Get all metrics
  getAllMetrics() {
    const result: any = {};
    
    for (const [name] of this.metrics) {
      result[name] = this.getMetricStats(name);
    }
    
    return result;
  }
  
  // Add observer
  addObserver(callback: (metrics: any) => void) {
    this.observers.add(callback);
  }
  
  // Remove observer
  removeObserver(callback: (metrics: any) => void) {
    this.observers.delete(callback);
  }
  
  // Notify observers
  private notifyObservers() {
    const metrics = this.getAllMetrics();
    this.observers.forEach(callback => callback(metrics));
  }
  
  // Clear all metrics
  clearMetrics() {
    this.metrics.clear();
    this.notifyObservers();
  }
}

// Performance monitoring hooks
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    measureComponentRender: (componentName: string) => {
      const startTime = Date.now();
      return () => monitor.measureComponentRender(componentName, startTime);
    },
    getMetrics: () => monitor.getAllMetrics(),
    clearMetrics: () => monitor.clearMetrics(),
  };
}

// Performance monitoring component wrapper
export function withPerformanceMonitoring<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  componentName: string
) {
  return function PerformanceMonitoredComponent(props: P) {
    const { measureComponentRender } = usePerformanceMonitor();
    const endMeasurement = measureComponentRender(componentName);
    
    React.useEffect(() => {
      endMeasurement();
    });
    
    return <WrappedComponent {...props} />;
  };
}
