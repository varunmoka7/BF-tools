// Production error monitoring and logging
export class ErrorMonitor {
  private static instance: ErrorMonitor;
  private errorQueue: Array<{ error: Error; context: any; timestamp: number }> = [];
  private maxQueueSize = 100;
  
  static getInstance(): ErrorMonitor {
    if (!ErrorMonitor.instance) {
      ErrorMonitor.instance = new ErrorMonitor();
    }
    return ErrorMonitor.instance;
  }
  
  // Capture and log errors
  captureError(error: Error, context?: any) {
    const errorData = {
      error,
      context: {
        ...context,
        url: typeof window !== 'undefined' ? window.location.href : 'server',
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
        timestamp: new Date().toISOString(),
      },
      timestamp: Date.now(),
    };
    
    // Add to queue
    this.errorQueue.push(errorData);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error captured:', errorData);
    }
    
    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoringService(errorData);
    }
  }
  
  // Send errors to monitoring service
  private async sendToMonitoringService(errorData: any) {
    try {
      // In production, send to your monitoring service (e.g., Sentry, LogRocket)
      if (process.env.NEXT_PUBLIC_MONITORING_ENDPOINT) {
        await fetch(process.env.NEXT_PUBLIC_MONITORING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(errorData),
        });
      }
    } catch (sendError) {
      // Fallback to console if monitoring service fails
      console.error('Failed to send error to monitoring service:', sendError);
    }
  }
  
  // Get error statistics
  getErrorStats() {
    const now = Date.now();
    const lastHour = now - (60 * 60 * 1000);
    const lastDay = now - (24 * 60 * 60 * 1000);
    
    return {
      totalErrors: this.errorQueue.length,
      errorsLastHour: this.errorQueue.filter(e => e.timestamp > lastHour).length,
      errorsLastDay: this.errorQueue.filter(e => e.timestamp > lastDay).length,
      recentErrors: this.errorQueue.slice(-10),
    };
  }
  
  // Clear error queue
  clearErrors() {
    this.errorQueue = [];
  }
}

// Global error handler
export function setupGlobalErrorHandling() {
  if (typeof window !== 'undefined') {
    // Client-side error handling
    window.addEventListener('error', (event) => {
      ErrorMonitor.getInstance().captureError(event.error, {
        type: 'unhandled-error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });
    
    window.addEventListener('unhandledrejection', (event) => {
      ErrorMonitor.getInstance().captureError(new Error(event.reason), {
        type: 'unhandled-promise-rejection',
        reason: event.reason,
      });
    });
  }
  
  // Server-side error handling
  if (typeof process !== 'undefined') {
    process.on('uncaughtException', (error) => {
      ErrorMonitor.getInstance().captureError(error, {
        type: 'uncaught-exception',
        process: process.pid,
      });
    });
    
    process.on('unhandledRejection', (reason) => {
      ErrorMonitor.getInstance().captureError(new Error(String(reason)), {
        type: 'unhandled-rejection',
        reason,
      });
    });
  }
}

// React error boundary hook
export function useErrorBoundary() {
  const monitor = ErrorMonitor.getInstance();
  
  const captureError = (error: Error, errorInfo?: any) => {
    monitor.captureError(error, {
      type: 'react-error-boundary',
      componentStack: errorInfo?.componentStack,
    });
  };
  
  return { captureError };
}
