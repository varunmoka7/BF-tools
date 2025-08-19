const { mockWasteCompanies } = require('./src/data/mock-data.ts');

console.log('Testing company data:');
console.log('Number of companies:', mockWasteCompanies.length);
console.log('First company:', mockWasteCompanies[0]);

// Test the filtering logic
const filteredCompanies = mockWasteCompanies.filter(company => 
  company.name.toLowerCase().includes('eco')
);

console.log('Companies with "eco" in name:', filteredCompanies.length);
console.log('Filtered companies:', filteredCompanies.map(c => c.name));
