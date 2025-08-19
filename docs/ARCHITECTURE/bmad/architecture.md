Fullstack Architecture Document: Waste Management BI Dashboard
Version: 1.0

Date: August 19, 2025

Section 1: Introduction
This document outlines the complete fullstack architecture for the Waste Management BI Dashboard, including the frontend implementation, the Supabase backend integration, and their interaction. It serves as the single source of truth for the AI development agents, ensuring consistency across the entire technology stack.

Starter Template or Existing Project
Approach: This is a greenfield project. We will not be using a pre-packaged starter template.

Foundation: The architecture will be built from scratch based on the stack defined in the PRD: a Next.js monorepo connected to a Supabase backend. All tooling and configuration will be set up as part of the initial development stories.

Change Log
Date	Version	Description	Author
August 19, 2025	1.0	Initial draft	Winston (Architect)

Export to Sheets
Section 2: High-Level Architecture
Technical Summary
This project will be a modern, data-driven web application built within a monorepo structure. The frontend will be a server-rendered application using Next.js and React, hosted on Vercel. It will communicate directly with a Supabase Backend-as-a-Service (BaaS) instance, which provides the Postgres database and auto-generated APIs. This architecture is designed for rapid development, scalability, and a high-quality user experience, directly supporting the goal of delivering an interactive and performant BI dashboard.

Platform and Infrastructure
Platform: Supabase will be used as the all-in-one backend.

Key Services: We will primarily use the Supabase Database (Postgres) and its auto-generated RESTful API for all data operations.

Deployment Host: Vercel is recommended for hosting the Next.js frontend.

Rationale: Vercel is built by the creators of Next.js and offers a seamless, zero-configuration deployment experience with best-in-class performance.

Repository Structure
Structure: Monorepo

Rationale: To keep the frontend and any potential future backend code (like database migrations or serverless functions) in a single, manageable repository. We will use npm workspaces for simplicity.

High-Level Architecture Diagram
Code snippet

graph TD
    A[User's Browser] --> B[Vercel Platform];
    B --> C{Next.js Frontend App};
    C -- API Calls --> D[Supabase Backend];
    D -- Queries --> E[Supabase Postgres DB];
    E -- Returns Data --> D;
    D -- Returns JSON --> C;

    subgraph Hosting
        B
    end
    subgraph Backend-as-a-Service
        D
        E
    end
Architectural Patterns
Backend-as-a-Service (BaaS): We will use Supabase to abstract the backend infrastructure, allowing us to focus on frontend development and user-facing features.

Component-Based UI: The frontend will be built using reusable React components, as defined in the UI/UX Specification, ensuring a modular and maintainable codebase.

Client-Side Data Fetching: The Next.js application will fetch data directly from the Supabase API within the components, using React hooks. This is a simple and effective pattern for a dynamic dashboard.

Section 3: Tech Stack
Category	Technology	Version	Purpose & Rationale
Frontend Language	TypeScript	~5.4	For type-safe application code, reducing errors and improving developer experience.
Frontend Framework	Next.js	~14.2	Provides a robust, production-grade React framework with file-based routing and server-side rendering capabilities.
UI Library	shadcn/ui	~0.8	A collection of composable and accessible components that allows for rapid UI development while maintaining full code ownership.
State Management	React Context API	(built-in)	For managing simple, global UI state. It's sufficient for the MVP and avoids adding external library complexity.
Backend Platform	Supabase	(latest)	Acts as our complete Backend-as-a-Service (BaaS), providing the database and APIs.
Database	PostgreSQL	15+	A powerful and reliable open-source relational database, managed by Supabase.
API Style	REST	(PostgREST)	Supabase provides a fast, auto-generated RESTful API directly from our Postgres schema, accelerating development.
Frontend Testing	Jest & React Testing Library	(latest)	The industry standard for unit and integration testing of React components.
E2E Testing	Playwright	~1.44	A modern end-to-end testing framework for ensuring user journeys work as expected across different browsers.
Deployment	Vercel	(latest)	Offers a seamless, Git-integrated deployment platform optimized for Next.js applications.
Styling	Tailwind CSS	~3.4	A utility-first CSS framework that allows for rapid styling directly in the markup, perfectly complementing shadcn/ui.

Export to Sheets
Section 4: Data Models
1. Company
Purpose: Represents a single company in the dataset, containing its master data.

TypeScript Interface:

TypeScript

export interface Company {
  id: string; // UUID
  company_name: string;
  country: string;
  sector: string;
  industry: string;
  employees?: number;
  year_of_disclosure: number;
  created_at: string; // TIMESTAMPTZ
}
2. Waste Stream
Purpose: Represents a single, raw waste metric reported by a company for a specific year.

TypeScript Interface:

TypeScript

export interface WasteStream {
  id: string; // UUID
  company_id: string; // Foreign key to Company
  reporting_period: number;
  metric: string;
  hazardousness: string;
  treatment_method: string;
  value: number; // DECIMAL
  unit: string;
  created_at: string; // TIMESTAMPTZ
}
3. Company Metric
Purpose: Stores pre-aggregated, calculated metrics for a company for a specific year to ensure dashboard performance.

TypeScript Interface:

TypeScript

export interface CompanyMetric {
  id: string; // UUID
  company_id: string; // Foreign key to Company
  reporting_period: number;
  total_waste_generated?: number;
  total_waste_recovered?: number;
  total_waste_disposed?: number;
  recovery_rate?: number;
  created_at: string; // TIMESTAMPTZ
}
Section 5: API Specification
The frontend application will interact with the auto-generated Supabase REST API using the @supabase/supabase-js client library.

Key API Endpoints
Fetch All Companies: GET /rest/v1/companies

Fetch Latest Metrics: GET /rest/v1/company_metrics

Fetch Data for One Company: GET /rest/v1/companies?id=eq.{companyId}

Section 6: Components
Logical Components
Next.js Frontend Application: The user-facing application.

Data Access Layer (within Frontend): A module that encapsulates all data-fetching logic from Supabase.

UI Library (within Frontend): Our collection of reusable UI elements from shadcn/ui and Recharts.

Supabase Backend (BaaS): The managed backend providing the database and API.

Component Interaction Diagram
Code snippet

graph TD
    subgraph "Next.js Frontend App"
        A[UI Library (shadcn/ui, Recharts)]
        B[Data Access Layer (Supabase Client)]
    end

    C[Supabase Backend (BaaS)]

    A -- Needs Data --> B
    B -- Fetches Data --> C
Section 7: External APIs
Google Fonts API
Purpose: To load the "Inter" font family for the UI.

Integration: Will be imported using the next/font package.

Section 8: Core Workflows
User Journey: From Directory to Dashboard
Code snippet

sequenceDiagram
    participant User
    participant Browser
    participant Next.js Frontend
    participant Data Access Layer
    participant Supabase Backend

    User->>Browser: Enters main URL
    Browser->>Next.js Frontend: GET /
    Next.js Frontend->>Data Access Layer: getAllCompanies()
    Data Access Layer->>Supabase Backend: GET /rest/v1/companies
    Supabase Backend-->>Data Access Layer: Returns Company List JSON
    Data Access Layer-->>Next.js Frontend: Returns data
    Next.js Frontend-->>Browser: Renders Company Directory Page

    User->>Browser: Clicks on a Company
    Browser->>Next.js Frontend: GET /company/[id]
    Next.js Frontend->>Data Access Layer: getCompanyDetails(id)
    Data Access Layer->>Supabase Backend: GET /rest/v1/companies?id=eq...
    Supabase Backend-->>Data Access Layer: Returns Detailed Company JSON
    Data Access Layer-->>Next.js Frontend: Returns data
    Next.js Frontend-->>Browser: Renders Deep Dive Page
Section 9: Database Schema
This schema will be implemented in our Supabase Postgres database.

Table: companies
SQL

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    country TEXT,
    sector TEXT,
    industry TEXT,
    employees INTEGER,
    year_of_disclosure INTEGER,
    document_urls JSONB,
    source_names JSONB,
    source_urls JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);
Table: waste_streams
SQL

CREATE TABLE waste_streams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    reporting_period INTEGER NOT NULL,
    metric TEXT NOT NULL,
    hazardousness TEXT NOT NULL,
    treatment_method TEXT NOT NULL,
    value DECIMAL(15, 2) NOT NULL,
    unit TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);
Table: company_metrics
SQL

CREATE TABLE company_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    reporting_period INTEGER NOT NULL,
    total_waste_generated DECIMAL(15, 2),
    total_waste_recovered DECIMAL(15, 2),
    total_waste_disposed DECIMAL(15, 2),
    recovery_rate DECIMAL(5, 2),
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id, reporting_period)
);
Section 10: Frontend Architecture
Component Organization
src/
├── components/
│   ├── ui/
│   ├── charts/
│   └── layout/
└── features/
    ├── company-directory/
    └── company-detail/
Routing Architecture (Next.js App Router)
src/
└── app/
    ├── page.tsx                # Main Page
    └── company/
        └── [id]/
            └── page.tsx        # Detail Page
Section 11: Backend Architecture
Approach: As we are using Supabase (BaaS), we will not be writing custom backend service code. The frontend will communicate directly with the Supabase platform's auto-generated APIs.

Security: Security will be enforced via Supabase's Row Level Security (RLS).

Section 12: Unified Project Structure
waste-dashboard-mvp/
├── docs/
├── public/
├── src/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── services/
│   └── types/
├── .env.local
├── package.json
└── tsconfig.json
Section 13: Development Workflow
Local Development Setup
Prerequisites: Node.js ~v20.x, npm ~v10.x, Git.

Commands: npm install, npm run dev, npm run build, npm run test.

Environment Configuration
.env.local file required with: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.

Section 14: Deployment Architecture
CI/CD Pipeline
A Git-triggered CI/CD workflow will be used, automated by Vercel's integration with GitHub. Pushing to a feature branch creates a Preview Deployment; merging to main deploys to Production.

Environments
Environment	Platform	Purpose
Development	Local Machine	Local development
Preview	Vercel	Review and QA
Production	Vercel	Live application

Export to Sheets
Section 15: Security and Performance
Security Requirements
Row Level Security (RLS): RLS must be enabled on all Supabase tables to ensure the public anon key has read-only access.

Performance Optimization
Static Site Generation (SSG): The Next.js app will leverage SSG with Incremental Static Regeneration (ISR) to serve pages instantly from Vercel's Edge Network.

Backend Performance: The dashboard will primarily query the pre-aggregated company_metrics table to ensure fast API responses.

Section 16: Testing Strategy
Unit Tests: Jest & React Testing Library for components.

Integration Tests: Jest for the Data Access Layer, mocking the Supabase client.

E2E Tests: Playwright for critical user flows.

Section 17: Coding Standards
Critical Fullstack Rules
All data fetching must go through the Data Access Layer (src/services/).

Environment variables must be accessed via process.env.

All data must be strongly typed using interfaces from src/types/.

Section 18: Error Handling Strategy
Global: React Error Boundaries to prevent app crashes.

Data Fetching: Component-level state to handle and display contextual error messages.

Notifications: shadcn/ui Toast or Alert components for user-friendly notifications.

Section 19: Monitoring and Observability
Monitoring Stack
Frontend: Vercel Analytics.

Backend: Supabase Dashboard.

Error Tracking: Sentry.