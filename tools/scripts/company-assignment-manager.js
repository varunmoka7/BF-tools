// Company Assignment Manager for 325 Companies
// Waste Management Platform - Data Entry System

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class CompanyAssignmentManager {
  constructor() {
    this.companies = [];
    this.researchers = [
      { name: 'John Doe', capacity: 65, assigned: 0 },
      { name: 'Jane Smith', capacity: 65, assigned: 0 },
      { name: 'Mike Johnson', capacity: 65, assigned: 0 },
      { name: 'Sarah Wilson', capacity: 65, assigned: 0 },
      { name: 'David Brown', capacity: 65, assigned: 0 }
    ];
    this.assignmentFile = '../data/entry-system/company-assignment.csv';
  }

  // Load companies from database or CSV
  async loadCompanies() {
    console.log('Loading companies from database...');
    
    // This would typically load from your Supabase database
    // For now, we'll create sample companies
    this.companies = this.generateSampleCompanies();
    
    console.log(`Loaded ${this.companies.length} companies`);
  }

  // Generate sample companies for testing
  generateSampleCompanies() {
    const companies = [];
    const sectors = ['Industrials', 'Consumer Discretionary', 'Materials', 'Healthcare', 'Financials', 'Technology', 'Communication Services'];
    const countries = ['Germany', 'France', 'Netherlands', 'Switzerland', 'Sweden', 'Denmark', 'Norway'];
    
    for (let i = 1; i <= 325; i++) {
      companies.push({
        id: i,
        company_name: `Company ${i}`,
        country: countries[Math.floor(Math.random() * countries.length)],
        sector: sectors[Math.floor(Math.random() * sectors.length)],
        industry: `Industry ${Math.floor(Math.random() * 10) + 1}`,
        status: 'Not Started',
        assigned_to: '',
        start_date: '',
        target_completion: '',
        progress_percentage: 0,
        quality_score: 0,
        notes: ''
      });
    }
    
    return companies;
  }

  // Assign companies to researchers
  assignCompanies() {
    console.log('Assigning companies to researchers...');
    
    let researcherIndex = 0;
    
    this.companies.forEach((company, index) => {
      // Find researcher with lowest current load
      let minLoad = Infinity;
      let selectedResearcher = 0;
      
      this.researchers.forEach((researcher, idx) => {
        if (researcher.assigned < researcher.capacity && researcher.assigned < minLoad) {
          minLoad = researcher.assigned;
          selectedResearcher = idx;
        }
      });
      
      // Assign company
      company.assigned_to = this.researchers[selectedResearcher].name;
      this.researchers[selectedResearcher].assigned++;
      
      // Set target completion date (1 week from assignment)
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + (index * 7)); // Stagger start dates
      const targetDate = new Date(startDate);
      targetDate.setDate(targetDate.getDate() + 7);
      
      company.start_date = startDate.toISOString().split('T')[0];
      company.target_completion = targetDate.toISOString().split('T')[0];
    });
    
    console.log('Company assignment completed');
  }

  // Export assignments to CSV
  exportAssignments() {
    const csvWriter = createCsvWriter({
      path: path.resolve(__dirname, this.assignmentFile),
      header: [
        { id: 'id', title: 'Company ID' },
        { id: 'company_name', title: 'Company Name' },
        { id: 'country', title: 'Country' },
        { id: 'sector', title: 'Sector' },
        { id: 'industry', title: 'Industry' },
        { id: 'assigned_to', title: 'Assigned To' },
        { id: 'status', title: 'Status' },
        { id: 'start_date', title: 'Start Date' },
        { id: 'target_completion', title: 'Target Completion' },
        { id: 'progress_percentage', title: 'Progress %' },
        { id: 'quality_score', title: 'Quality Score' },
        { id: 'notes', title: 'Notes' }
      ]
    });

    return csvWriter.writeRecords(this.companies);
  }

  // Generate assignment report
  generateAssignmentReport() {
    console.log('\n=== Company Assignment Report ===');
    console.log(`Total Companies: ${this.companies.length}`);
    console.log('\nResearcher Workload:');
    
    this.researchers.forEach(researcher => {
      const assignedCompanies = this.companies.filter(c => c.assigned_to === researcher.name);
      console.log(`${researcher.name}: ${researcher.assigned}/${researcher.capacity} companies`);
    });
    
    console.log('\nSector Distribution:');
    const sectorCount = {};
    this.companies.forEach(company => {
      sectorCount[company.sector] = (sectorCount[company.sector] || 0) + 1;
    });
    
    Object.entries(sectorCount).forEach(([sector, count]) => {
      console.log(`${sector}: ${count} companies`);
    });
    
    console.log('\nCountry Distribution:');
    const countryCount = {};
    this.companies.forEach(company => {
      countryCount[company.country] = (countryCount[company.country] || 0) + 1;
    });
    
    Object.entries(countryCount).forEach(([country, count]) => {
      console.log(`${country}: ${count} companies`);
    });
  }

  // Load existing assignments
  loadExistingAssignments() {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(path.resolve(__dirname, this.assignmentFile))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          this.companies = results;
          resolve(results);
        })
        .on('error', reject);
    });
  }

  // Update company progress
  updateProgress(companyId, status, progressPercentage, qualityScore, notes = '') {
    const company = this.companies.find(c => c.id == companyId);
    if (company) {
      company.status = status;
      company.progress_percentage = progressPercentage;
      company.quality_score = qualityScore;
      company.notes = notes;
      
      // Update CSV file
      this.exportAssignments();
      
      console.log(`Updated progress for ${company.company_name}: ${progressPercentage}% complete`);
    }
  }

  // Get researcher workload
  getResearcherWorkload(researcherName) {
    return this.companies.filter(c => c.assigned_to === researcherName);
  }

  // Reassign company
  reassignCompany(companyId, newResearcher) {
    const company = this.companies.find(c => c.id == companyId);
    if (company) {
      // Update researcher counts
      const oldResearcher = this.researchers.find(r => r.name === company.assigned_to);
      const newResearcherObj = this.researchers.find(r => r.name === newResearcher);
      
      if (oldResearcher) oldResearcher.assigned--;
      if (newResearcherObj) newResearcherObj.assigned++;
      
      company.assigned_to = newResearcher;
      this.exportAssignments();
      
      console.log(`Reassigned ${company.company_name} to ${newResearcher}`);
    }
  }
}

// Example usage
async function main() {
  const manager = new CompanyAssignmentManager();
  
  try {
    // Load companies
    await manager.loadCompanies();
    
    // Assign companies
    manager.assignCompanies();
    
    // Export to CSV
    await manager.exportAssignments();
    
    // Generate report
    manager.generateAssignmentReport();
    
    console.log('\n✅ Company assignment completed successfully!');
    console.log(`📁 Assignment file saved to: ${manager.assignmentFile}`);
    
  } catch (error) {
    console.error('❌ Error in company assignment:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { CompanyAssignmentManager };
