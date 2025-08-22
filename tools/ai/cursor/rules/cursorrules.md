# BF-tools Project Rules

## Project Structure
- This is a waste management platform with multiple apps
- Main Next.js app: `apps/waste-intelligence-platform/`
- Backend: `backend/` (Node.js/Express)
- Frontend: `frontend/` (Vite/React)
- Shared types: `shared/types/`

## Tech Stack
- Next.js 14+ with TypeScript
- Supabase for database
- Tailwind CSS + shadcn/ui components
- Node.js backend with Express
- Waste management domain knowledge required

## Development Guidelines
- Follow TypeScript best practices
- Use shadcn/ui components for consistency
- Implement proper error handling
- Follow the existing project structure
- Reference docs/stories/ for requirements

## Current Project Status
- Working on Story 1.1: Waste Dashboard MVP
- 5,732 company records in dataset
- Company directory with search functionality implemented
- Company detail pages with KPI cards
- Supabase integration complete

## Key Files to Reference
- `docs/stories/1.1-waste-dashboard-mvp.md` - Current story requirements
- `apps/waste-intelligence-platform/src/components/company-directory.tsx` - Main directory component
- `apps/waste-intelligence-platform/src/services/companies.ts` - Data access layer
- `apps/waste-intelligence-platform/src/types/waste.ts` - TypeScript interfaces

## Common Tasks
- Optimize Supabase queries for large datasets
- Implement search and filtering functionality
- Create reusable UI components
- Handle loading states and error boundaries
- Ensure responsive design for desktop/tablet

## Domain Knowledge
- Waste management metrics (total waste, recovery rate, disposal)
- Company data structure (name, country, sector, industry)
- Environmental compliance and reporting
- Circular economy principles

### 4. **Now You Can Use Agents Effectively**

With this `.cursorrules` file, when you ask agents questions, they'll understand:

- Your current story (1.1 MVP)
- Your 5,732 company dataset
- Your existing components and patterns
- Your tech stack and preferences

### 5. **Try These Agent Interactions Right Now**

Since you're already in Cursor, try these:

1. **Open your company directory component:**
   - Navigate to `apps/waste-intelligence-platform/src/components/company-directory.tsx`
   - Press `Cmd+K`
   - Ask: "How can I improve the search performance for 5,732 companies?"

2. **Ask about your current story:**
   - Press `Cmd+K`
   - Ask: "What are the remaining tasks for Story 1.1 MVP?"

3. **Get help with specific code:**
   - Open any TypeScript file
   - Select some code
   - Press `Cmd+K`
   - Ask: "How can I optimize this code?"

### 6. **Benefits You'll Get**

With proper `.cursorrules`, agents will:
- ✅ Know your project context instantly
- ✅ Understand your waste management domain
- ✅ Reference your existing code patterns
- ✅ Suggest improvements based on your tech stack
- ✅ Help with your specific Story 1.1 requirements

You're all set! The background agents are ready to help you build your waste management dashboard more efficiently. Just press `Cmd+K` whenever you need assistance!
