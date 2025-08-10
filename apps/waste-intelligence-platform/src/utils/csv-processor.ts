import Papa from 'papaparse'
import { WasteCompany } from '@/types/waste'
import { generateMockCoordinates } from '@/lib/utils'

export interface CSVProcessorOptions {
  delimiter?: string
  header?: boolean
  skipEmptyLines?: boolean
  transformHeader?: (header: string) => string
}

export class CSVProcessor {
  static async processFile(
    file: File,
    options: CSVProcessorOptions = {}
  ): Promise<WasteCompany[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: options.header ?? true,
        delimiter: options.delimiter ?? ',',
        skipEmptyLines: options.skipEmptyLines ?? true,
        transformHeader: options.transformHeader,
        complete: (results) => {
          try {
            const companies = this.transformToWasteCompanies(results.data as any[])
            resolve(companies)
          } catch (error) {
            reject(error)
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`))
        }
      })
    })
  }

  static async processText(
    csvText: string,
    options: CSVProcessorOptions = {}
  ): Promise<WasteCompany[]> {
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: options.header ?? true,
        delimiter: options.delimiter ?? ',',
        skipEmptyLines: options.skipEmptyLines ?? true,
        transformHeader: options.transformHeader,
        complete: (results) => {
          try {
            const companies = this.transformToWasteCompanies(results.data as any[])
            resolve(companies)
          } catch (error) {
            reject(error)
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing failed: ${error.message}`))
        }
      })
    })
  }

  private static transformToWasteCompanies(data: any[]): WasteCompany[] {
    return data.map((row, index) => {
      // Handle various CSV column naming conventions
      const getValue = (keys: string[]): string => {
        for (const key of keys) {
          if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
            return String(row[key]).trim()
          }
        }
        return ''
      }

      const getNumberValue = (keys: string[]): number => {
        const value = getValue(keys)
        const parsed = parseFloat(value.replace(/[,\s]/g, ''))
        return isNaN(parsed) ? 0 : parsed
      }

      const name = getValue([
        'company_name', 'company', 'name', 'Company Name', 'Company'
      ]) || `Company ${index + 1}`

      const country = getValue([
        'country', 'Country', 'nation', 'Nation'
      ]) || 'Unknown'

      const region = getValue([
        'region', 'Region', 'area', 'Area'
      ]) || this.getRegionFromCountry(country)

      const wasteType = getValue([
        'waste_type', 'type', 'Waste Type', 'Type', 'category', 'Category'
      ]) || 'Mixed'

      const coordinates = {
        lat: getNumberValue(['latitude', 'lat', 'Latitude', 'Lat']) || generateMockCoordinates(country)[0],
        lng: getNumberValue(['longitude', 'lng', 'lon', 'Longitude', 'Lng', 'Lon']) || generateMockCoordinates(country)[1]
      }

      const certifications = getValue([
        'certifications', 'Certifications', 'certificates', 'Certificates'
      ]).split(',').map(cert => cert.trim()).filter(cert => cert.length > 0)

      return {
        id: String(index + 1),
        name,
        country,
        region,
        wasteType,
        annualVolume: getNumberValue([
          'annual_volume', 'volume', 'Annual Volume', 'Volume', 'tons', 'Tons'
        ]),
        recyclingRate: Math.min(100, getNumberValue([
          'recycling_rate', 'recycling', 'Recycling Rate', 'Recycling', 'recycle_rate'
        ])),
        complianceScore: Math.min(100, getNumberValue([
          'compliance_score', 'compliance', 'Compliance Score', 'Compliance'
        ])),
        coordinates,
        employees: getNumberValue([
          'employees', 'Employees', 'staff', 'Staff', 'workforce', 'Workforce'
        ]) || undefined,
        revenue: getNumberValue([
          'revenue', 'Revenue', 'income', 'Income', 'turnover', 'Turnover'
        ]) || undefined,
        certifications,
        lastUpdated: new Date()
      }
    }).filter(company => company.name !== `Company ${data.length + 1}`)
  }

  private static getRegionFromCountry(country: string): string {
    const regionMap: Record<string, string> = {
      'USA': 'North America',
      'Canada': 'North America',
      'Mexico': 'North America',
      'Germany': 'Europe',
      'France': 'Europe',
      'UK': 'Europe',
      'Italy': 'Europe',
      'Spain': 'Europe',
      'Netherlands': 'Europe',
      'Sweden': 'Europe',
      'Norway': 'Europe',
      'Japan': 'Asia Pacific',
      'China': 'Asia Pacific',
      'Korea': 'Asia Pacific',
      'Australia': 'Asia Pacific',
      'India': 'Asia Pacific',
      'Singapore': 'Asia Pacific',
      'Brazil': 'South America',
      'Argentina': 'South America',
      'Chile': 'South America'
    }

    return regionMap[country] || 'Other'
  }

  static validateCSVStructure(data: any[]): {
    isValid: boolean
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []

    if (!data.length) {
      issues.push('CSV file is empty')
      return { isValid: false, issues, suggestions }
    }

    const firstRow = data[0]
    const requiredFields = ['company_name', 'country', 'waste_type']
    const recommendedFields = ['annual_volume', 'recycling_rate', 'compliance_score']

    // Check for required fields
    const hasRequiredField = (fieldOptions: string[]) =>
      fieldOptions.some(field => Object.keys(firstRow).includes(field))

    if (!hasRequiredField(['company_name', 'company', 'name'])) {
      issues.push('Missing company name field')
    }

    if (!hasRequiredField(['country', 'Country'])) {
      issues.push('Missing country field')
    }

    // Check for recommended fields
    if (!hasRequiredField(['annual_volume', 'volume', 'tons'])) {
      suggestions.push('Consider adding annual volume data')
    }

    if (!hasRequiredField(['recycling_rate', 'recycling'])) {
      suggestions.push('Consider adding recycling rate data')
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    }
  }
}