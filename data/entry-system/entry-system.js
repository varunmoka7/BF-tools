// Data Entry System - Main Application Logic
// Waste Management Platform

class DataEntrySystem {
  constructor() {
    this.currentCompany = null;
    this.formData = {};
    this.autoSaveInterval = null;
    this.initializeSystem();
  }

  // Initialize the data entry system
  initializeSystem() {
    console.log('Initializing Data Entry System...');
    
    // Set up auto-save
    this.setupAutoSave();
    
    // Load company assignment
    this.loadCompanyAssignment();
    
    // Set up form validation
    this.setupFormValidation();
    
    // Set up progress tracking
    this.setupProgressTracking();
    
    console.log('✅ Data Entry System initialized');
  }

  // Load company assignment for current user
  loadCompanyAssignment() {
    const currentUser = this.getCurrentUser();
    const assignments = this.loadAssignmentsFromCSV();
    
    this.currentCompany = assignments.find(assignment => 
      assignment.assigned_to === currentUser && 
      assignment.status !== 'Completed'
    );
    
    if (this.currentCompany) {
      this.loadCompanyData(this.currentCompany);
      this.updateProgressDisplay();
    } else {
      this.showNoCompaniesMessage();
    }
  }

  // Load company data from database
  async loadCompanyData(company) {
    try {
      console.log(`Loading data for ${company.company_name}...`);
      
      // This would fetch from your Supabase database
      const companyData = await this.fetchCompanyFromDatabase(company.company_id);
      
      if (companyData) {
        this.populateForm(companyData);
        this.formData = companyData;
      } else {
        this.initializeEmptyForm(company);
      }
      
    } catch (error) {
      console.error('Error loading company data:', error);
      this.showErrorMessage('Failed to load company data');
    }
  }

  // Populate form with existing data
  populateForm(data) {
    // Basic company information
    this.setFieldValue('company_name', data.company_name);
    this.setFieldValue('country', data.country);
    this.setFieldValue('sector', data.sector);
    this.setFieldValue('industry', data.industry);
    this.setFieldValue('description', data.description);
    this.setFieldValue('business_overview', data.business_overview);
    this.setFieldValue('website_url', data.website_url);
    this.setFieldValue('founded_year', data.founded_year);
    this.setFieldValue('headquarters', data.headquarters);
    this.setFieldValue('revenue_usd', data.revenue_usd);
    this.setFieldValue('is_public', data.is_public);
    this.setFieldValue('stock_exchange', data.stock_exchange);
    this.setFieldValue('market_cap_usd', data.market_cap_usd);
    
    // Contact information
    this.setFieldValue('primary_contact_email', data.primary_contact_email);
    this.setFieldValue('primary_contact_phone', data.primary_contact_phone);
    this.setFieldValue('sustainability_contact_email', data.sustainability_contact_email);
    this.setFieldValue('sustainability_contact_phone', data.sustainability_contact_phone);
    
    // Waste management profile
    if (data.waste_profile) {
      this.populateWasteProfile(data.waste_profile);
    }
    
    // ESG documents
    if (data.esg_documents) {
      this.populateESGDocuments(data.esg_documents);
    }
    
    // Sustainability metrics
    if (data.sustainability_metrics) {
      this.populateSustainabilityMetrics(data.sustainability_metrics);
    }
    
    // Certifications
    if (data.certifications) {
      this.populateCertifications(data.certifications);
    }
    
    // Waste facilities
    if (data.waste_facilities) {
      this.populateWasteFacilities(data.waste_facilities);
    }
    
    console.log('Form populated with existing data');
  }

  // Initialize empty form for new company
  initializeEmptyForm(company) {
    this.setFieldValue('company_name', company.company_name);
    this.setFieldValue('country', company.country);
    this.setFieldValue('sector', company.sector);
    this.setFieldValue('industry', company.industry);
    
    // Clear all other fields
    this.clearForm();
    
    console.log('Initialized empty form for new company');
  }

  // Set field value
  setFieldValue(fieldName, value) {
    const field = document.getElementById(fieldName);
    if (field) {
      if (field.type === 'checkbox') {
        field.checked = value;
      } else {
        field.value = value || '';
      }
    }
  }

  // Clear form fields
  clearForm() {
    const fields = document.querySelectorAll('input, textarea, select');
    fields.forEach(field => {
      if (field.type === 'checkbox') {
        field.checked = false;
      } else {
        field.value = '';
      }
    });
  }

  // Setup auto-save functionality
  setupAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      this.autoSave();
    }, 30000); // Auto-save every 30 seconds
    
    console.log('Auto-save enabled (every 30 seconds)');
  }

  // Auto-save current form data
  autoSave() {
    if (this.currentCompany) {
      const formData = this.collectFormData();
      this.saveToLocalStorage(formData);
      this.updateProgress();
      
      console.log('Auto-saved form data');
    }
  }

  // Collect form data
  collectFormData() {
    const formData = {
      company_id: this.currentCompany?.company_id,
      company_name: this.getFieldValue('company_name'),
      country: this.getFieldValue('country'),
      sector: this.getFieldValue('sector'),
      industry: this.getFieldValue('industry'),
      description: this.getFieldValue('description'),
      business_overview: this.getFieldValue('business_overview'),
      website_url: this.getFieldValue('website_url'),
      founded_year: parseInt(this.getFieldValue('founded_year')) || null,
      headquarters: this.getFieldValue('headquarters'),
      revenue_usd: parseFloat(this.getFieldValue('revenue_usd')) || null,
      is_public: this.getFieldValue('is_public') === 'true',
      stock_exchange: this.getFieldValue('stock_exchange'),
      market_cap_usd: parseFloat(this.getFieldValue('market_cap_usd')) || null,
      primary_contact_email: this.getFieldValue('primary_contact_email'),
      primary_contact_phone: this.getFieldValue('primary_contact_phone'),
      sustainability_contact_email: this.getFieldValue('sustainability_contact_email'),
      sustainability_contact_phone: this.getFieldValue('sustainability_contact_phone'),
      
      // Waste profile
      waste_profile: this.collectWasteProfileData(),
      
      // ESG documents
      esg_documents: this.collectESGDocumentsData(),
      
      // Sustainability metrics
      sustainability_metrics: this.collectSustainabilityMetricsData(),
      
      // Certifications
      certifications: this.collectCertificationsData(),
      
      // Waste facilities
      waste_facilities: this.collectWasteFacilitiesData(),
      
      // Metadata
      last_updated: new Date().toISOString(),
      updated_by: this.getCurrentUser()
    };
    
    return formData;
  }

  // Get field value
  getFieldValue(fieldName) {
    const field = document.getElementById(fieldName);
    if (field) {
      if (field.type === 'checkbox') {
        return field.checked;
      } else {
        return field.value;
      }
    }
    return '';
  }

  // Collect waste profile data
  collectWasteProfileData() {
    return {
      primary_waste_materials: this.getSelectedWasteMaterials(),
      waste_management_strategy: this.getFieldValue('waste_management_strategy'),
      recycling_facilities_count: parseInt(this.getFieldValue('recycling_facilities_count')) || 0,
      waste_treatment_methods: this.getSelectedTreatmentMethods(),
      sustainability_goals: this.getFieldValue('sustainability_goals'),
      circular_economy_initiatives: this.getFieldValue('circular_economy_initiatives'),
      zero_waste_commitment: this.getFieldValue('zero_waste_commitment') === 'true',
      zero_waste_target_year: parseInt(this.getFieldValue('zero_waste_target_year')) || null,
      carbon_neutrality_commitment: this.getFieldValue('carbon_neutrality_commitment') === 'true',
      carbon_neutrality_target_year: parseInt(this.getFieldValue('carbon_neutrality_target_year')) || null
    };
  }

  // Get selected waste materials
  getSelectedWasteMaterials() {
    const checkboxes = document.querySelectorAll('input[name="waste_materials"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }

  // Get selected treatment methods
  getSelectedTreatmentMethods() {
    const checkboxes = document.querySelectorAll('input[name="treatment_methods"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
  }

  // Setup form validation
  setupFormValidation() {
    const form = document.getElementById('company-entry-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.validateAndSubmit();
      });
    }
  }

  // Validate and submit form
  validateAndSubmit() {
    const validationErrors = this.validateForm();
    
    if (validationErrors.length > 0) {
      this.showValidationErrors(validationErrors);
      return;
    }
    
    this.submitForm();
  }

  // Validate form data
  validateForm() {
    const errors = [];
    
    // Required fields
    const requiredFields = ['company_name', 'country', 'sector', 'description'];
    requiredFields.forEach(field => {
      if (!this.getFieldValue(field)) {
        errors.push(`${field.replace('_', ' ')} is required`);
      }
    });
    
    // URL validation
    const websiteUrl = this.getFieldValue('website_url');
    if (websiteUrl && !this.isValidUrl(websiteUrl)) {
      errors.push('Website URL must be a valid URL');
    }
    
    // Email validation
    const emailFields = ['primary_contact_email', 'sustainability_contact_email'];
    emailFields.forEach(field => {
      const email = this.getFieldValue(field);
      if (email && !this.isValidEmail(email)) {
        errors.push(`${field.replace('_', ' ')} must be a valid email`);
      }
    });
    
    return errors;
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

  // Show validation errors
  showValidationErrors(errors) {
    const errorContainer = document.getElementById('validation-errors');
    if (errorContainer) {
      errorContainer.innerHTML = errors.map(error => `<div class="error">${error}</div>`).join('');
      errorContainer.style.display = 'block';
    }
  }

  // Submit form data
  async submitForm() {
    try {
      const formData = this.collectFormData();
      
      // Show loading state
      this.showLoadingState();
      
      // Submit to database
      const result = await this.submitToDatabase(formData);
      
      if (result.success) {
        this.showSuccessMessage('Company data saved successfully!');
        this.updateProgress();
        this.loadNextCompany();
      } else {
        this.showErrorMessage('Failed to save company data');
      }
      
    } catch (error) {
      console.error('Submit error:', error);
      this.showErrorMessage('An error occurred while saving data');
    } finally {
      this.hideLoadingState();
    }
  }

  // Setup progress tracking
  setupProgressTracking() {
    this.updateProgressDisplay();
    
    // Update progress every 5 minutes
    setInterval(() => {
      this.updateProgress();
    }, 300000);
  }

  // Update progress display
  updateProgressDisplay() {
    if (this.currentCompany) {
      const progressElement = document.getElementById('progress-display');
      if (progressElement) {
        const completionPercentage = this.calculateCompletionPercentage();
        progressElement.innerHTML = `
          <div class="progress-info">
            <h3>Current Company: ${this.currentCompany.company_name}</h3>
            <p>Progress: ${completionPercentage}% complete</p>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${completionPercentage}%"></div>
            </div>
          </div>
        `;
      }
    }
  }

  // Calculate completion percentage
  calculateCompletionPercentage() {
    const formData = this.collectFormData();
    const requiredFields = [
      'company_name', 'country', 'sector', 'description', 'website_url',
      'waste_management_strategy', 'sustainability_goals'
    ];
    
    let completedFields = 0;
    requiredFields.forEach(field => {
      if (formData[field] && formData[field].toString().trim() !== '') {
        completedFields++;
      }
    });
    
    return Math.round((completedFields / requiredFields.length) * 100);
  }

  // Utility methods
  getCurrentUser() {
    // This would get the current user from your authentication system
    return 'John Doe'; // Placeholder
  }

  loadAssignmentsFromCSV() {
    // This would load from your CSV file
    return []; // Placeholder
  }

  async fetchCompanyFromDatabase(companyId) {
    // This would fetch from your Supabase database
    return null; // Placeholder
  }

  saveToLocalStorage(data) {
    localStorage.setItem('company_form_data', JSON.stringify(data));
  }

  async submitToDatabase(data) {
    // This would submit to your Supabase database
    return { success: true }; // Placeholder
  }

  showLoadingState() {
    const submitButton = document.getElementById('submit-button');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Saving...';
    }
  }

  hideLoadingState() {
    const submitButton = document.getElementById('submit-button');
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.textContent = 'Save Company Data';
    }
  }

  showSuccessMessage(message) {
    // Show success message
    console.log('Success:', message);
  }

  showErrorMessage(message) {
    // Show error message
    console.error('Error:', message);
  }

  showNoCompaniesMessage() {
    // Show message when no companies are assigned
    console.log('No companies assigned to current user');
  }

  loadNextCompany() {
    // Load next company in queue
    console.log('Loading next company...');
  }
}

// Initialize the data entry system when page loads
document.addEventListener('DOMContentLoaded', () => {
  window.dataEntrySystem = new DataEntrySystem();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DataEntrySystem };
}
