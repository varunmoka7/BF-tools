export interface Company {
  id: string;
  name: string;
  country: string;
  sector: string;
  industry: string;
  employees: number;
  year_of_disclosure: number;
  ticker: string;
  exchange: string;
  isin?: string;
  lei?: string;
  figi?: string;
  permid?: string;
  coordinates: {
    lat: number;
    lng: number;
    accuracy: number;
    address: string;
    source: string;
  };
}

export interface CountryData {
  name: string;
  companyCount: number;
  totalEmployees: number;
  averageWastePerCompany: number;
  coordinates: [number, number];
}

export interface MapView {
  type: 'country' | 'company';
  selectedCountry?: string;
  zoomLevel: number;
}

export interface MapStats {
  totalCompanies: number;
  totalEmployees: number;
  countriesCovered: number;
  sectorsRepresented: number;
}

export interface CompanyMarker {
  id: string;
  position: [number, number];
  company: Company;
  size: 'small' | 'medium' | 'large';
}

export interface CountryMarker {
  name: string;
  position: [number, number];
  companyCount: number;
  totalEmployees: number;
}

export interface MapFilters {
  searchTerm: string;
  selectedSector: string;
  selectedCountry: string;
  employeeRange: [number, number];
  yearRange: [number, number];
}

export interface MapLegendItem {
  label: string;
  color: string;
  description: string;
}

export interface MapTooltipData {
  company?: Company;
  country?: CountryData;
  position: { x: number; y: number };
}
