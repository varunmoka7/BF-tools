'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserMenu } from '@/components/navigation/UserMenu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Building2,
  Home,
  Map,
  Settings,
  Users,
  FileBarChart,
  TrendingUp,
  Shield,
  HelpCircle,
} from 'lucide-react'

interface AuthenticatedLayoutProps {
  children: React.ReactNode
  className?: string
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description?: string
}

const navigationItems: NavItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: Home,
    description: 'Overview and key metrics',
  },
  {
    name: 'Analytics',
    href: '/analytics',
    icon: BarChart3,
    description: 'Detailed waste analytics',
  },
  {
    name: 'Companies',
    href: '/companies',
    icon: Building2,
    description: 'Company management',
  },
  {
    name: 'Map View',
    href: '/map',
    icon: Map,
    description: 'Geographic data visualization',
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: FileBarChart,
    description: 'Generate and view reports',
  },
  {
    name: 'Compliance',
    href: '/compliance',
    icon: Shield,
    description: 'Regulatory compliance tracking',
    badge: 'New',
  },
]

const secondaryItems: NavItem[] = [
  {
    name: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'System configuration',
  },
  {
    name: 'Help',
    href: '/help',
    icon: HelpCircle,
    description: 'Documentation and support',
  },
]

export function AuthenticatedLayout({ children, className }: AuthenticatedLayoutProps) {
  const pathname = usePathname()

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/' || pathname === '/dashboard'
    }
    return pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">W</span>
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  Waste Intelligence
                </span>
              </Link>
            </div>

            {/* Search Bar - Hidden on mobile for now */}
            <div className="flex-1 max-w-lg mx-8 hidden lg:block">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search companies, reports, metrics..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <TrendingUp className="h-4 w-4 mr-2" />
                Quick Insights
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <nav className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-gray-200 overflow-y-auto z-30">
          <div className="p-4 space-y-6">
            {/* Main Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Main Navigation
              </h3>
              <ul className="space-y-1">
                {navigationItems.map((item) => {
                  const isActive = isActiveRoute(item.href)
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                          isActive
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'mr-3 h-5 w-5 flex-shrink-0',
                            isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                          )}
                        />
                        <span className="flex-1">{item.name}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Secondary Navigation */}
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                System
              </h3>
              <ul className="space-y-1">
                {secondaryItems.map((item) => {
                  const isActive = isActiveRoute(item.href)
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={cn(
                          'group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                          isActive
                            ? 'bg-green-100 text-green-700'
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        )}
                      >
                        <item.icon
                          className={cn(
                            'mr-3 h-5 w-5 flex-shrink-0',
                            isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'
                          )}
                        />
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Stats</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Companies</span>
                  <span className="font-medium">247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">This Month</span>
                  <span className="font-medium text-green-600">+12%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Compliance Score</span>
                  <span className="font-medium">94.2%</span>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className={cn('flex-1 ml-64 p-6', className)}>
          {children}
        </main>
      </div>
    </div>
  )
}