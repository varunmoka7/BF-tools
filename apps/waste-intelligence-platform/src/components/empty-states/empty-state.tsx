import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action, 
  className 
}: EmptyStateProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center p-12 text-center",
      className
    )}>
      <div className="bg-gray-100 rounded-full p-4 mb-4">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Specific empty states for different scenarios
import { Search, Database, Filter, Upload } from 'lucide-react'

export function NoDataEmptyState({ onUpload }: { onUpload?: () => void }) {
  return (
    <EmptyState
      icon={Database}
      title="No data available"
      description="There are no waste management companies to display. Upload a CSV file to get started."
      action={onUpload ? { label: "Upload CSV", onClick: onUpload } : undefined}
    />
  )
}

export function NoSearchResultsEmptyState({ onClearSearch }: { onClearSearch: () => void }) {
  return (
    <EmptyState
      icon={Search}
      title="No results found"
      description="We couldn't find any companies matching your search criteria. Try adjusting your search terms."
      action={{ label: "Clear search", onClick: onClearSearch }}
    />
  )
}

export function NoFilterResultsEmptyState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <EmptyState
      icon={Filter}
      title="No matches found"
      description="No companies match the current filter criteria. Try adjusting or clearing your filters."
      action={{ label: "Clear filters", onClick: onClearFilters }}
    />
  )
}