import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface RequestThrottlingProps {
  children: React.ReactNode;
  maxRequests: number;
  timeWindowMinutes: number;
  storageKey: string;
}

interface RequestLog {
  timestamp: number;
  count: number;
}

export function RequestThrottling({ 
  children, 
  maxRequests = 3, 
  timeWindowMinutes = 60,
  storageKey = 'quote_requests'
}: RequestThrottlingProps) {
  const [isThrottled, setIsThrottled] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    checkThrottleStatus();
    const interval = setInterval(checkThrottleStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkThrottleStatus = () => {
    const stored = localStorage.getItem(storageKey);
    if (!stored) return;

    try {
      const requestLog: RequestLog = JSON.parse(stored);
      const now = Date.now();
      const timeWindow = timeWindowMinutes * 60 * 1000;
      
      if (now - requestLog.timestamp < timeWindow && requestLog.count >= maxRequests) {
        setIsThrottled(true);
        setRemainingTime(Math.ceil((timeWindow - (now - requestLog.timestamp)) / 1000 / 60));
      } else {
        setIsThrottled(false);
        setRemainingTime(0);
      }
    } catch (error) {
      // Clear invalid data
      localStorage.removeItem(storageKey);
    }
  };

  const recordRequest = () => {
    const stored = localStorage.getItem(storageKey);
    const now = Date.now();
    const timeWindow = timeWindowMinutes * 60 * 1000;
    
    let requestLog: RequestLog;
    
    if (stored) {
      try {
        requestLog = JSON.parse(stored);
        
        // Reset if outside time window
        if (now - requestLog.timestamp > timeWindow) {
          requestLog = { timestamp: now, count: 1 };
        } else {
          requestLog.count++;
        }
      } catch (error) {
        requestLog = { timestamp: now, count: 1 };
      }
    } else {
      requestLog = { timestamp: now, count: 1 };
    }
    
    localStorage.setItem(storageKey, JSON.stringify(requestLog));
    checkThrottleStatus();
  };

  // Expose recordRequest to children
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { recordRequest } as any);
    }
    return child;
  });

  if (isThrottled) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Too many quote requests submitted. Please wait {remainingTime} minutes before submitting another request.
            This helps us maintain quality service for all customers.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{childrenWithProps}</>;
}