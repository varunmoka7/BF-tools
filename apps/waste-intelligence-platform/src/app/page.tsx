import { CompanyDirectory } from '@/components/company-directory'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Waste Intelligence Platform
          </h1>
          <p className="text-lg text-gray-600">
            Discover companies, analyze waste management metrics, and identify business opportunities.
          </p>
        </div>
        
        <CompanyDirectory />
      </div>
    </div>
  )
}