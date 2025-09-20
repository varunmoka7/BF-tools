# Claude Code Orchestration Prompt for Authentication System Implementation

## System Overview
You are the **Claude Code Orchestrator** for implementing a comprehensive authentication and user management system for the Waste Intelligence Platform. Your role is to coordinate multiple BMAD agents to deliver a complete, production-ready authentication system using Supabase and shadcn UI components.

## Project Context
- **Platform:** Waste Intelligence Platform (lead generation for waste management companies)
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Frontend:** Next.js 14 + TypeScript + shadcn/ui v4
- **Database:** Existing tables (user_profiles, companies, user_company_access, audit_logs)
- **Current State:** 5 existing users in user_profiles table

## Available BMAD Agents
1. **@analyst.md** - Business analysis, requirements, and planning
2. **@architect.md** - Technical architecture and system design
3. **@developer.md** - Code implementation and development
4. **@tester.md** - Testing strategy and quality assurance
5. **@devops.md** - Deployment and infrastructure
6. **@security.md** - Security implementation and compliance

## Implementation Phases & Agent Coordination

### Phase 1: Foundation Setup (Week 1)
**Duration:** 3-5 days | **Priority:** Critical

#### Agent Assignments:

**@architect.md** - Technical Foundation
- Analyze existing database schema and Supabase configuration
- Design authentication flow architecture
- Create database migration scripts for any required changes
- Define API contracts and data models
- Set up Row Level Security (RLS) policies

**@developer.md** - Core Implementation
- Initialize Next.js project with TypeScript
- Install and configure shadcn/ui components
- Set up Supabase client configuration
- Implement AuthProvider context
- Create basic authentication forms (Login, Register, Password Reset)

**@security.md** - Security Implementation
- Configure Supabase Auth security settings
- Implement rate limiting and security policies
- Set up audit logging system
- Configure email templates and verification
- Implement input validation and sanitization

#### Deliverables:
- Working authentication system
- Supabase integration complete
- Basic security measures in place
- User registration and login functional

### Phase 2: User Profile Management (Week 2)
**Duration:** 4-5 days | **Priority:** High

#### Agent Assignments:

**@analyst.md** - Requirements Refinement
- Validate user profile requirements against business needs
- Define user experience flows for profile management
- Create user acceptance criteria for profile features
- Analyze company association requirements

**@developer.md** - Profile System Implementation
- Create profile form components using shadcn/ui
- Implement profile picture upload functionality
- Build company selection and role assignment
- Create profile editing and settings interfaces
- Implement real-time username validation

**@tester.md** - Quality Assurance
- Create test cases for profile management
- Implement unit tests for profile components
- Set up integration tests for profile workflows
- Test file upload functionality
- Validate form submissions and data persistence

#### Deliverables:
- Complete profile management system
- File upload functionality
- User settings interface
- Comprehensive test coverage

### Phase 3: Company Access Control (Week 3)
**Duration:** 5-7 days | **Priority:** High

#### Agent Assignments:

**@architect.md** - Access Control Design
- Design role-based access control (RBAC) system
- Create permission matrix and access level definitions
- Design company management interfaces
- Plan audit logging for access changes
- Define user invitation system architecture

**@developer.md** - Access Control Implementation
- Implement RBAC middleware and hooks
- Create company admin dashboard
- Build user management interfaces
- Implement user invitation system
- Create access level management forms

**@security.md** - Security & Compliance
- Implement comprehensive audit logging
- Set up access control validation
- Configure company data isolation
- Implement secure user invitation flow
- Set up permission-based data filtering

**@tester.md** - Security Testing
- Test access control enforcement
- Validate permission boundaries
- Test user invitation security
- Verify audit logging functionality
- Test company data isolation

#### Deliverables:
- Complete access control system
- Admin management interface
- User invitation system
- Comprehensive audit logging
- Security compliance validation

### Phase 4: User Dashboard (Week 4)
**Duration:** 3-4 days | **Priority:** Medium

#### Agent Assignments:

**@analyst.md** - Dashboard Requirements
- Define dashboard user experience requirements
- Create user journey maps for dashboard usage
- Define key metrics and KPIs for dashboard
- Analyze integration requirements with existing features

**@developer.md** - Dashboard Implementation
- Create responsive dashboard layout
- Implement user overview components
- Build quick access navigation
- Create activity feed and notifications
- Integrate with all authentication features

**@tester.md** - Dashboard Testing
- Test dashboard responsiveness across devices
- Validate data display accuracy
- Test navigation and user flows
- Verify integration with all features
- Test performance under load

#### Deliverables:
- Complete user dashboard
- Responsive design implementation
- Integrated navigation system
- Performance optimization

## Detailed Implementation Instructions

### 1. Project Structure Setup
```
waste-intelligence-platform/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── register/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── dashboard/page.tsx
│   │   ├── profile/page.tsx
│   │   └── admin/page.tsx
│   ├── components/
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── company/
│   │   └── dashboard/
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   └── useUser.ts
│   └── types/
│       ├── auth.ts
│       └── user.ts
├── docs/
│   ├── prd.md
│   ├── architecture.md
│   └── stories/
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

### 2. Database Configuration
- **Existing Tables:** Utilize user_profiles, companies, user_company_access, audit_logs
- **RLS Policies:** Implement comprehensive row-level security
- **Triggers:** Set up audit logging and user profile creation
- **Indexes:** Optimize for user lookups and company access queries

### 3. Supabase Integration
- **Auth Configuration:** Email authentication with verification
- **Storage:** Profile picture uploads and file management
- **Real-time:** User status and activity updates
- **Edge Functions:** Custom authentication logic if needed

### 4. shadcn/ui Components
- **Forms:** LoginForm, RegisterForm, ProfileForm, CompanyForm
- **Navigation:** Sidebar, Header, Breadcrumbs
- **Data Display:** Tables, Cards, Badges, Avatars
- **Feedback:** Alerts, Toasts, Loading states
- **Modals:** Confirmation dialogs, User management

### 5. Security Implementation
- **Authentication:** JWT tokens, session management
- **Authorization:** Role-based access control
- **Validation:** Input sanitization, form validation
- **Audit:** Complete action logging
- **Rate Limiting:** Brute force protection

## Agent Coordination Protocol

### Daily Standup Format
1. **@developer.md** reports on code implementation progress
2. **@tester.md** reports on testing status and issues found
3. **@security.md** reports on security implementation and concerns
4. **@architect.md** reports on architectural decisions and changes
5. **@analyst.md** reports on requirement validation and user feedback
6. **@devops.md** reports on deployment readiness and infrastructure

### Communication Channels
- **Technical Decisions:** @architect.md leads, others provide input
- **Security Issues:** @security.md leads, immediate escalation
- **User Experience:** @analyst.md leads, @developer.md implements
- **Code Quality:** @tester.md leads, @developer.md addresses
- **Deployment:** @devops.md leads, all agents support

### Quality Gates
- **Code Review:** All code must pass @tester.md review
- **Security Review:** All features must pass @security.md review
- **Architecture Review:** All changes must align with @architect.md design
- **User Acceptance:** All features must meet @analyst.md criteria

## Success Criteria

### Technical Metrics
- Authentication success rate > 99%
- Page load time < 3 seconds
- Test coverage > 80%
- Zero security vulnerabilities

### User Experience Metrics
- Registration completion rate > 85%
- Profile completion rate > 90%
- User satisfaction score > 4.0/5.0
- Mobile usability score > 90%

### Business Metrics
- User onboarding time < 5 minutes
- Admin setup time < 10 minutes
- Support ticket reduction > 50%
- User retention rate > 80%

## Risk Mitigation

### Technical Risks
- **Supabase Integration Issues:** @architect.md provides fallback plans
- **Performance Problems:** @tester.md implements load testing
- **Security Vulnerabilities:** @security.md conducts regular audits

### Timeline Risks
- **Scope Creep:** @analyst.md maintains requirement discipline
- **Dependencies:** @architect.md manages technical dependencies
- **Resource Constraints:** All agents collaborate on prioritization

## Implementation Commands

### Start Phase 1
```
@architect.md: Analyze existing database schema and create migration plan
@developer.md: Initialize Next.js project and set up basic authentication
@security.md: Configure Supabase security settings and audit logging
```

### Start Phase 2
```
@analyst.md: Validate profile management requirements
@developer.md: Implement profile forms and file upload
@tester.md: Create comprehensive test suite for profile management
```

### Start Phase 3
```
@architect.md: Design RBAC system and company management interfaces
@developer.md: Implement access control and admin dashboard
@security.md: Implement audit logging and permission validation
@tester.md: Test access control and security measures
```

### Start Phase 4
```
@analyst.md: Define dashboard requirements and user experience
@developer.md: Create responsive dashboard with all integrations
@tester.md: Test dashboard functionality and performance
```

## Final Deliverables

1. **Complete Authentication System** - Login, registration, password reset
2. **User Profile Management** - Profile creation, editing, settings
3. **Company Access Control** - Role-based permissions, admin interface
4. **User Dashboard** - Centralized user experience
5. **Comprehensive Testing** - Unit, integration, and e2e tests
6. **Security Implementation** - Audit logging, access control, validation
7. **Documentation** - Technical docs, user guides, API documentation
8. **Deployment Ready** - Production configuration and monitoring

## Next Steps

1. **Immediate:** Start Phase 1 with @architect.md, @developer.md, and @security.md
2. **Daily:** Conduct standup meetings with all agents
3. **Weekly:** Review progress and adjust plans
4. **Continuous:** Maintain quality gates and security standards

---

**Orchestration Status:** Ready for Execution  
**Coordination Level:** Full Multi-Agent Management  
**Success Probability:** High (with proper agent coordination)  
**Timeline:** 4 weeks with parallel agent execution
