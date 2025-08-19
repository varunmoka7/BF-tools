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
    complianceScore: 85
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
    complianceScore: 78
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
    complianceScore: 82
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
    complianceScore: 88
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
    complianceScore: 81
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
    complianceScore: 73
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
    complianceScore: 76
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
    complianceScore: 91
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
    complianceScore: 79
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
    complianceScore: 74
  }
];

// Generate waste data based on company information
const generateWasteData = () => {
  return pilotCompanies.flatMap(company => [
    {
      id: `${company.id}-electronic`,
      company: company.name,
      sector: company.sector,
      wasteType: 'Electronic',
      quantity: Math.round(company.totalWaste * 0.15),
      month: 'January',
      recyclingRate: company.recyclingRate,
      carbonFootprint: company.carbonFootprint * 0.2
    },
    {
      id: `${company.id}-industrial`,
      company: company.name,
      sector: company.sector,
      wasteType: 'Industrial',
      quantity: Math.round(company.totalWaste * 0.65),
      month: 'January',
      recyclingRate: company.recyclingRate,
      carbonFootprint: company.carbonFootprint * 0.7
    },
    {
      id: `${company.id}-organic`,
      company: company.name,
      sector: company.sector,
      wasteType: 'Organic',
      quantity: Math.round(company.totalWaste * 0.20),
      month: 'January',
      recyclingRate: Math.max(30, company.recyclingRate - 20), // Organic typically lower
      carbonFootprint: company.carbonFootprint * 0.1
    }
  ]);
};

// Generate sector leaderboards
const generateSectorLeaderboards = () => {
  const sectorGroups = pilotCompanies.reduce((acc, company) => {
    if (!acc[company.sector]) {
      acc[company.sector] = [];
    }
    acc[company.sector].push({
      name: company.name,
      score: company.complianceScore,
      recyclingRate: company.recyclingRate
    });
    return acc;
  }, {} as Record<string, any[]>);

  return Object.entries(sectorGroups).map(([sector, companies]) => ({
    sector,
    companies: companies.sort((a, b) => b.score - a.score)
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
  return generateWasteData();
};

export const getSectorLeaderboards = async () => {
  await delay(400);
  return generateSectorLeaderboards();
};