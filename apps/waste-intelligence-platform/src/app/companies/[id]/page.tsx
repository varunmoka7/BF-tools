import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { CompanyClientPage } from './CompanyClientPage'

// Generate static params for common company IDs
export async function generateStaticParams() {
  try {
    // Fetch the first 100 companies for static generation
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/companies?limit=100`, {
      headers: {
        'User-Agent': 'NextJS-StaticGen',
      },
    })

    if (!response.ok) {
      console.warn('Failed to fetch companies for static generation')
      return []
    }

    const data = await response.json()

    if (data.success && data.data?.companies) {
      return data.data.companies.map((company: any) => ({
        id: company.id,
      }))
    }

    return []
  } catch (error) {
    console.warn('Error generating static params:', error)
    return []
  }
}

// Enable dynamic params for companies not in static generation
export const dynamicParams = true

// Server Component for initial data fetching and validation
export default async function CompanyDetailPage({
  params
}: {
  params: { id: string }
}) {
  const { id: companyId } = params

  // Server-side validation - check if company exists
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/companies/${companyId}/profile`, {
      headers: {
        'User-Agent': 'NextJS-SSR',
      },
      // ISR: revalidate every hour
      next: { revalidate: 3600 }
    })

    if (!response.ok) {
      if (response.status === 404) {
        notFound()
      }
      throw new Error(`Failed to fetch company: ${response.status}`)
    }

    const apiResponse = await response.json()
    if (!apiResponse.success || !apiResponse.data?.company) {
      notFound()
    }

    // Pass initial data to client component
    return (
      <Suspense fallback={<CompanyPageSkeleton />}>
        <CompanyClientPage
          companyId={companyId}
          initialData={apiResponse.data}
        />
      </Suspense>
    )

  } catch (error) {
    console.error('Error in server component:', error)
    notFound()
  }
}

// Loading skeleton component
function CompanyPageSkeleton() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    </div>
  )
}