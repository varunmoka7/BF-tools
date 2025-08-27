'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface TabsProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const TabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: '',
  onValueChange: () => {}
})

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ value, onValueChange, children, className, ...props }, ref) => (
    <TabsContext.Provider value={{ value, onValueChange }}>
      <div ref={ref} className={cn('w-full', className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
)
Tabs.displayName = 'Tabs'

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ value, children, className, ...props }, ref) => {
    const { value: activeValue, onValueChange } = React.useContext(TabsContext)
    const isActive = activeValue === value

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          isActive
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:bg-white/50 hover:text-gray-900',
          className
        )}
        onClick={() => onValueChange(value)}
        {...props}
      >
        {children}
      </button>
    )
  }
)
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, children, className, ...props }, ref) => {
    const { value: activeValue } = React.useContext(TabsContext)
    
    if (activeValue !== value) return null

    return (
      <div
        ref={ref}
        className={cn(
          'mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }