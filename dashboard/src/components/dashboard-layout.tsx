"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Building2, BarChart3, Settings, Home } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50/50">
      <header className="border-b bg-white">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-8">
              <Link href="/companies" className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-lg bg-green-600 flex items-center justify-center">
                  <div className="h-5 w-5 bg-white rounded"></div>
                </div>
                <h1 className="text-xl font-semibold">Waste Management BI</h1>
              </Link>
              
              <nav className="hidden md:flex items-center space-x-6">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || 
                    (item.href === '/companies' && (pathname === '/' || pathname.startsWith('/company')));
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>
              
              {/* Mobile Navigation */}
              <nav className="md:hidden flex items-center space-x-4">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || 
                    (item.href === '/companies' && (pathname === '/' || pathname.startsWith('/company')));
                  
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center p-2 rounded-md text-sm font-medium transition-colors",
                        isActive
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      )}
                      title={item.name}
                    >
                      <Icon className="h-5 w-5" />
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      </header>
      
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}