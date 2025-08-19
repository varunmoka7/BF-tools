# Claude Code Configuration - SPARC Development Environment

## 🚨 CRITICAL: CONCURRENT EXECUTION & FILE MANAGEMENT

**ABSOLUTE RULES**:
1. ALL operations MUST be concurrent/parallel in a single message
2. **NEVER save working files, text/mds and tests to the root folder**
3. ALWAYS organize files in appropriate subdirectories

### ⚡ GOLDEN RULE: "1 MESSAGE = ALL RELATED OPERATIONS"

**MANDATORY PATTERNS:**
- **TodoWrite**: ALWAYS batch ALL todos in ONE call (5-10+ todos minimum)
- **Task tool**: ALWAYS spawn ALL agents in ONE message with full instructions
- **File operations**: ALWAYS batch ALL reads/writes/edits in ONE message
- **Bash commands**: ALWAYS batch ALL terminal operations in ONE message
- **Memory operations**: ALWAYS batch ALL memory store/retrieve in ONE message

### 📁 File Organization Rules

**NEVER save to root folder. Use these directories:**
- `/frontend/src` - Frontend source code
- `/backend/src` - Backend source code
- `/shared` - Shared types and utilities
- `/docs` - Documentation and markdown files
- `/data` - Data files and migrations
- `/tools` - Scripts and automation
- `/infrastructure` - Docker, CI/CD configs
- `/.claude-flow` - Claude Flow configuration

## Project Structure

```
BF-tools/
├── .claude-flow/           # Claude Flow orchestration
│   ├── config/            # Configuration files
│   ├── agents/            # Agent definitions
│   ├── workflows/         # Workflow templates
│   ├── memory/            # Memory storage
│   └── metrics/           # Performance metrics
├── frontend/              # Frontend application
│   ├── src/               # React/Vite source
│   ├── tests/             # Frontend tests
│   └── config/            # Frontend configs
├── backend/               # Backend services
│   ├── src/               # Node.js/Express source
│   ├── tests/             # Backend tests
│   └── config/            # Backend configs
├── shared/                # Shared resources
│   ├── types/             # TypeScript types
│   ├── utils/             # Utility functions
│   └── constants/         # Constants
├── data/                  # Data management
│   ├── datasets/          # Raw data files
│   ├── migrations/        # Database migrations
│   └── backups/           # Data backups
├── tools/                 # Development tools
│   ├── scripts/           # Utility scripts
│   ├── automation/        # Automation tools
│   └── testing/           # Testing utilities
├── infrastructure/        # Infrastructure as code
│   ├── docker/            # Docker configs
│   ├── scripts/           # Deployment scripts
│   └── ci-cd/             # CI/CD pipelines
├── docs/                  # Documentation
├── apps/                  # Additional applications
└── node_modules/          # Dependencies
```

## Build Commands
- `npm run dev` - Start frontend dev server
- `npm run build` - Build frontend
- `npm run backend:dev` - Start backend dev server
- `npm run backend:build` - Build backend
- `npm run test` - Run all tests
- `npm run lint` - Linting
- `npm run type-check` - Type checking

## SPARC Workflow Phases

1. **Specification** - Requirements analysis
2. **Pseudocode** - Algorithm design
3. **Architecture** - System design
4. **Refinement** - TDD implementation
5. **Completion** - Integration

## Code Style & Best Practices

- **Modular Design**: Files under 500 lines
- **Environment Safety**: Never hardcode secrets
- **Test-First**: Write tests before implementation
- **Clean Architecture**: Separate concerns
- **Documentation**: Keep updated

---

Remember: **Claude Flow coordinates, Claude Code creates!**