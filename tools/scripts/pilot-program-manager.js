// Pilot Program Manager for 10 Companies
// Waste Management Platform - Task 4

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

class PilotProgramManager {
  constructor() {
    this.pilotCompanies = [];
    this.results = [];
    this.researchers = [
      { name: 'John Doe', assigned: 0, completed: 0 },
      { name: 'Jane Smith', assigned: 0, completed: 0 },
      { name: 'Mike Johnson', assigned: 0, completed: 0 },
      { name: 'Sarah Wilson', assigned: 0, completed: 0 }
    ];
    this.pilotFile = '../../data/pilot-program/pilot-companies.csv';
    this.resultsFile = '../../data/pilot-program/pilot-results-template.csv';
  }

  // Initialize pilot program
  async initializePilot() {
    console.log('🚀 Initializing Pilot Program...');
    
    // Load pilot companies
    await this.loadPilotCompanies();
    
    // Assign companies to researchers
    this.assignPilotCompanies();
    
    // Generate pilot report
    this.generatePilotReport();
    
    console.log('✅ Pilot Program initialized successfully!');
  }

  // Load pilot companies from CSV
  async loadPilotCompanies() {
    return new Promise((resolve, reject) => {
      const results = [];
      fs.createReadStream(path.resolve(__dirname, this.pilotFile))
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          this.pilotCompanies = results;
          console.log(`📋 Loaded ${this.pilotCompanies.length} pilot companies`);
          resolve(results);
        })
        .on('error', reject);
    });
  }

  // Assign pilot companies to researchers
  assignPilotCompanies() {
    console.log('�� Assigning pilot companies to researchers...');
    
    this.pilotCompanies.forEach((company, index) => {
      // Simple round-robin assignment
      const researcherIndex = index % this.researchers.length;
      company.assigned_to = this.researchers[researcherIndex].name;
      this.researchers[researcherIndex].assigned++;
      
      // Set start and target dates
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + index); // Stagger start dates
      const targetDate = new Date(startDate);
      targetDate.setDate(targetDate.getDate() + 7);
      
      company.start_date = startDate.toISOString().split('T')[0];
      company.target_completion = targetDate.toISOString().split('T')[0];
    });
    
    console.log('✅ Pilot companies assigned');
  }

  // Update pilot company progress
  updatePilotProgress(companyName, status, progressPercentage, qualityScore, timeSpent, issues = '') {
    const company = this.pilotCompanies.find(c => c.company_name === companyName);
    if (company) {
      company.status = status;
      company.progress_percentage = progressPercentage;
      company.quality_score = qualityScore;
      company.time_spent = timeSpent;
      company.issues = issues;
      
      // Update researcher stats
      const researcher = this.researchers.find(r => r.name === company.assigned_to);
      if (researcher && status === 'Completed') {
        researcher.completed++;
      }
      
      console.log(`📊 Updated progress for ${companyName}: ${progressPercentage}% complete`);
    }
  }

  // Record pilot results
  recordPilotResult(resultData) {
    this.results.push({
      company_name: resultData.company_name,
      researcher: resultData.researcher,
      start_time: resultData.start_time,
      completion_time: resultData.completion_time,
      time_spent_hours: resultData.time_spent_hours,
      data_completeness_percentage: resultData.data_completeness_percentage,
      quality_score: resultData.quality_score,
      source_verification: resultData.source_verification,
      issues_encountered: resultData.issues_encountered,
      process_improvements: resultData.process_improvements,
      user_satisfaction: resultData.user_satisfaction,
      database_import_status: resultData.database_import_status,
      notes: resultData.notes
    });
    
    console.log(`📝 Recorded results for ${resultData.company_name}`);
  }

  // Generate pilot progress report
  generatePilotReport() {
    console.log('\n=== 🎯 Pilot Program Progress Report ===');
    
    // Overall progress
    const totalCompanies = this.pilotCompanies.length;
    const completedCompanies = this.pilotCompanies.filter(c => c.status === 'Completed').length;
    const inProgressCompanies = this.pilotCompanies.filter(c => c.status === 'In Progress').length;
    const notStartedCompanies = this.pilotCompanies.filter(c => c.status === 'Not Started').length;
    
    console.log(`📊 Overall Progress:`);
    console.log(`   Total Companies: ${totalCompanies}`);
    console.log(`   Completed: ${completedCompanies}`);
    console.log(`   In Progress: ${inProgressCompanies}`);
    console.log(`   Not Started: ${notStartedCompanies}`);
    console.log(`   Completion Rate: ${((completedCompanies / totalCompanies) * 100).toFixed(1)}%`);
    
    // Researcher progress
    console.log(`\n👥 Researcher Progress:`);
    this.researchers.forEach(researcher => {
      const assignedCompanies = this.pilotCompanies.filter(c => c.assigned_to === researcher.name);
      const completed = assignedCompanies.filter(c => c.status === 'Completed').length;
      console.log(`   ${researcher.name}: ${completed}/${researcher.assigned} completed`);
    });
    
    // Sector distribution
    console.log(`\n🏭 Sector Distribution:`);
    const sectorCount = {};
    this.pilotCompanies.forEach(company => {
      sectorCount[company.sector] = (sectorCount[company.sector] || 0) + 1;
    });
    
    Object.entries(sectorCount).forEach(([sector, count]) => {
      console.log(`   ${sector}: ${count} companies`);
    });
    
    // Complexity distribution
    console.log(`\n📈 Complexity Distribution:`);
    const complexityCount = {};
    this.pilotCompanies.forEach(company => {
      complexityCount[company.complexity_level] = (complexityCount[company.complexity_level] || 0) + 1;
    });
    
    Object.entries(complexityCount).forEach(([complexity, count]) => {
      console.log(`   ${complexity}: ${count} companies`);
    });
  }

  // Generate final pilot results report
  generateFinalResultsReport() {
    console.log('\n=== �� Final Pilot Results Report ===');
    
    if (this.results.length === 0) {
      console.log('No results recorded yet.');
      return;
    }
    
    // Calculate averages
    const avgTimeSpent = this.results.reduce((sum, r) => sum + (r.time_spent_hours || 0), 0) / this.results.length;
    const avgCompleteness = this.results.reduce((sum, r) => sum + (r.data_completeness_percentage || 0), 0) / this.results.length;
    const avgQualityScore = this.results.reduce((sum, r) => sum + (r.quality_score || 0), 0) / this.results.length;
    const avgUserSatisfaction = this.results.reduce((sum, r) => sum + (r.user_satisfaction || 0), 0) / this.results.length;
    
    console.log(`📊 Performance Metrics:`);
    console.log(`   Average Time Spent: ${avgTimeSpent.toFixed(1)} hours per company`);
    console.log(`   Average Data Completeness: ${avgCompleteness.toFixed(1)}%`);
    console.log(`   Average Quality Score: ${avgQualityScore.toFixed(1)}/10`);
    console.log(`   Average User Satisfaction: ${avgUserSatisfaction.toFixed(1)}/10`);
    
    // Success metrics
    const successfulImports = this.results.filter(r => r.database_import_status === 'Success').length;
    const importSuccessRate = (successfulImports / this.results.length) * 100;
    
    console.log(`\n✅ Success Metrics:`);
    console.log(`   Database Import Success Rate: ${importSuccessRate.toFixed(1)}%`);
    console.log(`   Companies Meeting Quality Standards: ${this.results.filter(r => r.quality_score >= 8).length}/${this.results.length}`);
    
    // Issues and improvements
    const issues = this.results.filter(r => r.issues_encountered && r.issues_encountered.trim() !== '');
    const improvements = this.results.filter(r => r.process_improvements && r.process_improvements.trim() !== '');
    
    if (issues.length > 0) {
      console.log(`\n⚠️ Issues Encountered:`);
      issues.forEach(result => {
        console.log(`   ${result.company_name}: ${result.issues_encountered}`);
      });
    }
    
    if (improvements.length > 0) {
      console.log(`\n💡 Process Improvements Suggested:`);
      improvements.forEach(result => {
        console.log(`   ${result.company_name}: ${result.process_improvements}`);
      });
    }
  }

  // Export pilot results to CSV
  async exportPilotResults() {
    const csvWriter = createCsvWriter({
      path: path.resolve(__dirname, this.resultsFile),
      header: [
        { id: 'company_name', title: 'Company Name' },
        { id: 'researcher', title: 'Researcher' },
        { id: 'start_time', title: 'Start Time' },
        { id: 'completion_time', title: 'Completion Time' },
        { id: 'time_spent_hours', title: 'Time Spent (Hours)' },
        { id: 'data_completeness_percentage', title: 'Data Completeness %' },
        { id: 'quality_score', title: 'Quality Score' },
        { id: 'source_verification', title: 'Source Verification' },
        { id: 'issues_encountered', title: 'Issues Encountered' },
        { id: 'process_improvements', title: 'Process Improvements' },
        { id: 'user_satisfaction', title: 'User Satisfaction (1-10)' },
        { id: 'database_import_status', title: 'Database Import Status' },
        { id: 'notes', title: 'Notes' }
      ]
    });

    await csvWriter.writeRecords(this.results);
    console.log(`📁 Pilot results exported to: ${this.resultsFile}`);
  }

  // Check pilot success criteria
  checkPilotSuccessCriteria() {
    console.log('\n=== 🎯 Pilot Success Criteria Check ===');
    
    const criteria = {
      completion: this.results.length === 10,
      quality: this.results.every(r => r.quality_score >= 8),
      completeness: this.results.every(r => r.data_completeness_percentage >= 85),
      userSatisfaction: this.results.every(r => r.user_satisfaction >= 8),
      importSuccess: this.results.every(r => r.database_import_status === 'Success')
    };
    
    console.log(`✅ All 10 companies completed: ${criteria.completion ? 'YES' : 'NO'}`);
    console.log(`✅ Quality score ≥8 for all: ${criteria.quality ? 'YES' : 'NO'}`);
    console.log(`✅ Data completeness ≥85% for all: ${criteria.completeness ? 'YES' : 'NO'}`);
    console.log(`✅ User satisfaction ≥8 for all: ${criteria.userSatisfaction ? 'YES' : 'NO'}`);
    console.log(`✅ Database import success for all: ${criteria.importSuccess ? 'YES' : 'NO'}`);
    
    const allCriteriaMet = Object.values(criteria).every(c => c);
    console.log(`\n🎯 Overall Pilot Success: ${allCriteriaMet ? 'SUCCESS' : 'NEEDS IMPROVEMENT'}`);
    
    return allCriteriaMet;
  }

  // Generate scaling recommendations
  generateScalingRecommendations() {
    console.log('\n=== 🚀 Scaling Recommendations ===');
    
    const avgTimeSpent = this.results.reduce((sum, r) => sum + (r.time_spent_hours || 0), 0) / this.results.length;
    const weeklyCapacity = 40; // hours per week per researcher
    const companiesPerWeek = Math.floor(weeklyCapacity / avgTimeSpent);
    
    console.log(`📊 Based on pilot results:`);
    console.log(`   Average time per company: ${avgTimeSpent.toFixed(1)} hours`);
    console.log(`   Companies per week per researcher: ${companiesPerWeek}`);
    console.log(`   Recommended team size for 325 companies: ${Math.ceil(325 / (companiesPerWeek * 4))} researchers`);
    
    // Process improvements
    console.log(`\n💡 Process Improvements:`);
    console.log(`   - Standardize research sources for faster data collection`);
    console.log(`   - Create templates for common company types`);
    console.log(`   - Implement batch processing for similar companies`);
    console.log(`   - Add automated data validation to reduce review time`);
  }
}

// Example usage
async function main() {
  const pilotManager = new PilotProgramManager();
  
  try {
    // Initialize pilot program
    await pilotManager.initializePilot();
    
    // Simulate some progress updates
    pilotManager.updatePilotProgress('Siemens AG', 'In Progress', 60, 8, 4, 'Complex ESG reporting structure');
    pilotManager.updatePilotProgress('Volkswagen AG', 'Completed', 100, 9, 6, '');
    
    // Record some results
    pilotManager.recordPilotResult({
      company_name: 'Volkswagen AG',
      researcher: 'Jane Smith',
      start_time: '2024-01-22 09:00',
      completion_time: '2024-01-22 15:00',
      time_spent_hours: 6,
      data_completeness_percentage: 95,
      quality_score: 9,
      source_verification: 'All sources verified',
      issues_encountered: 'None',
      process_improvements: 'Template worked well for automotive companies',
      user_satisfaction: 9,
      database_import_status: 'Success',
      notes: 'Excellent ESG reporting available'
    });
    
    // Generate reports
    pilotManager.generatePilotReport();
    pilotManager.generateFinalResultsReport();
    pilotManager.checkPilotSuccessCriteria();
    pilotManager.generateScalingRecommendations();
    
    // Export results
    await pilotManager.exportPilotResults();
    
  } catch (error) {
    console.error('❌ Pilot program error:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { PilotProgramManager };
