// Pilot Companies Data - Enhanced Company Profiles
// Waste Management Platform

export interface PilotCompany {
  id: string
  name: string
  country: string
  sector: string
  industry: string
  description: string
  business_overview: string
  website_url: string
  founded_year: number
  headquarters: string
  revenue_usd: number
  is_public: boolean
  stock_exchange?: string
  market_cap_usd?: number
  primary_contact_email?: string
  primary_contact_phone?: string
  sustainability_contact_email?: string
  sustainability_contact_phone?: string
  
  // Waste Management Profile
  waste_profile: {
    primary_waste_materials: string[]
    waste_management_strategy: string
    recycling_facilities_count: number
    waste_treatment_methods: string[]
    sustainability_goals: string
    circular_economy_initiatives: string
    zero_waste_commitment: boolean
    zero_waste_target_year?: number
    carbon_neutrality_commitment: boolean
    carbon_neutrality_target_year?: number
  }
  
  // Sustainability Metrics
  sustainability_metrics: {
    reporting_year: number
    carbon_footprint_tonnes?: number
    energy_consumption_gwh?: number
    water_consumption_m3?: number
    renewable_energy_percentage?: number
    waste_to_landfill_percentage?: number
    recycling_rate_percentage?: number
    esg_score?: number
    sustainability_rating?: string
    rating_agency?: string
  }
  
  // ESG Documents
  esg_documents: Array<{
    document_type: string
    document_title: string
    document_url: string
    publication_date: string
    reporting_year: number
  }>
  
  // Certifications
  certifications: Array<{
    certification_name: string
    certification_type: string
    issuing_organization: string
    certification_date: string
    expiry_date?: string
    status: string
  }>
  
  // Waste Facilities
  waste_facilities: Array<{
    facility_name: string
    facility_type: string
    location: string
    capacity_tonnes_per_year: number
    operational_status: string
  }>
  
  // Legacy fields for compatibility
  annualVolume: number
  complianceScore: number
  wasteType: string
  coordinates: [number, number]
}

export const pilotCompanies: PilotCompany[] = [
  {
    id: '1',
    name: 'Siemens AG',
    country: 'Germany',
    sector: 'Industrials',
    industry: 'Industrial Conglomerates',
    description: 'Siemens AG is a German multinational conglomerate and the largest industrial manufacturing company in Europe. The company operates in the fields of industry, infrastructure, transport, and healthcare.',
    business_overview: 'Siemens operates in industry, infrastructure, transport, and healthcare. The company is a global leader in electrification, automation, and digitalization.',
    website_url: 'https://www.siemens.com',
    founded_year: 1847,
    headquarters: 'Munich, Germany',
    revenue_usd: 77800000000,
    is_public: true,
    stock_exchange: 'XETR',
    market_cap_usd: 120000000000,
    primary_contact_email: 'contact@siemens.com',
    sustainability_contact_email: 'sustainability@siemens.com',
    waste_profile: {
      primary_waste_materials: ['Electronic waste', 'Metal scrap', 'Plastic waste', 'Paper and cardboard'],
      waste_management_strategy: 'Siemens implements a comprehensive circular economy approach focusing on waste reduction, recycling, and resource efficiency across all operations.',
      recycling_facilities_count: 15,
      waste_treatment_methods: ['Mechanical recycling', 'Chemical recycling', 'Energy recovery', 'Landfill (minimal)'],
      sustainability_goals: 'Achieve carbon neutrality by 2030, zero waste to landfill by 2025, and 100% circular economy by 2030.',
      circular_economy_initiatives: 'Product-as-a-Service models, closed-loop manufacturing, and waste-to-resource programs.',
      zero_waste_commitment: true,
      zero_waste_target_year: 2025,
      carbon_neutrality_commitment: true,
      carbon_neutrality_target_year: 2030
    },
    sustainability_metrics: {
      reporting_year: 2024,
      carbon_footprint_tonnes: 2500000,
      energy_consumption_gwh: 8500,
      water_consumption_m3: 15000000,
      renewable_energy_percentage: 85,
      waste_to_landfill_percentage: 5,
      recycling_rate_percentage: 92,
      esg_score: 85,
      sustainability_rating: 'AA',
      rating_agency: 'MSCI'
    },
    esg_documents: [
      {
        document_type: 'Sustainability Report',
        document_title: 'Siemens Sustainability Report 2024',
        document_url: 'https://www.siemens.com/sustainability-report-2024',
        publication_date: '2024-01-15',
        reporting_year: 2024
      }
    ],
    certifications: [
      {
        certification_name: 'ISO 14001',
        certification_type: 'Environmental Management',
        issuing_organization: 'ISO',
        certification_date: '2020-01-01',
        status: 'Active'
      }
    ],
    waste_facilities: [
      {
        facility_name: 'Siemens Munich Recycling Center',
        facility_type: 'Recycling Center',
        location: 'Munich, Germany',
        capacity_tonnes_per_year: 50000,
        operational_status: 'Operational'
      }
    ],
    annualVolume: 50000,
    complianceScore: 95,
    wasteType: 'Mixed Industrial',
    coordinates: [48.1351, 11.5820]
  },
  {
    id: '2',
    name: 'Volkswagen AG',
    country: 'Germany',
    sector: 'Consumer Discretionary',
    industry: 'Automobiles',
    description: 'Volkswagen AG is a German multinational automotive manufacturing company. It is the largest automaker in Europe and one of the largest in the world.',
    business_overview: 'Volkswagen designs, manufactures, and distributes passenger and commercial vehicles, motorcycles, engines, and turbomachinery.',
    website_url: 'https://www.volkswagenag.com',
    founded_year: 1937,
    headquarters: 'Wolfsburg, Germany',
    revenue_usd: 295819000000,
    is_public: true,
    stock_exchange: 'XETR',
    market_cap_usd: 85000000000,
    primary_contact_email: 'contact@volkswagen.de',
    sustainability_contact_email: 'sustainability@volkswagen.de',
    waste_profile: {
      primary_waste_materials: ['Metal scrap', 'Plastic waste', 'Electronic waste', 'Hazardous waste'],
      waste_management_strategy: 'Volkswagen implements a comprehensive waste management strategy focused on circular economy principles and zero waste to landfill.',
      recycling_facilities_count: 25,
      waste_treatment_methods: ['Mechanical recycling', 'Chemical recycling', 'Energy recovery', 'Composting'],
      sustainability_goals: 'Achieve carbon neutrality by 2050, zero waste to landfill by 2025, and 100% renewable energy by 2030.',
      circular_economy_initiatives: 'Closed-loop manufacturing, material recovery programs, and sustainable product design.',
      zero_waste_commitment: true,
      zero_waste_target_year: 2025,
      carbon_neutrality_commitment: true,
      carbon_neutrality_target_year: 2050
    },
    sustainability_metrics: {
      reporting_year: 2024,
      carbon_footprint_tonnes: 4500000,
      energy_consumption_gwh: 12000,
      water_consumption_m3: 25000000,
      renewable_energy_percentage: 70,
      waste_to_landfill_percentage: 8,
      recycling_rate_percentage: 88,
      esg_score: 82,
      sustainability_rating: 'A',
      rating_agency: 'Sustainalytics'
    },
    esg_documents: [
      {
        document_type: 'Sustainability Report',
        document_title: 'Volkswagen Sustainability Report 2024',
        document_url: 'https://www.volkswagenag.com/sustainability-report-2024',
        publication_date: '2024-02-01',
        reporting_year: 2024
      }
    ],
    certifications: [
      {
        certification_name: 'ISO 14001',
        certification_type: 'Environmental Management',
        issuing_organization: 'ISO',
        certification_date: '2019-01-01',
        status: 'Active'
      }
    ],
    waste_facilities: [
      {
        facility_name: 'VW Wolfsburg Recycling Center',
        facility_type: 'Recycling Center',
        location: 'Wolfsburg, Germany',
        capacity_tonnes_per_year: 75000,
        operational_status: 'Operational'
      }
    ],
    annualVolume: 75000,
    complianceScore: 92,
    wasteType: 'Automotive',
    coordinates: [52.4226, 10.7865]
  },
  {
    id: '3',
    name: 'BASF SE',
    country: 'Germany',
    sector: 'Materials',
    industry: 'Chemicals',
    description: 'BASF SE is a German multinational chemical company and the largest chemical producer in the world.',
    business_overview: 'BASF creates chemistry for a sustainable future by combining economic success with environmental protection and social responsibility.',
    website_url: 'https://www.basf.com',
    founded_year: 1865,
    headquarters: 'Ludwigshafen, Germany',
    revenue_usd: 87300000000,
    is_public: true,
    stock_exchange: 'XETR',
    market_cap_usd: 65000000000,
    primary_contact_email: 'contact@basf.com',
    sustainability_contact_email: 'sustainability@basf.com',
    waste_profile: {
      primary_waste_materials: ['Chemical waste', 'Hazardous waste', 'Plastic waste', 'Metal scrap'],
      waste_management_strategy: 'BASF implements advanced waste management technologies and circular economy solutions for chemical industry waste.',
      recycling_facilities_count: 12,
      waste_treatment_methods: ['Chemical recycling', 'Energy recovery', 'Hazardous waste treatment', 'Material recovery'],
      sustainability_goals: 'Achieve carbon neutrality by 2050, zero waste to landfill by 2030, and 100% circular economy.',
      circular_economy_initiatives: 'Chemical recycling programs, waste-to-resource initiatives, and sustainable product design.',
      zero_waste_commitment: true,
      zero_waste_target_year: 2030,
      carbon_neutrality_commitment: true,
      carbon_neutrality_target_year: 2050
    },
    sustainability_metrics: {
      reporting_year: 2024,
      carbon_footprint_tonnes: 3500000,
      energy_consumption_gwh: 15000,
      water_consumption_m3: 35000000,
      renewable_energy_percentage: 60,
      waste_to_landfill_percentage: 12,
      recycling_rate_percentage: 85,
      esg_score: 78,
      sustainability_rating: 'BBB',
      rating_agency: 'CDP'
    },
    esg_documents: [
      {
        document_type: 'Sustainability Report',
        document_title: 'BASF Sustainability Report 2024',
        document_url: 'https://www.basf.com/sustainability-report-2024',
        publication_date: '2024-01-20',
        reporting_year: 2024
      }
    ],
    certifications: [
      {
        certification_name: 'ISO 14001',
        certification_type: 'Environmental Management',
        issuing_organization: 'ISO',
        certification_date: '2018-01-01',
        status: 'Active'
      }
    ],
    waste_facilities: [
      {
        facility_name: 'BASF Ludwigshafen Waste Treatment',
        facility_type: 'Waste Treatment',
        location: 'Ludwigshafen, Germany',
        capacity_tonnes_per_year: 100000,
        operational_status: 'Operational'
      }
    ],
    annualVolume: 100000,
    complianceScore: 88,
    wasteType: 'Chemical',
    coordinates: [49.4817, 8.4355]
  },
  {
    id: '4',
    name: 'Bayer AG',
    country: 'Germany',
    sector: 'Healthcare',
    industry: 'Pharmaceuticals',
    description: 'Bayer AG is a German multinational pharmaceutical and life sciences company.',
    business_overview: 'Bayer is a global enterprise with core competencies in the life science fields of health care and agriculture.',
    website_url: 'https://www.bayer.com',
    founded_year: 1863,
    headquarters: 'Leverkusen, Germany',
    revenue_usd: 50700000000,
    is_public: true,
    stock_exchange: 'XETR',
    market_cap_usd: 55000000000,
    primary_contact_email: 'contact@bayer.com',
    sustainability_contact_email: 'sustainability@bayer.com',
    waste_profile: {
      primary_waste_materials: ['Pharmaceutical waste', 'Hazardous waste', 'Plastic waste', 'Organic waste'],
      waste_management_strategy: 'Bayer implements specialized pharmaceutical waste management and sustainable healthcare solutions.',
      recycling_facilities_count: 8,
      waste_treatment_methods: ['Hazardous waste treatment', 'Incineration', 'Chemical treatment', 'Material recovery'],
      sustainability_goals: 'Achieve carbon neutrality by 2030, zero waste to landfill by 2025, and sustainable healthcare.',
      circular_economy_initiatives: 'Pharmaceutical waste recovery, sustainable packaging, and green chemistry initiatives.',
      zero_waste_commitment: true,
      zero_waste_target_year: 2025,
      carbon_neutrality_commitment: true,
      carbon_neutrality_target_year: 2030
    },
    sustainability_metrics: {
      reporting_year: 2024,
      carbon_footprint_tonnes: 1800000,
      energy_consumption_gwh: 6000,
      water_consumption_m3: 12000000,
      renewable_energy_percentage: 75,
      waste_to_landfill_percentage: 6,
      recycling_rate_percentage: 90,
      esg_score: 80,
      sustainability_rating: 'A',
      rating_agency: 'MSCI'
    },
    esg_documents: [
      {
        document_type: 'Sustainability Report',
        document_title: 'Bayer Sustainability Report 2024',
        document_url: 'https://www.bayer.com/sustainability-report-2024',
        publication_date: '2024-01-25',
        reporting_year: 2024
      }
    ],
    certifications: [
      {
        certification_name: 'ISO 14001',
        certification_type: 'Environmental Management',
        issuing_organization: 'ISO',
        certification_date: '2020-01-01',
        status: 'Active'
      }
    ],
    waste_facilities: [
      {
        facility_name: 'Bayer Leverkusen Waste Treatment',
        facility_type: 'Waste Treatment',
        location: 'Leverkusen, Germany',
        capacity_tonnes_per_year: 30000,
        operational_status: 'Operational'
      }
    ],
    annualVolume: 30000,
    complianceScore: 85,
    wasteType: 'Pharmaceutical',
    coordinates: [51.0333, 6.9833]
  },
  {
    id: '5',
    name: 'BMW AG',
    country: 'Germany',
    sector: 'Consumer Discretionary',
    industry: 'Automobiles',
    description: 'BMW AG is a German multinational corporation which produces luxury vehicles and motorcycles.',
    business_overview: 'BMW is one of the world\'s leading manufacturers of premium automobiles and motorcycles.',
    website_url: 'https://www.bmwgroup.com',
    founded_year: 1916,
    headquarters: 'Munich, Germany',
    revenue_usd: 142610000000,
    is_public: true,
    stock_exchange: 'XETR',
    market_cap_usd: 75000000000,
    primary_contact_email: 'contact@bmw.de',
    sustainability_contact_email: 'sustainability@bmw.de',
    waste_profile: {
      primary_waste_materials: ['Metal scrap', 'Plastic waste', 'Electronic waste', 'Automotive waste'],
      waste_management_strategy: 'BMW implements premium automotive waste management with focus on luxury vehicle sustainability.',
      recycling_facilities_count: 18,
      waste_treatment_methods: ['Mechanical recycling', 'Material recovery', 'Energy recovery', 'Composting'],
      sustainability_goals: 'Achieve carbon neutrality by 2050, zero waste to landfill by 2025, and sustainable luxury.',
      circular_economy_initiatives: 'Premium material recovery, sustainable luxury design, and circular automotive solutions.',
      zero_waste_commitment: true,
      zero_waste_target_year: 2025,
      carbon_neutrality_commitment: true,
      carbon_neutrality_target_year: 2050
    },
    sustainability_metrics: {
      reporting_year: 2024,
      carbon_footprint_tonnes: 2800000,
      energy_consumption_gwh: 8000,
      water_consumption_m3: 18000000,
      renewable_energy_percentage: 80,
      waste_to_landfill_percentage: 4,
      recycling_rate_percentage: 94,
      esg_score: 87,
      sustainability_rating: 'AA',
      rating_agency: 'Sustainalytics'
    },
    esg_documents: [
      {
        document_type: 'Sustainability Report',
        document_title: 'BMW Sustainability Report 2024',
        document_url: 'https://www.bmwgroup.com/sustainability-report-2024',
        publication_date: '2024-02-10',
        reporting_year: 2024
      }
    ],
    certifications: [
      {
        certification_name: 'ISO 14001',
        certification_type: 'Environmental Management',
        issuing_organization: 'ISO',
        certification_date: '2019-01-01',
        status: 'Active'
      }
    ],
    waste_facilities: [
      {
        facility_name: 'BMW Munich Recycling Center',
        facility_type: 'Recycling Center',
        location: 'Munich, Germany',
        capacity_tonnes_per_year: 45000,
        operational_status: 'Operational'
      }
    ],
    annualVolume: 45000,
    complianceScore: 90,
    wasteType: 'Automotive',
    coordinates: [48.1351, 11.5820]
  },
  {
    id: '6',
    name: 'Deutsche Bank AG',
    country: 'Germany',
    sector: 'Financials',
    industry: 'Banks',
    description: 'Deutsche Bank AG is a German multinational investment bank and financial services company.',
    business_overview: 'Deutsche Bank is a leading global investment bank with a strong and profitable private clients franchise.',
    website_url: 'https://www.db.com',
    founded_year: 1870,
    headquarters: 'Frankfurt, Germany',
    revenue_usd: 28000000000,
    is_public: true,
    stock_exchange: 'XETR',
    market_cap_usd: 25000000000,
    primary_contact_email: 'contact@db.com',
    sustainability_contact_email: 'sustainability@db.com',
    waste_profile: {
      primary_waste_materials: ['Paper and cardboard', 'Electronic waste', 'Plastic waste', 'Organic waste'],
      waste_management_strategy: 'Deutsche Bank implements sustainable banking waste management with focus on digital transformation.',
      recycling_facilities_count: 5,
      waste_treatment_methods: ['Material recovery', 'Electronic waste recycling', 'Composting', 'Energy recovery'],
      sustainability_goals: 'Achieve carbon neutrality by 2025, zero waste to landfill by 2025, and sustainable finance.',
      circular_economy_initiatives: 'Digital transformation, paperless banking, and sustainable financial services.',
      zero_waste_commitment: true,
      zero_waste_target_year: 2025,
      carbon_neutrality_commitment: true,
      carbon_neutrality_target_year: 2025
    },
    sustainability_metrics: {
      reporting_year: 2024,
      carbon_footprint_tonnes: 800000,
      energy_consumption_gwh: 3000,
      water_consumption_m3: 8000000,
      renewable_energy_percentage: 90,
      waste_to_landfill_percentage: 2,
      recycling_rate_percentage: 96,
      esg_score: 75,
      sustainability_rating: 'BBB',
      rating_agency: 'MSCI'
    },
    esg_documents: [
      {
        document_type: 'Sustainability Report',
        document_title: 'Deutsche Bank Sustainability Report 2024',
        document_url: 'https://www.db.com/sustainability-report-2024',
        publication_date: '2024-01-30',
        reporting_year: 2024
      }
    ],
    certifications: [
      {
        certification_name: 'ISO 14001',
        certification_type: 'Environmental Management',
        issuing_organization: 'ISO',
        certification_date: '2021-01-01',
        status: 'Active'
      }
    ],
    waste_facilities: [
      {
        facility_name: 'DB Frankfurt Waste Management',
        facility_type: 'Waste Management',
        location: 'Frankfurt, Germany',
        capacity_tonnes_per_year: 8000,
        operational_status: 'Operational'
      }
    ],
    annualVolume: 8000,
    complianceScore: 78,
    wasteType: 'Office',
    coordinates: [50.1109, 8.6821]
  },
  {
    id: '7',
    name: 'Allianz SE',
    country: 'Germany',
    sector: 'Financials',
    industry: 'Insurance',
    description: 'Allianz SE is a German multinational financial services company headquartered in Munich.',
    business_overview: 'Allianz is one of the world\'s largest insurance companies and asset managers.',
    website_url: 'https://www.allianz.com',
    founded_year: 1890,
    headquarters: 'Munich, Germany',
    revenue_usd: 152000000000,
    is_public: true,
    stock_exchange: 'XETR',
    market_cap_usd: 95000000000,
    primary_contact_email: 'contact@allianz.com',
    sustainability_contact_email: 'sustainability@allianz.com',
    waste_profile: {
      primary_waste_materials: ['Paper and cardboard', 'Electronic waste', 'Plastic waste', 'Organic waste'],
      waste_management_strategy: 'Allianz implements sustainable insurance waste management with focus on digital transformation.',
      recycling_facilities_count: 6,
      waste_treatment_methods: ['Material recovery', 'Electronic waste recycling', 'Composting', 'Energy recovery'],
      sustainability_goals: 'Achieve carbon neutrality by 2025, zero waste to landfill by 2025, and sustainable insurance.',
      circular_economy_initiatives: 'Digital transformation, paperless insurance, and sustainable financial services.',
      zero_waste_commitment: true,
      zero_waste_target_year: 2025,
      carbon_neutrality_commitment: true,
      carbon_neutrality_target_year: 2025
    },
    sustainability_metrics: {
      reporting_year: 2024,
      carbon_footprint_tonnes: 600000,
      energy_consumption_gwh: 2500,
      water_consumption_m3: 6000000,
      renewable_energy_percentage: 85,
      waste_to_landfill_percentage: 3,
      recycling_rate_percentage: 95,
      esg_score: 82,
      sustainability_rating: 'A',
      rating_agency: 'Sustainalytics'
    },
    esg_documents: [
      {
        document_type: 'Sustainability Report',
        document_title: 'Allianz Sustainability Report 2024',
        document_url: 'https://www.allianz.com/sustainability-report-2024',
        publication_date: '2024-02-05',
        reporting_year: 2024
      }
    ],
    certifications: [
      {
        certification_name: 'ISO 14001',
        certification_type: 'Environmental Management',
        issuing_organization: 'ISO',
        certification_date: '2020-01-01',
        status: 'Active'
      }
    ],
    waste_facilities: [
      {
        facility_name: 'Allianz Munich Waste Management',
        facility_type: 'Waste Management',
        location: 'Munich, Germany',
        capacity_tonnes_per_year: 12000,
        operational_status: 'Operational'
      }
    ],
    annualVolume: 12000,
    complianceScore: 82,
    wasteType: 'Office',
    coordinates: [48.1351, 11.5820]
  },
  {
    id: '8',
    name: 'SAP SE',
    country: 'Germany',
    sector: 'Technology',
    industry: 'Software',
    description: 'SAP SE is a German multinational software corporation that makes enterprise software to manage business operations.',
    business_overview: 'SAP is the world\'s leading provider of business software, helping companies of all sizes and industries run better.',
    website_url: 'https://www.sap.com',
    founded_year: 1972,
    headquarters: 'Walldorf, Germany',
    revenue_usd: 34100000000,
    is_public: true,
    stock_exchange: 'XETR',
    market_cap_usd: 180000000000,
    primary_contact_email: 'contact@sap.com',
    sustainability_contact_email: 'sustainability@sap.com',
    waste_profile: {
      primary_waste_materials: ['Electronic waste', 'Paper and cardboard', 'Plastic waste', 'Organic waste'],
      waste_management_strategy: 'SAP implements sustainable technology waste management with focus on digital solutions.',
      recycling_facilities_count: 4,
      waste_treatment_methods: ['Electronic waste recycling', 'Material recovery', 'Composting', 'Energy recovery'],
      sustainability_goals: 'Achieve carbon neutrality by 2025, zero waste to landfill by 2025, and sustainable technology.',
      circular_economy_initiatives: 'Digital transformation, cloud solutions, and sustainable software development.',
      zero_waste_commitment: true,
      zero_waste_target_year: 2025,
      carbon_neutrality_commitment: true,
      carbon_neutrality_target_year: 2025
    },
    sustainability_metrics: {
      reporting_year: 2024,
      carbon_footprint_tonnes: 400000,
      energy_consumption_gwh: 2000,
      water_consumption_m3: 4000000,
      renewable_energy_percentage: 95,
      waste_to_landfill_percentage: 1,
      recycling_rate_percentage: 98,
      esg_score: 88,
      sustainability_rating: 'AA',
      rating_agency: 'MSCI'
    },
    esg_documents: [
      {
        document_type: 'Sustainability Report',
        document_title: 'SAP Sustainability Report 2024',
        document_url: 'https://www.sap.com/sustainability-report-2024',
        publication_date: '2024-01-18',
        reporting_year: 2024
      }
    ],
    certifications: [
      {
        certification_name: 'ISO 14001',
        certification_type: 'Environmental Management',
        issuing_organization: 'ISO',
        certification_date: '2021-01-01',
        status: 'Active'
      }
    ],
    waste_facilities: [
      {
        facility_name: 'SAP Walldorf Waste Management',
        facility_type: 'Waste Management',
        location: 'Walldorf, Germany',
        capacity_tonnes_per_year: 5000,
        operational_status: 'Operational'
      }
    ],
    annualVolume: 5000,
    complianceScore: 88,
    wasteType: 'Technology',
    coordinates: [49.3044, 8.6432]
  },
  {
    id: '9',
    name: 'Mercedes-Benz Group AG',
    country: 'Germany',
    sector: 'Consumer Discretionary',
    industry: 'Automobiles',
    description: 'Mercedes-Benz Group AG is a German multinational automotive corporation.',
    business_overview: 'Mercedes-Benz is one of the world\'s most successful automotive companies, known for luxury vehicles.',
    website_url: 'https://www.mercedes-benz.com',
    founded_year: 1926,
    headquarters: 'Stuttgart, Germany',
    revenue_usd: 158000000000,
    is_public: true,
    stock_exchange: 'XETR',
    market_cap_usd: 80000000000,
    primary_contact_email: 'contact@mercedes-benz.com',
    sustainability_contact_email: 'sustainability@mercedes-benz.com',
    waste_profile: {
      primary_waste_materials: ['Metal scrap', 'Plastic waste', 'Electronic waste', 'Automotive waste'],
      waste_management_strategy: 'Mercedes-Benz implements luxury automotive waste management with focus on premium sustainability.',
      recycling_facilities_count: 20,
      waste_treatment_methods: ['Mechanical recycling', 'Material recovery', 'Energy recovery', 'Composting'],
      sustainability_goals: 'Achieve carbon neutrality by 2050, zero waste to landfill by 2025, and sustainable luxury.',
      circular_economy_initiatives: 'Premium material recovery, sustainable luxury design, and circular automotive solutions.',
      zero_waste_commitment: true,
      zero_waste_target_year: 2025,
      carbon_neutrality_commitment: true,
      carbon_neutrality_target_year: 2050
    },
    sustainability_metrics: {
      reporting_year: 2024,
      carbon_footprint_tonnes: 3200000,
      energy_consumption_gwh: 9000,
      water_consumption_m3: 20000000,
      renewable_energy_percentage: 75,
      waste_to_landfill_percentage: 6,
      recycling_rate_percentage: 91,
      esg_score: 84,
      sustainability_rating: 'A',
      rating_agency: 'Sustainalytics'
    },
    esg_documents: [
      {
        document_type: 'Sustainability Report',
        document_title: 'Mercedes-Benz Sustainability Report 2024',
        document_url: 'https://www.mercedes-benz.com/sustainability-report-2024',
        publication_date: '2024-02-15',
        reporting_year: 2024
      }
    ],
    certifications: [
      {
        certification_name: 'ISO 14001',
        certification_type: 'Environmental Management',
        issuing_organization: 'ISO',
        certification_date: '2019-01-01',
        status: 'Active'
      }
    ],
    waste_facilities: [
      {
        facility_name: 'Mercedes-Benz Stuttgart Recycling',
        facility_type: 'Recycling Center',
        location: 'Stuttgart, Germany',
        capacity_tonnes_per_year: 55000,
        operational_status: 'Operational'
      }
    ],
    annualVolume: 55000,
    complianceScore: 86,
    wasteType: 'Automotive',
    coordinates: [48.7758, 9.1829]
  },
  {
    id: '10',
    name: 'Deutsche Telekom AG',
    country: 'Germany',
    sector: 'Communication Services',
    industry: 'Telecommunications',
    description: 'Deutsche Telekom AG is a German telecommunications company headquartered in Bonn.',
    business_overview: 'Deutsche Telekom is one of the world\'s leading integrated telecommunications companies.',
    website_url: 'https://www.telekom.com',
    founded_year: 1995,
    headquarters: 'Bonn, Germany',
    revenue_usd: 121000000000,
    is_public: true,
    stock_exchange: 'XETR',
    market_cap_usd: 85000000000,
    primary_contact_email: 'contact@telekom.de',
    sustainability_contact_email: 'sustainability@telekom.de',
    waste_profile: {
      primary_waste_materials: ['Electronic waste', 'Network equipment', 'Plastic waste', 'Paper and cardboard'],
      waste_management_strategy: 'Deutsche Telekom implements sustainable telecommunications waste management with focus on network sustainability.',
      recycling_facilities_count: 7,
      waste_treatment_methods: ['Electronic waste recycling', 'Material recovery', 'Energy recovery', 'Network equipment recycling'],
      sustainability_goals: 'Achieve carbon neutrality by 2025, zero waste to landfill by 2025, and sustainable telecommunications.',
      circular_economy_initiatives: 'Network equipment recycling, digital transformation, and sustainable telecommunications.',
      zero_waste_commitment: true,
      zero_waste_target_year: 2025,
      carbon_neutrality_commitment: true,
      carbon_neutrality_target_year: 2025
    },
    sustainability_metrics: {
      reporting_year: 2024,
      carbon_footprint_tonnes: 1200000,
      energy_consumption_gwh: 5000,
      water_consumption_m3: 10000000,
      renewable_energy_percentage: 80,
      waste_to_landfill_percentage: 3,
      recycling_rate_percentage: 94,
      esg_score: 79,
      sustainability_rating: 'BBB',
      rating_agency: 'MSCI'
    },
    esg_documents: [
      {
        document_type: 'Sustainability Report',
        document_title: 'Deutsche Telekom Sustainability Report 2024',
        document_url: 'https://www.telekom.com/sustainability-report-2024',
        publication_date: '2024-01-22',
        reporting_year: 2024
      }
    ],
    certifications: [
      {
        certification_name: 'ISO 14001',
        certification_type: 'Environmental Management',
        issuing_organization: 'ISO',
        certification_date: '2020-01-01',
        status: 'Active'
      }
    ],
    waste_facilities: [
      {
        facility_name: 'Telekom Bonn Waste Management',
        facility_type: 'Waste Management',
        location: 'Bonn, Germany',
        capacity_tonnes_per_year: 15000,
        operational_status: 'Operational'
      }
    ],
    annualVolume: 15000,
    complianceScore: 80,
    wasteType: 'Telecommunications',
    coordinates: [50.7374, 7.0982]
  }
]
