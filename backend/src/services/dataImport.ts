/**
 * CSV Data Import and Processing Service
 */

import fs from 'fs';
import csv from 'csv-parser';
import { v4 as uuidv4 } from 'uuid';
import DatabaseConnection from '../database/connection';
import { 
  CompanyRecord, 
  WasteStream, 
  WasteMetric, 
  WasteHazardousness, 
  TreatmentMethod 
} from '../types/waste';

interface CSVRow {
  isin?: string;
  lei?: string;
  figi?: string;
  ticker?: string;
  mic_code?: string;
  exchange?: string;
  permid?: string;
  company_name: string;
  country: string;
  sector: string;
  industry: string;
  employees?: string;
  year_of_disclosure: string;
  reporting_period: string;
  metric: string;
  hazardousness: string;
  treatment_method: string;
  value: string;
  unit?: string;
  incomplete_boundaries?: string;
  source_names?: string;
  source_urls?: string;
  company_id: string;
  document_id: string;
  document_urls?: string;
}

export class DataImportService {
  private db: DatabaseConnection;

  constructor() {
    this.db = DatabaseConnection.getInstance();
  }

  public async importCSV(filePath: string): Promise<{ companies: number; wasteStreams: number }> {
    console.log(`Starting CSV import from: ${filePath}`);
    
    const companies = new Map<string, CompanyRecord>();
    const wasteStreams: WasteStream[] = [];
    let processedRows = 0;

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row: CSVRow) => {
          try {
            const company = this.parseCompanyData(row);
            const wasteStream = this.parseWasteStreamData(row);

            companies.set(company.companyId, company);
            wasteStreams.push(wasteStream);
            
            processedRows++;
            if (processedRows % 1000 === 0) {
              console.log(`Processed ${processedRows} rows...`);
            }
          } catch (error) {
            console.warn(`Error processing row ${processedRows + 1}:`, error);
          }
        })
        .on('end', async () => {
          try {
            console.log(`CSV parsing complete. Processing ${companies.size} companies and ${wasteStreams.length} waste streams...`);
            
            await this.saveData(Array.from(companies.values()), wasteStreams);
            await this.calculateAggregations();
            
            console.log('Data import completed successfully');
            resolve({ companies: companies.size, wasteStreams: wasteStreams.length });
          } catch (error) {
            reject(error);
          }
        })
        .on('error', reject);
    });
  }

  private parseCompanyData(row: CSVRow): CompanyRecord {
    return {
      isin: row.isin || undefined,
      lei: row.lei || undefined,
      figi: row.figi || undefined,
      ticker: row.ticker || undefined,
      micCode: row.mic_code || undefined,
      exchange: row.exchange || undefined,
      permId: row.permid || undefined,
      companyName: row.company_name.trim(),
      country: row.country.trim(),
      sector: row.sector.trim(),
      industry: row.industry.trim(),
      employees: row.employees ? parseInt(row.employees) : undefined,
      yearOfDisclosure: parseInt(row.year_of_disclosure),
      reportingPeriod: parseInt(row.reporting_period),
      companyId: row.company_id,
      documentId: row.document_id,
      documentUrls: row.document_urls ? this.parseJsonArray(row.document_urls) : undefined,
      sourceNames: row.source_names ? this.parseJsonArray(row.source_names) : undefined,
      sourceUrls: row.source_urls ? this.parseJsonArray(row.source_urls) : undefined
    };
  }

  private parseWasteStreamData(row: CSVRow): WasteStream {
    return {
      id: uuidv4(),
      companyId: row.company_id,
      metric: row.metric as WasteMetric,
      hazardousness: row.hazardousness as WasteHazardousness,
      treatmentMethod: row.treatment_method as TreatmentMethod,
      value: parseFloat(row.value) || 0,
      unit: row.unit || 'Metric Tonnes',
      reportingPeriod: parseInt(row.reporting_period),
      incompleteBoundaries: row.incomplete_boundaries,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }

  private parseJsonArray(jsonString: string): string[] | undefined {
    try {
      const parsed = JSON.parse(jsonString);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return undefined;
    }
  }

  private async saveData(companies: CompanyRecord[], wasteStreams: WasteStream[]): Promise<void> {
    await this.db.beginTransaction();

    try {
      // Clear existing data
      await this.db.run('DELETE FROM waste_streams');
      await this.db.run('DELETE FROM company_metrics');
      await this.db.run('DELETE FROM companies');

      // Insert companies
      console.log('Inserting companies...');
      for (const company of companies) {
        await this.insertCompany(company);
      }

      // Insert waste streams
      console.log('Inserting waste streams...');
      for (const wasteStream of wasteStreams) {
        await this.insertWasteStream(wasteStream);
      }

      await this.db.commit();
      console.log('Data saved successfully');
    } catch (error) {
      await this.db.rollback();
      throw error;
    }
  }

  private async insertCompany(company: CompanyRecord): Promise<void> {
    const sql = `
      INSERT OR REPLACE INTO companies (
        id, isin, lei, figi, ticker, mic_code, exchange, perm_id,
        company_name, country, sector, industry, employees,
        year_of_disclosure, document_id, document_urls, source_names, source_urls
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(sql, [
      company.companyId,
      company.isin,
      company.lei,
      company.figi,
      company.ticker,
      company.micCode,
      company.exchange,
      company.permId,
      company.companyName,
      company.country,
      company.sector,
      company.industry,
      company.employees,
      company.yearOfDisclosure,
      company.documentId,
      company.documentUrls ? JSON.stringify(company.documentUrls) : null,
      company.sourceNames ? JSON.stringify(company.sourceNames) : null,
      company.sourceUrls ? JSON.stringify(company.sourceUrls) : null
    ]);
  }

  private async insertWasteStream(wasteStream: WasteStream): Promise<void> {
    const sql = `
      INSERT INTO waste_streams (
        id, company_id, reporting_period, metric, hazardousness,
        treatment_method, value, unit, incomplete_boundaries
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.db.run(sql, [
      wasteStream.id,
      wasteStream.companyId,
      wasteStream.reportingPeriod,
      wasteStream.metric,
      wasteStream.hazardousness,
      wasteStream.treatmentMethod,
      wasteStream.value,
      wasteStream.unit,
      wasteStream.incompleteBoundaries
    ]);
  }

  public async calculateAggregations(): Promise<void> {
    console.log('Calculating company metrics aggregations...');
    
    // Clear existing aggregations
    await this.db.run('DELETE FROM company_metrics');

    // Calculate company-level metrics for each reporting period
    const sql = `
      INSERT INTO company_metrics (
        id, company_id, reporting_period,
        total_waste_generated, total_waste_recovered, total_waste_disposed,
        hazardous_waste_generated, hazardous_waste_recovered, hazardous_waste_disposed,
        non_hazardous_waste_generated, non_hazardous_waste_recovered, non_hazardous_waste_disposed,
        recovery_rate, hazardous_recovery_rate, non_hazardous_recovery_rate
      )
      SELECT 
        company_id || '_' || reporting_period as id,
        company_id,
        reporting_period,
        COALESCE(SUM(CASE WHEN metric = 'Total Waste Generated' THEN value END), 0) as total_waste_generated,
        COALESCE(SUM(CASE WHEN metric LIKE '%Recovered' AND hazardousness = 'Total' THEN value END), 0) as total_waste_recovered,
        COALESCE(SUM(CASE WHEN metric LIKE '%Disposed' AND hazardousness = 'Total' THEN value END), 0) as total_waste_disposed,
        COALESCE(SUM(CASE WHEN metric LIKE '%Generated' AND hazardousness = 'Hazardous' THEN value END), 0) as hazardous_waste_generated,
        COALESCE(SUM(CASE WHEN metric LIKE '%Recovered' AND hazardousness = 'Hazardous' THEN value END), 0) as hazardous_waste_recovered,
        COALESCE(SUM(CASE WHEN metric LIKE '%Disposed' AND hazardousness = 'Hazardous' THEN value END), 0) as hazardous_waste_disposed,
        COALESCE(SUM(CASE WHEN metric LIKE '%Generated' AND hazardousness = 'Non-Hazardous' THEN value END), 0) as non_hazardous_waste_generated,
        COALESCE(SUM(CASE WHEN metric LIKE '%Recovered' AND hazardousness = 'Non-Hazardous' THEN value END), 0) as non_hazardous_waste_recovered,
        COALESCE(SUM(CASE WHEN metric LIKE '%Disposed' AND hazardousness = 'Non-Hazardous' THEN value END), 0) as non_hazardous_waste_disposed,
        CASE 
          WHEN SUM(CASE WHEN metric = 'Total Waste Generated' THEN value END) > 0 
          THEN (COALESCE(SUM(CASE WHEN metric LIKE '%Recovered' AND hazardousness = 'Total' THEN value END), 0) * 100.0 / 
                SUM(CASE WHEN metric = 'Total Waste Generated' THEN value END))
          ELSE 0 
        END as recovery_rate,
        CASE 
          WHEN SUM(CASE WHEN metric LIKE '%Generated' AND hazardousness = 'Hazardous' THEN value END) > 0 
          THEN (COALESCE(SUM(CASE WHEN metric LIKE '%Recovered' AND hazardousness = 'Hazardous' THEN value END), 0) * 100.0 / 
                SUM(CASE WHEN metric LIKE '%Generated' AND hazardousness = 'Hazardous' THEN value END))
          ELSE 0 
        END as hazardous_recovery_rate,
        CASE 
          WHEN SUM(CASE WHEN metric LIKE '%Generated' AND hazardousness = 'Non-Hazardous' THEN value END) > 0 
          THEN (COALESCE(SUM(CASE WHEN metric LIKE '%Recovered' AND hazardousness = 'Non-Hazardous' THEN value END), 0) * 100.0 / 
                SUM(CASE WHEN metric LIKE '%Generated' AND hazardousness = 'Non-Hazardous' THEN value END))
          ELSE 0 
        END as non_hazardous_recovery_rate
      FROM waste_streams
      GROUP BY company_id, reporting_period
    `;

    await this.db.run(sql);

    // Calculate country aggregations
    await this.calculateCountryStats();
    
    // Calculate sector aggregations
    await this.calculateSectorStats();

    console.log('Aggregations calculated successfully');
  }

  private async calculateCountryStats(): Promise<void> {
    console.log('Calculating country statistics...');
    
    await this.db.run('DELETE FROM country_stats');

    const sql = `
      INSERT INTO country_stats (id, country, total_companies, total_waste_generated, total_waste_recovered, total_waste_disposed, average_recovery_rate, top_sectors)
      SELECT 
        country as id,
        country,
        COUNT(DISTINCT c.id) as total_companies,
        SUM(cm.total_waste_generated) as total_waste_generated,
        SUM(cm.total_waste_recovered) as total_waste_recovered,
        SUM(cm.total_waste_disposed) as total_waste_disposed,
        AVG(CASE WHEN cm.recovery_rate > 0 THEN cm.recovery_rate END) as average_recovery_rate,
        '[]' as top_sectors
      FROM companies c
      LEFT JOIN company_metrics cm ON c.id = cm.company_id
      GROUP BY country
    `;

    await this.db.run(sql);

    // Update top sectors for each country
    const countries = await this.db.query<{ country: string }>('SELECT DISTINCT country FROM companies');
    
    for (const { country } of countries) {
      const topSectors = await this.db.query<{ sector: string }>(`
        SELECT c.sector, COUNT(*) as company_count
        FROM companies c
        WHERE c.country = ?
        GROUP BY c.sector
        ORDER BY company_count DESC
        LIMIT 3
      `, [country]);

      await this.db.run('UPDATE country_stats SET top_sectors = ? WHERE country = ?', [
        JSON.stringify(topSectors.map(s => s.sector)),
        country
      ]);
    }
  }

  private async calculateSectorStats(): Promise<void> {
    console.log('Calculating sector statistics...');
    
    await this.db.run('DELETE FROM sector_stats');

    const sql = `
      INSERT INTO sector_stats (id, sector, total_companies, total_waste_generated, average_recovery_rate, top_countries, top_performers)
      SELECT 
        sector as id,
        sector,
        COUNT(DISTINCT c.id) as total_companies,
        SUM(cm.total_waste_generated) as total_waste_generated,
        AVG(CASE WHEN cm.recovery_rate > 0 THEN cm.recovery_rate END) as average_recovery_rate,
        '[]' as top_countries,
        '[]' as top_performers
      FROM companies c
      LEFT JOIN company_metrics cm ON c.id = cm.company_id
      GROUP BY sector
    `;

    await this.db.run(sql);

    // Update top countries and performers for each sector
    const sectors = await this.db.query<{ sector: string }>('SELECT DISTINCT sector FROM companies');
    
    for (const { sector } of sectors) {
      const topCountries = await this.db.query<{ country: string }>(`
        SELECT c.country, COUNT(*) as company_count
        FROM companies c
        WHERE c.sector = ?
        GROUP BY c.country
        ORDER BY company_count DESC
        LIMIT 3
      `, [sector]);

      const topPerformers = await this.db.query<{ company_id: string }>(`
        SELECT c.id as company_id
        FROM companies c
        LEFT JOIN company_metrics cm ON c.id = cm.company_id
        WHERE c.sector = ? AND cm.recovery_rate > 0
        ORDER BY cm.recovery_rate DESC, cm.total_waste_generated DESC
        LIMIT 5
      `, [sector]);

      await this.db.run('UPDATE sector_stats SET top_countries = ?, top_performers = ? WHERE sector = ?', [
        JSON.stringify(topCountries.map(c => c.country)),
        JSON.stringify(topPerformers.map(p => p.company_id)),
        sector
      ]);
    }
  }
}