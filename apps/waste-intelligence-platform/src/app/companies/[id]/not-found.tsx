import Link from 'next/link'
import { ArrowLeft, Building2 } from 'lucide-react'

export default function CompanyNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
            <Building2 className="h-8 w-8 text-red-600" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Company Not Found
          </h1>

          {/* Description */}
          <p className="text-gray-600 mb-8">
            The company you&apos;re looking for doesn&apos;t exist or may have been removed from our database.
          </p>

          {/* Actions */}
          <div className="space-y-4">
            <Link
              href="/companies"
              className="inline-flex items-center justify-center w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse All Companies
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>

          {/* Help text */}
          <p className="text-sm text-gray-500 mt-6">
            If you believe this is an error, please contact support or try again later.
          </p>
        </div>
      </div>
    </div>
  )
}