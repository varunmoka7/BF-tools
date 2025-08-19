'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { 
  BarChart3, 
  Globe, 
  Building2, 
  Settings, 
  Users, 
  FileText,
  Recycle
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Global Map', href: '/map', icon: Globe },
  { name: 'Companies', href: '/companies', icon: Building2 },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Recycling', href: '/recycling', icon: Recycle },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 lg:block hidden">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Recycle className="h-8 w-8 text-green-600" />
            <span className="text-xl font-bold text-gray-900">WastePlatform</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-green-50 text-green-700 border-r-2 border-green-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Waste Intelligence Platform v1.0
          </div>
        </div>
      </div>
    </div>
  )
}