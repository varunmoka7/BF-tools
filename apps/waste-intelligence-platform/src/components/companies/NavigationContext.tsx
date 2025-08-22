'use client';

import React, { createContext, useContext } from 'react';
import Link from 'next/link';
import { ArrowLeft, Home, Building } from 'lucide-react';

interface NavigationContextType {
  currentCompany?: string;
  showBackButton?: boolean;
  showBreadcrumbs?: boolean;
}

const NavigationContext = createContext<NavigationContextType>({});

export const useNavigation = () => useContext(NavigationContext);

interface NavigationProviderProps {
  children: React.ReactNode;
  currentCompany?: string;
  showBackButton?: boolean;
  showBreadcrumbs?: boolean;
}

export function NavigationProvider({ 
  children, 
  currentCompany, 
  showBackButton = true, 
  showBreadcrumbs = true 
}: NavigationProviderProps) {
  return (
    <NavigationContext.Provider value={{ currentCompany, showBackButton, showBreadcrumbs }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function BackNavigation() {
  const { showBackButton } = useNavigation();
  
  if (!showBackButton) return null;
  
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-6 py-4">
        <Link 
          href="/companies"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Companies
        </Link>
      </div>
    </div>
  );
}

export function BreadcrumbNavigation({ companyName }: { companyName: string }) {
  const { showBreadcrumbs } = useNavigation();
  
  if (!showBreadcrumbs) return null;
  
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <Link 
        href="/"
        className="flex items-center hover:text-gray-900 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      <span className="text-gray-400">/</span>
      
      <Link 
        href="/companies"
        className="flex items-center hover:text-gray-900 transition-colors"
      >
        <Building className="w-4 h-4 mr-1" />
        Companies
      </Link>
      
      <span className="text-gray-400">/</span>
      
      <span className="text-gray-900 font-medium truncate">
        {companyName}
      </span>
    </nav>
  );
}
