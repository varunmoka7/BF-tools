import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbNavigationProps {
  companyName: string;
}

export default function BreadcrumbNavigation({ companyName }: BreadcrumbNavigationProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
      <Link 
        href="/"
        className="flex items-center hover:text-gray-900 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      
      <ChevronRight className="w-4 h-4" />
      
      <Link 
        href="/companies"
        className="hover:text-gray-900 transition-colors"
      >
        Companies
      </Link>
      
      <ChevronRight className="w-4 h-4" />
      
      <span className="text-gray-900 font-medium truncate">
        {companyName}
      </span>
    </nav>
  );
}
