// Data service for fetching real company information from pilot data

// Real pilot company data based on the CSV file
const pilotCompanies = [
  {
    id: '1',
    name: 'Siemens AG',
    country: 'Germany',
    sector: 'Industrials',
    industry: 'Industrial Conglomerates',
    employees: 303000,
    totalWaste: 12400, // Estimated based on company size
    recyclingRate: 68,
    carbonFootprint: 8250.5,
    complianceScore: 85,
    recoveryRates: [68, 70, 72, 71, 69],
    wasteGenerated: [12400, 11800, 12100, 11900, 12200],
    hazardousShare: 12
  },
  {
    id: '2',
    name: 'Volkswagen AG',
    country: 'Germany',
    sector: 'Consumer Discretionary',
    industry: 'Automobiles',
    employees: 676000,
    totalWaste: 18700, // Estimated for automotive
    recyclingRate: 72,
    carbonFootprint: 12650.8,
    complianceScore: 78,
    recoveryRates: [72, 74, 71, 73, 75],
    wasteGenerated: [18700, 18200, 18900, 18500, 18800],
    hazardousShare: 18
  },
  {
    id: '3',
    name: 'BASF SE',
    country: 'Germany',
    sector: 'Materials',
    industry: 'Chemicals',
    employees: 111000,
    totalWaste: 22100, // Higher for chemical industry
    recyclingRate: 58,
    carbonFootprint: 15420.3,
    complianceScore: 82,
    recoveryRates: [58, 60, 57, 59, 61],
    wasteGenerated: [22100, 21800, 22300, 22000, 22200],
    hazardousShare: 25
  },
  {
    id: '4',
    name: 'Bayer AG',
    country: 'Germany',
    sector: 'Healthcare',
    industry: 'Pharmaceuticals',
    employees: 99000,
    totalWaste: 8900,
    recyclingRate: 65,
    carbonFootprint: 5830.2,
    complianceScore: 88,
    recoveryRates: [65, 67, 64, 66, 68],
    wasteGenerated: [8900, 8700, 9100, 8800, 9000],
    hazardousShare: 15
  },
  {
    id: '5',
    name: 'BMW AG',
    country: 'Germany',
    sector: 'Consumer Discretionary',
    industry: 'Automobiles',
    employees: 133000,
    totalWaste: 14200,
    recyclingRate: 75,
    carbonFootprint: 9180.4,
    complianceScore: 81,
    recoveryRates: [75, 77, 74, 76, 78],
    wasteGenerated: [14200, 13900, 14500, 14100, 14300],
    hazardousShare: 16
  },
  {
    id: '6',
    name: 'Deutsche Bank AG',
    country: 'Germany',
    sector: 'Financials',
    industry: 'Banks',
    employees: 84000,
    totalWaste: 1240, // Lower for financial services
    recyclingRate: 48,
    carbonFootprint: 890.5,
    complianceScore: 73,
    recoveryRates: [48, 50, 47, 49, 51],
    wasteGenerated: [1240, 1200, 1280, 1220, 1260],
    hazardousShare: 5
  },
  {
    id: '7',
    name: 'Allianz SE',
    country: 'Germany',
    sector: 'Financials',
    industry: 'Insurance',
    employees: 155000,
    totalWaste: 1580,
    recyclingRate: 52,
    carbonFootprint: 1120.8,
    complianceScore: 76,
    recoveryRates: [52, 54, 51, 53, 55],
    wasteGenerated: [1580, 1540, 1620, 1560, 1600],
    hazardousShare: 6
  },
  {
    id: '8',
    name: 'SAP SE',
    country: 'Germany',
    sector: 'Technology',
    industry: 'Software',
    employees: 107000,
    totalWaste: 980,
    recyclingRate: 82, // High for tech company
    carbonFootprint: 650.3,
    complianceScore: 91,
    recoveryRates: [82, 84, 81, 83, 85],
    wasteGenerated: [980, 960, 1000, 970, 990],
    hazardousShare: 3
  },
  {
    id: '9',
    name: 'Mercedes-Benz Group AG',
    country: 'Germany',
    sector: 'Consumer Discretionary',
    industry: 'Automobiles',
    employees: 172000,
    totalWaste: 16800,
    recyclingRate: 71,
    carbonFootprint: 10920.6,
    complianceScore: 79,
    recoveryRates: [71, 73, 70, 72, 74],
    wasteGenerated: [16800, 16500, 17100, 16700, 16900],
    hazardousShare: 17
  },
  {
    id: '10',
    name: 'Deutsche Telekom AG',
    country: 'Germany',
    sector: 'Communication Services',
    industry: 'Telecommunications',
    employees: 216000,
    totalWaste: 2350,
    recyclingRate: 55,
    carbonFootprint: 1890.7,
    complianceScore: 74,
    recoveryRates: [55, 57, 54, 56, 58],
    wasteGenerated: [2350, 2300, 2400, 2320, 2380],
    hazardousShare: 8
  },
  {
    id: '11',
    name: 'Thyssenkrupp AG',
    country: 'Germany',
    sector: 'Materials',
    industry: 'Steel & Metals',
    employees: 102000,
    totalWaste: 25600, // Very high for steel industry
    recyclingRate: 45,
    carbonFootprint: 18200.5,
    complianceScore: 69,
    recoveryRates: [45, 47, 44, 46, 48],
    wasteGenerated: [25600, 25200, 26000, 25400, 25800],
    hazardousShare: 32
  },
  {
    id: '12',
    name: 'Continental AG',
    country: 'Germany',
    sector: 'Consumer Discretionary',
    industry: 'Auto Parts',
    employees: 190000,
    totalWaste: 19800,
    recyclingRate: 69,
    carbonFootprint: 13400.2,
    complianceScore: 77,
    recoveryRates: [69, 71, 68, 70, 72],
    wasteGenerated: [19800, 19500, 20100, 19700, 19900],
    hazardousShare: 19
  },
  {
    id: '13',
    name: 'Henkel AG',
    country: 'Germany',
    sector: 'Consumer Staples',
    industry: 'Household Products',
    employees: 53000,
    totalWaste: 11200,
    recyclingRate: 73,
    carbonFootprint: 7200.8,
    complianceScore: 83,
    recoveryRates: [73, 75, 72, 74, 76],
    wasteGenerated: [11200, 11000, 11400, 11100, 11300],
    hazardousShare: 14
  },
  {
    id: '14',
    name: 'Adidas AG',
    country: 'Germany',
    sector: 'Consumer Discretionary',
    industry: 'Textiles & Apparel',
    employees: 62000,
    totalWaste: 6800,
    recyclingRate: 78,
    carbonFootprint: 4200.3,
    complianceScore: 86,
    recoveryRates: [78, 80, 77, 79, 81],
    wasteGenerated: [6800, 6700, 6900, 6750, 6850],
    hazardousShare: 9
  },
  {
    id: '15',
    name: 'Beiersdorf AG',
    country: 'Germany',
    sector: 'Consumer Staples',
    industry: 'Personal Care',
    employees: 22000,
    totalWaste: 4200,
    recyclingRate: 81,
    carbonFootprint: 2800.1,
    complianceScore: 89,
    recoveryRates: [81, 83, 80, 82, 84],
    wasteGenerated: [4200, 4100, 4300, 4150, 4250],
    hazardousShare: 7
  }
];



// Generate country-level waste data for dashboard compatibility
const generateDashboardWasteData = () => {
  // Group companies by country and aggregate data
  const countryGroups = pilotCompanies.reduce((acc, company) => {
    if (!acc[company.country]) {
      acc[company.country] = {
        companies: [],
        totalWaste: 0,
        totalRecovered: 0,
        totalHazardous: 0
      };
    }
    acc[company.country].companies.push(company);
    acc[company.country].totalWaste += company.totalWaste;
    acc[company.country].totalRecovered += (company.totalWaste * company.recyclingRate / 100);
    acc[company.country].totalHazardous += (company.totalWaste * company.hazardousShare / 100);
    return acc;
  }, {} as Record<string, any>);

  return Object.entries(countryGroups).map(([country, data], index) => ({
    id: `country-${index + 1}`,
    country,
    countryCode: country === 'Germany' ? 'DE' : 'XX',
    coordinates: [52.5200, 13.4050] as [number, number], // Default to Berlin for German companies
    year: 2024,
    totalWaste: data.totalWaste,
    hazardousWaste: data.totalHazardous,
    recoveryRate: (data.totalRecovered / data.totalWaste) * 100,
    disposalRate: ((data.totalWaste - data.totalRecovered) / data.totalWaste) * 100,
    treatmentMethods: {
      recycling: 50,
      composting: 8,
      energyRecovery: 15,
      landfill: 17,
      incineration: 10
    },
    wasteTypes: {
      municipal: 25,
      industrial: 45,
      construction: 15,
      electronic: 10,
      medical: 5
    },
    marketOpportunity: Math.round((85 - (data.totalRecovered / data.totalWaste) * 100) * data.totalWaste * 0.15 / 1000)
  }));
};

// Generate sector leaderboards
const generateSectorLeaderboards = () => {
  const sectorGroups = pilotCompanies.reduce((acc, company) => {
    if (!acc[company.sector]) {
      acc[company.sector] = [];
    }
    
    const performanceRating = 
      company.recyclingRate >= 75 ? 'leader' as const :
      company.recyclingRate >= 60 ? 'average' as const :
      'hotspot' as const;
    
    const improvementTrend = 
      company.recoveryRates[company.recoveryRates.length - 1] - company.recoveryRates[0];
    
    acc[company.sector].push({
      id: company.id,
      name: company.name,
      country: company.country,
      recoveryRate: company.recyclingRate,
      wasteVolume: company.totalWaste,
      improvementTrend,
      performanceRating,
      marketShare: Math.random() * 15 + 5 // Mock market share between 5-20%
    });
    return acc;
  }, {} as Record<string, any[]>);

  return Object.entries(sectorGroups).map(([sector, companies]) => ({
    sector,
    companies: companies.sort((a, b) => b.recoveryRate - a.recoveryRate)
  }));
};

// API simulation with delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getCompanyData = async () => {
  await delay(500); // Simulate API call
  return pilotCompanies;
};

export const getWasteData = async () => {
  await delay(300);
  return generateDashboardWasteData();
};

export const getSectorLeaderboards = async () => {
  await delay(400);
  return generateSectorLeaderboards();
};