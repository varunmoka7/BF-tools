'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  BarChart3,
  Globe,
  Building2,
  Recycle
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/', icon: BarChart3 },
  { name: 'Global Map', href: '/map', icon: Globe },
  { name: 'Companies', href: '/companies', icon: Building2 },
]

export function Sidebar() {
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleResize = () => {
      if (sidebarRef.current) {
        const isLargeScreen = window.innerWidth >= 1024
        if (!isLargeScreen) {
          // Ensure sidebar is completely hidden on smaller screens
          sidebarRef.current.style.display = 'none'
          sidebarRef.current.style.visibility = 'hidden'
          sidebarRef.current.style.opacity = '0'
          sidebarRef.current.style.transform = 'translateX(-100%)'
          sidebarRef.current.style.pointerEvents = 'none'
        } else {
          // Restore sidebar on large screens
          sidebarRef.current.style.display = 'block'
          sidebarRef.current.style.visibility = 'visible'
          sidebarRef.current.style.opacity = '1'
          sidebarRef.current.style.transform = 'translateX(0)'
          sidebarRef.current.style.pointerEvents = 'auto'
        }
      }
    }

    // Initial check
    handleResize()
    
    // Add event listener
    window.addEventListener('resize', handleResize)
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div 
      ref={sidebarRef}
      className="fixed inset-y-0 left-0 z-50 w-64 bg-white lg:block hidden sidebar-overlay-fix overflow-hidden"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200 overflow-hidden">
          <div className="flex items-center space-x-2 overflow-hidden">
            <Recycle className="h-8 w-8 text-green-600 flex-shrink-0" />
            <span className="text-xl font-bold text-gray-900 text-fragment-fix overflow-hidden">WastePlatform</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-hidden">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors text-fragment-fix overflow-hidden',
                  isActive
                    ? 'bg-green-50 text-green-700 ring-2 ring-green-200'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )}
              >
                <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
                <span className="text-fragment-fix overflow-hidden">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 overflow-hidden">
          <div className="text-xs text-gray-500 text-fragment-fix overflow-hidden">
            Waste Intelligence Platform v1.0
          </div>
        </div>
      </div>
    </div>
  )
}
