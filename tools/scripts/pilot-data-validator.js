// Pilot Data Validator for Quality Assurance
// Waste Management Platform - Task 4

const fs = require('fs');
const path = require('path');

class PilotDataValidator {
  constructor() {
    this.validationRules = this.initializeValidationRules();
    this.validationResults = [];
  }

  // Initialize validation rules
  initializeValidationRules() {
    return {
      required_fields: [
        'company_name',
        'country',
        'sector',
        'description',
        'website_url'
      ],
      
      url_fields: [
        'website_url',
        'primary_contact_email',
        'sustainability_contact_email'
      ],
      
      numeric_fields: [
        'founded_year',
        'revenue_usd',
        'market_cap_usd',
        'recycling_facilities_count',
        'zero_waste_target_year',
        'carbon_neutrality_target_year'
      ],
      
      boolean_fields: [
        'is_public',
        'zero_waste_commitment',
        'carbon_neutrality_commitment'
      ],
      
      array_fields: [
        'primary_waste_materials',
        'waste_treatment_methods'
      ],
      
      min_lengths: {
        'description': 100,
        'business_overview': 50,
        'waste_management_strategy': 100,
        'sustainability_goals': 50,
        'circular_economy_initiatives': 50
      },
      
      max_lengths: {
        'company_name': 200,
        'description': 2000,
        'business_overview': 1000,
        'website_url': 500
      },
      
      year_range: {
        min: 1800,
        max: new Date().getFullYear()
      }
    };
  }

  // Validate company data
  validateCompanyData(companyData) {
    console.log(`🔍 Validating data for ${companyData.company_name}...`);
    
    const validationResult = {
      company_name: companyData.company_name,
      validation_date: new Date().toISOString(),
      errors: [],
      warnings: [],
      score: 100,
      passed: true
    };

    // Check required fields
    this.validationRules.required_fields.forEach(field => {
      if (!companyData[field] || companyData[field].toString().trim() === '') {
        validationResult.errors.push(`Missing required field: ${field}`);
        validationResult.score -= 10;
        validationResult.passed = false;
      }
    });

    // Validate URLs
    this.validationRules.url_fields.forEach(field => {
      if (companyData[field] && companyData[field].toString().trim() !== '') {
        if (!this.isValidUrl(companyData[field])) {
          validationResult.errors.push(`Invalid URL format: ${field}`);
          validationResult.score -= 5;
        }
      }
    });

    // Validate emails
    if (companyData.primary_contact_email && !this.isValidEmail(companyData.primary_contact_email)) {
      validationResult.errors.push('Invalid primary contact email format');
      validationResult.score -= 5;
    }

    if (companyData.sustainability_contact_email && !this.isValidEmail(companyData.sustainability_contact_email)) {
      validationResult.errors.push('Invalid sustainability contact email format');
      validationResult.score -= 5;
    }

    // Validate numeric fields
    this.validationRules.numeric_fields.forEach(field => {
      if (companyData[field] !== undefined && companyData[field] !== null && companyData[field] !== '') {
        const numValue = parseFloat(companyData[field]);
        if (isNaN(numValue)) {
          validationResult.errors.push(`Invalid numeric value: ${field}`);
          validationResult.score -= 5;
        } else if (field.includes('year') && (numValue < this.validationRules.year_range.min || numValue > this.validationRules.year_range.max)) {
          validationResult.errors.push(`Year out of range: ${field}`);
          validationResult.score -= 5;
        }
      }
    });

    // Validate boolean fields
    this.validationRules.boolean_fields.forEach(field => {
      if (companyData[field] !== undefined && companyData[field] !== null && companyData[field] !== '') {
        const boolValue = companyData[field];
        if (typeof boolValue !== 'boolean' && boolValue !== 'true' && boolValue !== 'false') {
          validationResult.errors.push(`Invalid boolean value: ${field}`);
          validationResult.score -= 5;
        }
      }
    });

    // Validate array fields
    this.validationRules.array_fields.forEach(field => {
      if (companyData[field] && !Array.isArray(companyData[field])) {
        validationResult.errors.push(`Field should be array: ${field}`);
        validationResult.score -= 5;
      }
    });

    // Check minimum lengths
    Object.entries(this.validationRules.min_lengths).forEach(([field, minLength]) => {
      if (companyData[field] && companyData[field].toString().length < minLength) {
        validationResult.warnings.push(`${field} is shorter than recommended (${minLength} characters)`);
        validationResult.score -= 2;
      }
    });

    // Check maximum lengths
    Object.entries(this.validationRules.max_lengths).forEach(([field, maxLength]) => {
      if (companyData[field] && companyData[field].toString().length > maxLength) {
        validationResult.errors.push(`${field} exceeds maximum length (${maxLength} characters)`);
        validationResult.score -= 5;
      }
    });

    // Validate waste profile data
    if (companyData.waste_profile) {
      const wasteValidation = this.validateWasteProfile(companyData.waste_profile);
      validationResult.errors.push(...wasteValidation.errors);
      validationResult.warnings.push(...wasteValidation.warnings);
      validationResult.score += wasteValidation.score - 100;
    }

    // Validate ESG documents
    if (companyData.esg_documents && Array.isArray(companyData.esg_documents)) {
      companyData.esg_documents.forEach((doc, index) => {
        const docValidation = this.validateESGDocument(doc);
        validationResult.errors.push(...docValidation.errors.map(err => `ESG Document ${index + 1}: ${err}`));
        validationResult.warnings.push(...docValidation.warnings.map(warn => `ESG Document ${index + 1}: ${warn}`));
        validationResult.score += docValidation.score - 100;
      });
    }

    // Ensure score doesn't go below 0
    validationResult.score = Math.max(0, validationResult.score);
    
    // Determine if passed
    validationResult.passed = validationResult.score >= 80 && validationResult.errors.length === 0;

    this.validationResults.push(validationResult);
    
    console.log(`✅ Validation completed for ${companyData.company_name} - Score: ${validationResult.score}/100`);
    
    return validationResult;
  }

  // Validate waste profile data
  validateWasteProfile(wasteProfile) {
    const result = {
      errors: [],
      warnings: [],
      score: 100
    };

    if (!wasteProfile.primary_waste_materials || !Array.isArray(wasteProfile.primary_waste_materials) || wasteProfile.primary_waste_materials.length === 0) {
      result.errors.push('Primary waste materials must be specified');
      result.score -= 15;
    }

    if (!wasteProfile.waste_management_strategy || wasteProfile.waste_management_strategy.trim() === '') {
      result.errors.push('Waste management strategy is required');
      result.score -= 15;
    }

    if (!wasteProfile.waste_treatment_methods || !Array.isArray(wasteProfile.waste_treatment_methods) || wasteProfile.waste_treatment_methods.length === 0) {
      result.errors.push('Waste treatment methods must be specified');
      result.score -= 10;
    }

    return result;
  }

  // Validate ESG document data
  validateESGDocument(document) {
    const result = {
      errors: [],
      warnings: [],
      score: 100
    };

    if (!document.document_type || document.document_type.trim() === '') {
      result.errors.push('Document type is required');
      result.score -= 20;
    }

    if (!document.document_title || document.document_title.trim() === '') {
      result.errors.push('Document title is required');
      result.score -= 20;
    }

    if (!document.document_url || document.document_url.trim() === '') {
      result.errors.push('Document URL is required');
      result.score -= 20;
    }

    return result;
  }

  // Check if URL is valid
  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  // Check if email is valid
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Generate validation report
  generateValidationReport() {
    console.log('\n=== 📋 Data Validation Report ===');
    
    if (this.validationResults.length === 0) {
      console.log('No validation results available.');
      return;
    }

    const totalCompanies = this.validationResults.length;
    const passedValidation = this.validationResults.filter(r => r.passed).length;
    const averageScore = this.validationResults.reduce((sum, r) => sum + r.score, 0) / totalCompanies;
    
    console.log(`📊 Overall Validation Results:`);
    console.log(`   Total Companies Validated: ${totalCompanies}`);
    console.log(`   Passed Validation: ${passedValidation}`);
    console.log(`   Failed Validation: ${totalCompanies - passedValidation}`);
    console.log(`   Success Rate: ${((passedValidation / totalCompanies) * 100).toFixed(1)}%`);
    console.log(`   Average Score: ${averageScore.toFixed(1)}/100`);

    console.log(`\n🏢 Company Validation Results:`);
    this.validationResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`   ${result.company_name}: ${status} (${result.score}/100)`);
    });
  }

  // Export validation results
  exportValidationResults() {
    const report = {
      validation_date: new Date().toISOString(),
      total_companies: this.validationResults.length,
      passed_validation: this.validationResults.filter(r => r.passed).length,
      average_score: this.validationResults.reduce((sum, r) => sum + r.score, 0) / this.validationResults.length,
      results: this.validationResults
    };

    const filename = `validation-report-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(report, null, 2));
    
    console.log(`📁 Validation report exported to: ${filename}`);
  }
}

module.exports = { PilotDataValidator };
