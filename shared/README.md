# Shared Resources

Common types, utilities, and constants shared between frontend and backend applications.

## 📁 Directory Structure

```
shared/
├── types/              # TypeScript type definitions
│   ├── waste.ts       # Core waste management types
│   ├── api.ts         # API request/response types
│   ├── auth.ts        # Authentication types
│   └── common.ts      # Common utility types
├── utils/              # Shared utility functions
│   ├── validation.ts  # Data validation utilities
│   ├── formatting.ts  # Data formatting utilities
│   ├── calculations.ts # Business logic calculations
│   └── constants.ts   # Application constants
├── constants/          # Application constants
│   ├── api.ts         # API-related constants
│   ├── waste.ts       # Waste management constants
│   └── ui.ts          # UI-related constants
└── schemas/           # Validation schemas
    ├── waste.schema.ts # Waste data schemas
    └── api.schema.ts   # API schemas
```

## 🏗️ Type Definitions

### Core Types (`types/waste.ts`)

#### WasteData
Core waste management data structure:
```typescript
interface WasteData {
  id: string;
  companyId: string;
  wasteType: WasteType;
  quantity: number;
  unit: WasteUnit;
  date: Date;
  location?: string;
  recycled: boolean;
  disposed: boolean;
  ghgEmissions?: number;
  cost?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Company
Company profile and information:
```typescript
interface Company {
  id: string;
  name: string;
  sector: Sector;
  region: string;
  sizeCategory: CompanySize;
  wasteGenerationRate: number;
  recyclingRate: number;
  complianceScore: number;
  totalWasteGenerated: number;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Sector
Industry sector definitions:
```typescript
interface Sector {
  id: string;
  name: string;
  category: SectorCategory;
  wasteTypes: WasteType[];
  regulations: Regulation[];
  averageRecyclingRate: number;
  description?: string;
}
```

### API Types (`types/api.ts`)

#### Request/Response Types
```typescript
interface ApiRequest<T = any> {
  data: T;
  metadata?: RequestMetadata;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  pagination?: PaginationInfo;
  timestamp: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
```

### Authentication Types (`types/auth.ts`)
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  companyId?: string;
  lastLogin?: Date;
  isActive: boolean;
}

interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: 'Bearer';
}
```

## 🔧 Utility Functions

### Validation (`utils/validation.ts`)
```typescript
// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Waste quantity validation
export const isValidWasteQuantity = (quantity: number, unit: WasteUnit): boolean => {
  return quantity > 0 && quantity < getMaxQuantityForUnit(unit);
};

// Date range validation
export const isValidDateRange = (startDate: Date, endDate: Date): boolean => {
  return startDate <= endDate && startDate <= new Date();
};
```

### Formatting (`utils/formatting.ts`)
```typescript
// Format waste quantity with units
export const formatWasteQuantity = (quantity: number, unit: WasteUnit): string => {
  return `${quantity.toLocaleString()} ${unit}`;
};

// Format currency
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${(value * 100).toFixed(decimals)}%`;
};
```

### Calculations (`utils/calculations.ts`)
```typescript
// Calculate recycling rate
export const calculateRecyclingRate = (recycled: number, total: number): number => {
  return total > 0 ? recycled / total : 0;
};

// Calculate GHG emissions
export const calculateGHGEmissions = (
  wasteType: WasteType,
  quantity: number,
  unit: WasteUnit
): number => {
  const emissionFactor = getEmissionFactor(wasteType, unit);
  return quantity * emissionFactor;
};

// Calculate compliance score
export const calculateComplianceScore = (
  company: Company,
  regulations: Regulation[]
): number => {
  // Implementation details...
  return score;
};
```

## 📊 Constants

### Waste Types (`constants/waste.ts`)
```typescript
export const WASTE_TYPES = {
  ORGANIC: 'organic',
  PLASTIC: 'plastic',
  PAPER: 'paper',
  METAL: 'metal',
  GLASS: 'glass',
  ELECTRONIC: 'electronic',
  HAZARDOUS: 'hazardous',
  TEXTILE: 'textile',
  CONSTRUCTION: 'construction',
  OTHER: 'other',
} as const;

export const WASTE_UNITS = {
  KILOGRAMS: 'kg',
  TONNES: 'tonnes',
  POUNDS: 'lbs',
  CUBIC_METERS: 'm³',
  LITERS: 'L',
} as const;

export const COMPANY_SIZES = {
  SMALL: 'small',          // < 50 employees
  MEDIUM: 'medium',        // 50-250 employees
  LARGE: 'large',          // 250-1000 employees
  ENTERPRISE: 'enterprise', // > 1000 employees
} as const;
```

### API Constants (`constants/api.ts`)
```typescript
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
} as const;

export const API_ENDPOINTS = {
  WASTE_DATA: '/api/waste-data',
  COMPANIES: '/api/companies',
  ANALYTICS: '/api/analytics',
  UPLOAD: '/api/upload',
} as const;

export const REQUEST_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_BATCH_SIZE: 1000,
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
```

### UI Constants (`constants/ui.ts`)
```typescript
export const CHART_COLORS = {
  PRIMARY: '#10B981',
  SECONDARY: '#3B82F6',
  WARNING: '#F59E0B',
  DANGER: '#EF4444',
  SUCCESS: '#10B981',
  INFO: '#6366F1',
} as const;

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;
```

## 📋 Validation Schemas

### Waste Data Schema (`schemas/waste.schema.ts`)
```typescript
import Joi from 'joi';

export const wasteDataSchema = Joi.object({
  companyId: Joi.string().uuid().required(),
  wasteType: Joi.string().valid(...Object.values(WASTE_TYPES)).required(),
  quantity: Joi.number().positive().required(),
  unit: Joi.string().valid(...Object.values(WASTE_UNITS)).required(),
  date: Joi.date().max('now').required(),
  location: Joi.string().max(200).optional(),
  recycled: Joi.boolean().default(false),
  disposed: Joi.boolean().default(false),
  ghgEmissions: Joi.number().min(0).optional(),
  cost: Joi.number().min(0).optional(),
});

export const companySchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  sector: Joi.string().uuid().required(),
  region: Joi.string().max(100).required(),
  sizeCategory: Joi.string().valid(...Object.values(COMPANY_SIZES)).required(),
});
```

## 🔄 Usage Examples

### Frontend Usage
```typescript
import { WasteData, formatWasteQuantity, WASTE_TYPES } from '../../shared';

const wasteEntry: WasteData = {
  id: '123',
  companyId: '456',
  wasteType: WASTE_TYPES.PLASTIC,
  quantity: 500,
  unit: 'kg',
  // ... other properties
};

const formattedQuantity = formatWasteQuantity(wasteEntry.quantity, wasteEntry.unit);
// Output: "500 kg"
```

### Backend Usage
```typescript
import { wasteDataSchema, calculateGHGEmissions } from '../../shared';

// Validate incoming data
const { error, value } = wasteDataSchema.validate(requestData);
if (error) {
  throw new ValidationError(error.message);
}

// Calculate emissions
const emissions = calculateGHGEmissions(
  value.wasteType,
  value.quantity,
  value.unit
);
```

## 🧪 Testing

### Unit Tests
```typescript
import { calculateRecyclingRate, isValidEmail } from '../utils';

describe('Utility Functions', () => {
  test('calculateRecyclingRate', () => {
    expect(calculateRecyclingRate(75, 100)).toBe(0.75);
    expect(calculateRecyclingRate(0, 0)).toBe(0);
  });

  test('isValidEmail', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });
});
```

## 🔧 Type Safety

### Strict Type Checking
- All types are strictly typed with TypeScript
- Runtime validation with Joi schemas
- Compile-time type checking
- IDE autocomplete support

### Type Guards
```typescript
export const isWasteData = (obj: any): obj is WasteData => {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.companyId === 'string' &&
    typeof obj.quantity === 'number' &&
    obj.quantity > 0
  );
};
```

## 📚 Best Practices

1. **Type Definitions**: Keep types focused and cohesive
2. **Validation**: Always validate at boundaries
3. **Constants**: Use const assertions for immutability
4. **Documentation**: Document complex types and functions
5. **Testing**: Test utility functions thoroughly
6. **Exports**: Use barrel exports (index.ts) for clean imports

## 🔗 Dependencies

- **TypeScript**: Type definitions
- **Joi**: Runtime validation
- **Date-fns**: Date utilities (if needed)

---

Shared foundation for type-safe, consistent development across the platform.