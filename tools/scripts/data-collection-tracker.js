// Data Collection Tracker for 325 Companies
// Waste Management Platform

const fs = require('fs');
const path = require('path');

class DataCollectionTracker {
  constructor() {
    this.companies = [];
    this.progress = {
      total: 325,
      completed: 0,
      inProgress: 0,
      notStarted: 325
    };
  }

  addCompany(companyData) {
    this.companies.push({
      id: companyData.id,
      name: companyData.company_name,
      country: companyData.country,
      sector: companyData.sector,
      status: 'not_started',
      completionPercentage: 0,
      dataQualityScore: 0,
      assignedTo: '',
      startDate: null,
      completionDate: null,
      notes: ''
    });
  }

  updateProgress(companyId, status, completionPercentage, dataQualityScore) {
    const company = this.companies.find(c => c.id === companyId);
    if (company) {
      company.status = status;
      company.completionPercentage = completionPercentage;
      company.dataQualityScore = dataQualityScore;
      this.updateOverallProgress();
    }
  }

  updateOverallProgress() {
    this.progress.completed = this.companies.filter(c => c.status === 'completed').length;
    this.progress.inProgress = this.companies.filter(c => c.status === 'in_progress').length;
    this.progress.notStarted = this.companies.filter(c => c.status === 'not_started').length;
  }

  generateReport() {
    return {
      total: this.progress.total,
      completed: this.progress.completed,
      inProgress: this.progress.inProgress,
      notStarted: this.progress.notStarted,
      completionRate: (this.progress.completed / this.progress.total) * 100,
      averageQualityScore: this.companies.reduce((sum, c) => sum + c.dataQualityScore, 0) / this.companies.length
    };
  }

  exportToCSV() {
    const csvContent = this.companies.map(company => 
      `${company.id},${company.name},${company.country},${company.sector},${company.status},${company.completionPercentage},${company.dataQualityScore}`
    ).join('\n');
    
    fs.writeFileSync('data-collection-progress.csv', csvContent);
  }

  // Load companies from database
  async loadCompaniesFromDatabase() {
    // This would connect to your Supabase database
    // and load the 325 companies
    console.log('Loading companies from database...');
  }

  // Generate weekly report
  generateWeeklyReport() {
    const report = this.generateReport();
    console.log('=== Weekly Data Collection Report ===');
    console.log(`Total Companies: ${report.total}`);
    console.log(`Completed: ${report.completed}`);
    console.log(`In Progress: ${report.inProgress}`);
    console.log(`Not Started: ${report.notStarted}`);
    console.log(`Completion Rate: ${report.completionRate.toFixed(1)}%`);
    console.log(`Average Quality Score: ${report.averageQualityScore.toFixed(1)}/10`);
  }
}

// Example usage
const tracker = new DataCollectionTracker();

// Add sample companies
tracker.addCompany({
  id: '1',
  company_name: 'Siemens AG',
  country: 'Germany',
  sector: 'Industrials'
});

tracker.addCompany({
  id: '2',
  company_name: 'Volkswagen AG',
  country: 'Germany',
  sector: 'Consumer Discretionary'
});

// Update progress
tracker.updateProgress('1', 'in_progress', 60, 8);
tracker.updateProgress('2', 'completed', 95, 9);

// Generate report
tracker.generateWeeklyReport();

module.exports = { DataCollectionTracker };
