import { promises as fs } from 'fs'
import path from 'path'

export interface LocalCompany {
  id: string
  name: string
  country?: string
  sector?: string
  region?: string
}

export interface LocalWasteMetricRecord {
  company_id: string
  reporting_period: string
  metric: string
  value?: number
  hazardousness?: string
  treatment_method?: string
}

export interface AggregatedCompanyMetric {
  company_id: string
  company_name: string
  country: string
  sector: string
  metrics: Array<{
    reporting_period: number
    totalGenerated: number
    totalRecovered: number
    totalDisposed: number
    hazardousGenerated: number
    nonHazardousGenerated: number
    hazardousRecovered: number
    nonHazardousRecovered: number
    hazardousDisposed: number
    nonHazardousDisposed: number
  }>
}

const COMPANIES_PATH = path.join(process.cwd(), 'public/companies-with-coordinates.json')
const WASTE_METRICS_PATH = path.join(process.cwd(), '../../data/structured/waste-metrics.json')

let companiesCache: LocalCompany[] | null = null
let wasteMetricsCache: LocalWasteMetricRecord[] | null = null
let aggregatedMetricsCache: AggregatedCompanyMetric[] | null = null

async function readJsonFile<T>(filePath: string): Promise<T> {
  const fileContent = await fs.readFile(filePath, 'utf8')
  return JSON.parse(fileContent) as T
}

export async function loadCompanies(): Promise<LocalCompany[]> {
  if (!companiesCache) {
    try {
      companiesCache = await readJsonFile<LocalCompany[]>(COMPANIES_PATH)
    } catch (error) {
      console.error('Failed to load companies data from file:', error)
      companiesCache = []
    }
  }
  return companiesCache
}

export async function loadWasteMetrics(): Promise<LocalWasteMetricRecord[]> {
  if (!wasteMetricsCache) {
    try {
      wasteMetricsCache = await readJsonFile<LocalWasteMetricRecord[]>(WASTE_METRICS_PATH)
    } catch (error) {
      console.error('Failed to load waste metrics data from file:', error)
      wasteMetricsCache = []
    }
  }
  return wasteMetricsCache
}

export async function loadAggregatedCompanyMetrics(): Promise<AggregatedCompanyMetric[]> {
  if (aggregatedMetricsCache) {
    return aggregatedMetricsCache
  }

  const [companies, wasteMetrics] = await Promise.all([loadCompanies(), loadWasteMetrics()])

  const companyDirectory = new Map(companies.map((company) => [company.id, company]))
  const metricsByCompany = new Map<
    string,
    Map<
      number,
      {
        totalGenerated: number
        totalRecovered: number
        totalDisposed: number
        hazardousGenerated: number
        nonHazardousGenerated: number
        hazardousRecovered: number
        nonHazardousRecovered: number
        hazardousDisposed: number
        nonHazardousDisposed: number
      }
    >
  >()

  for (const record of wasteMetrics) {
    if (!record.company_id || !record.reporting_period) continue

    const reportingPeriod = Number.parseInt(record.reporting_period, 10)
    if (Number.isNaN(reportingPeriod)) continue

    const companyMetrics = metricsByCompany.get(record.company_id) ?? new Map()
    const periodMetrics =
      companyMetrics.get(reportingPeriod) ?? {
        totalGenerated: 0,
        totalRecovered: 0,
        totalDisposed: 0,
        hazardousGenerated: 0,
        nonHazardousGenerated: 0,
        hazardousRecovered: 0,
        nonHazardousRecovered: 0,
        hazardousDisposed: 0,
        nonHazardousDisposed: 0,
      }

    const value = record.value ?? 0

    switch (record.metric) {
      case 'Total Waste Generated':
        periodMetrics.totalGenerated += value
        break
      case 'Total Waste Recovered':
        periodMetrics.totalRecovered += value
        break
      case 'Total Waste Disposed':
        periodMetrics.totalDisposed += value
        break
      case 'Total Hazardous Waste Generated':
        periodMetrics.hazardousGenerated += value
        break
      case 'Total Non-Hazardous Waste Generated':
        periodMetrics.nonHazardousGenerated += value
        break
      case 'Hazardous Waste Recovered':
        periodMetrics.hazardousRecovered += value
        break
      case 'Non-Hazardous Waste Recovered':
        periodMetrics.nonHazardousRecovered += value
        break
      case 'Hazardous Waste Disposed':
        periodMetrics.hazardousDisposed += value
        break
      case 'Non-Hazardous Waste Disposed':
        periodMetrics.nonHazardousDisposed += value
        break
      default:
        break
    }

    companyMetrics.set(reportingPeriod, periodMetrics)
    metricsByCompany.set(record.company_id, companyMetrics)
  }

  aggregatedMetricsCache = Array.from(metricsByCompany.entries()).map(([companyId, periods]) => {
    const company = companyDirectory.get(companyId)

    return {
      company_id: companyId,
      company_name: company?.name ?? 'Unknown Company',
      country: company?.country ?? 'Unknown Country',
      sector: company?.sector ?? 'Unknown Sector',
      metrics: Array.from(periods.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([period, metricValues]) => ({
          reporting_period: period,
          ...metricValues,
        })),
    }
  })

  return aggregatedMetricsCache
}
