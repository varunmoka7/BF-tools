Product Requirements Document: Waste Management BI Dashboard
Version: 1.0

Date: August 19, 2025

Section 1: Goals and Background Context
Goals
Successfully launch a functional and polished dashboard that accurately visualizes the entire 5,732-record dataset.

Create a valuable tool for business development teams at waste management companies to identify and qualify new leads.

Enable sustainability managers at large corporations to easily benchmark their waste management performance against industry peers.

Ensure the user experience is intuitive enough that a user can select any company and understand its core waste trends within 60 seconds.

Background Context
Valuable corporate waste management data is currently locked in static reports, making it difficult to analyze trends, compare performance, or identify business opportunities. This project solves this by creating a web-based dashboard that transforms this static data into a dynamic, visual tool. The dashboard will provide a clean, two-page interface: a main directory for discovering companies and a detailed "deep-dive" page for visual analysis.

Change Log
Date	Version	Description	Author
August 19, 2025	1.0	Initial PRD draft	John (PM)

Export to Sheets
Section 2: Requirements
Functional Requirements (FR)
FR1: The application must securely connect to the Supabase database and fetch data primarily from the companies, waste_streams, and company_metrics tables.

FR2: The main page must display a searchable, sortable, and paginated table containing a unique entry for every company from the companies table.

FR3: The main table must include columns for Company Name, Country, Sector, Industry, Latest Reporting Year, Total Waste (for Latest Year), and Recovery Rate (for Latest Year).

FR4: Clicking on a company's name in the main table must navigate the user to that company's dedicated detail page.

FR5: The detail page must dynamically display the name and key information of the selected company.

FR6: The detail page must feature KPI scorecards for the latest year's "Total Waste Generated," "Recovery Rate," and "Waste per Employee," sourced from the company_metrics table.

FR7: The detail page must include a bar chart visualizing the historical trend of "Total Waste Generated" vs. "Total Waste Disposed," based on data from the company_metrics table.

FR8: The detail page must include a donut chart visualizing the composition of "Waste Recovered" vs. "Waste Disposed" for the latest year.

FR9: The detail page must contain a detailed table listing all raw metrics for the selected company from the waste_streams table.

FR10: The detailed table must provide clickable links to the original source documents, using the URLs stored in the companies table.

FR11: The "Recovery Rate" KPI must be calculated using a standardized formula: (Total Waste Recovered / Total Waste Generated) * 100. This calculation must be applied consistently to all companies to ensure fair benchmarking.

FR12: The application must first attempt to fetch data from the company_metrics table. If data for a selected company is not present in that table, the application must fall back to calculating the necessary metrics on-the-fly from the raw waste_streams table for that company.

Non-Functional Requirements (NFR)
NFR1: The dashboard must be a responsive web application, optimized for modern desktop and tablet browsers. The layout must remain functional and readable on modern mobile phone browsers, though it does not need to be optimized for them in the MVP.

NFR2: All dashboard pages must load in under 3 seconds on a standard broadband connection, leveraging the pre-aggregated company_metrics table for performance.

NFR3: The user interface must be built using the shadcn/ui component library to ensure a clean, modern, and consistent design.

NFR4: The frontend application must securely connect to the provided Supabase backend to fetch all data using the official Supabase client library.

NFR5: The frontend application must be deployable to a modern static hosting platform (e.g., Vercel, Netlify).

Section 3: User Interface Design Goals
Overall UX Vision
The dashboard will be a clean, modern, and intuitive BI tool that makes complex data accessible and easy to understand at a glance. The user experience should feel professional, trustworthy, and data-driven, empowering users to find insights quickly. This vision will be realized using the shadcn/ui component library, ensuring a professional, accessible, and consistent aesthetic.

Key Interaction Paradigms
Main Page: The core interaction will be searching, sorting, and filtering the main company directory table.

Deep Dive Page: The core interactions will be hovering over chart elements (bars, donut slices) to view detailed tooltips with precise data.

Data Source: All interactions will be powered by data fetched from the Supabase backend, making the dashboard a dynamic and responsive interface.

Core Screens and Views
Main Page (Company Directory): Displays the master list of all companies.

Deep Dive Page (Company Dashboard): Displays the detailed analytics for a single, selected company.

Accessibility
Standard: The application will aim to meet WCAG 2.1 Level AA standards.

Branding
To be defined. For the MVP, we will use a clean, professional, and neutral theme based on the shadcn/ui component library.

Target Platforms
The application will be Web Responsive, optimized for desktop and tablet use, while remaining functional on mobile.

Section 4: Technical Assumptions
Repository Structure: Monorepo
Assumption: The project will be housed in a single Monorepo.

Rationale: This approach is well-suited for a Next.js full-stack application, as it simplifies dependency management and allows for easy sharing of types and code.

Service Architecture: Backend-as-a-Service (BaaS)
Technology: Supabase.

Rationale: The application will use Supabase as its complete backend. This includes the Postgres database, authentication, and the auto-generated APIs for data access, accelerating development.

Testing Requirements: Unit + Integration
Approach: The testing strategy will include both unit tests for individual components and functions, as well as integration tests to verify the connection between the frontend and the Supabase backend.

Additional Technical Assumptions and Requests
Frontend Stack: Next.js with React 19 and TypeScript.

UI Components: shadcn/ui.

Styling: Tailwind CSS.

Deployment: Vercel or Netlify.

Section 5: Epic List
Epic 1: Dashboard Foundation & Core Functionality
Goal: To build and launch the complete, two-page BI dashboard, including data integration from Supabase, the main company directory, and the detailed company analytics view with all specified charts and KPIs.

Section 6: Epic Details
Expanded Epic Goal
The goal of this epic is to build and launch the complete, two-page BI dashboard. This includes creating the Next.js application, establishing a secure connection to the Supabase backend, implementing the main company directory, and building the detailed company analytics view with all specified KPIs, charts, and tables. The final deliverable will be a fully functional, deployed web application.

Story 1.1: Project & Backend Setup
As a developer, I want a new Next.js project created with all necessary dependencies installed, so that I can establish a secure connection to the Supabase backend.

Acceptance Criteria:

A new Next.js 14+ application is created with TypeScript.

All required libraries (shadcn/ui, tailwindcss, @supabase/supabase-js) are installed.

A Supabase client is initialized and configured using environment variables.

A test function successfully connects to Supabase and fetches the total number of companies.

Story 1.2: Build the Main Company Directory Page
As a user, I want to see a searchable and sortable table of all companies on the main page, so that I can find companies of interest and navigate to their details.

Acceptance Criteria:

The main page fetches and displays all companies from the Supabase companies table.

The table is built using shadcn/ui components and includes the columns defined in FR3.

The table includes a search bar that filters companies by name.

Clicking on a company row navigates the user to the detail page for that company (e.g., /company/[id]).

Story 1.3: Build the Detail Page Layout & KPIs
As a user, I want to see the key performance indicators for a selected company, so that I can get an immediate snapshot of their performance.

Acceptance Criteria:

The detail page correctly fetches and displays the data for the selected company.

The page displays the company's name, country, and sector in a clear header.

Three KPI scorecards (using shadcn/ui Card components) are displayed for the latest reporting year.

The data for the KPIs is sourced from the company_metrics table, with a fallback to the waste_streams table as per FR12.

Story 1.4: Add Historical Trend Chart
As a user, I want to see a historical bar chart of a company's waste generation and disposal, so that I can understand their performance trend over time.

Acceptance Criteria:

A grouped bar chart is added to the detail page.

The chart displays data for each available year from the company_metrics table.

Hovering over a bar displays a tooltip with the exact value.

Story 1.5: Add Waste Composition Chart
As a user, I want to see a donut chart of a company's waste composition for the latest year, so that I can quickly understand their waste management efficiency.

Acceptance Criteria:

A donut chart is added to the detail page.

The chart shows the proportional split between "Waste Recovered" and "Waste Disposed."

The center of the donut displays the overall "Recovery Rate" percentage.

Story 1.6: Add Detailed Metrics Table
As a user, I want to see a table with all the raw data for a company, so that I can perform a deep-dive analysis and verify the information.

Acceptance Criteria:

A table is added to the bottom of the detail page.

The table displays all entries for the selected company from the waste_streams table.

The table includes a "Source" column with a clickable link to the source document URL.

Story 1.7: Styling & Responsiveness Polish
As a user, I want the dashboard to have a polished and consistent look on my desktop or tablet, so that I have a professional and easy-to-use experience.

Acceptance Criteria:

All components and pages adhere to a consistent theme.

The layout is fully responsive and optimized for desktop and tablet screens.

All interactive elements have clear hover and focus states.


Recommendation: Add a non-functional requirement: "The public-facing Supabase API key must be managed securely as an environment variable, and Row Level Security (RLS) policies must be enabled in Supabase to restrict data access."


## Section 7: Next Steps (Final PRD Section)
Here are the handoff prompts for the next agents in our workflow.

UX Expert Prompt
Handoff to UX Expert: Please take this completed PRD as your primary input. Your task is to create the UI/UX Specification (front-end-spec.md). Pay close attention to Section 3 ("User Interface Design Goals") and the detailed user stories in Section 6 to guide your design of the user flows and information architecture.

Architect Prompt
Handoff to Architect: Please take this completed PRD as your primary input. Your task is to create the Fullstack Architecture Document (architecture.md). Pay close attention to Section 4 ("Technical Assumptions") and the detailed user stories in Section 6. Your architecture must provide a clear technical blueprint for implementing this dashboard using Supabase and shadcn/ui.