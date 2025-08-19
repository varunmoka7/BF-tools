import { getCompanyById, getCompanyMetrics } from '@/services/companies'
import { CompanyDetail } from '@/components/company-detail'
import { notFound } from 'next/navigation'

interface CompanyPageProps {
  params: {
    id: string
  }
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const companyId = parseInt(params.id)
  
  if (isNaN(companyId)) {
    notFound()
  }

  try {
    const [company, metrics] = await Promise.all([
      getCompanyById(companyId),
      getCompanyMetrics(companyId)
    ])

    if (!company) {
      notFound()
    }

    return <CompanyDetail company={company} metrics={metrics} />
  } catch (error) {
    console.error('Error loading company:', error)
    notFound()
  }
}