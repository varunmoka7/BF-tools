# Claude Flow Orchestration

This directory contains all Claude Flow configuration, agents, workflows, and orchestration files for the BF-Tools waste intelligence platform.

## 📁 Directory Structure

```
.claude-flow/
├── config/          # Configuration files
│   └── CLAUDE.md    # Main Claude configuration
├── agents/          # Agent definitions
│   ├── *.txt        # Individual agent configurations
│   └── team-*.txt   # Team compositions
├── workflows/       # Workflow templates and expansion packs
│   ├── bmad-*/      # Business Model Analysis & Design workflows
│   └── *.json       # Workflow definitions
├── memory/          # Persistent memory storage
│   ├── agents/      # Agent memory
│   └── sessions/    # Session memory
└── metrics/         # Performance tracking
    ├── performance.json     # Performance metrics
    ├── system-metrics.json  # System metrics
    └── task-metrics.json    # Task metrics
```

## 🤖 Available Agents (54 Total)

### Core Development
- `coder` - Implementation specialist
- `reviewer` - Code review specialist  
- `tester` - Testing and QA specialist
- `planner` - Strategic planning
- `researcher` - Deep research specialist

### Swarm Coordination
- `hierarchical-coordinator` - Queen-led coordination
- `mesh-coordinator` - Peer-to-peer coordination
- `adaptive-coordinator` - Dynamic topology switching
- `collective-intelligence-coordinator` - Shared intelligence
- `swarm-memory-manager` - Distributed memory

### Consensus & Distributed Systems
- `byzantine-coordinator` - Byzantine fault tolerance
- `raft-manager` - Raft consensus algorithm
- `gossip-coordinator` - Gossip-based consensus
- `consensus-builder` - Voting mechanisms
- `crdt-synchronizer` - Conflict-free replicated data

### Performance & Optimization
- `perf-analyzer` - Performance bottleneck analysis
- `performance-benchmarker` - Comprehensive benchmarking
- `task-orchestrator` - Central task coordination
- `memory-coordinator` - Memory management
- `smart-agent` - Intelligent coordination

### GitHub & Repository Management
- `github-modes` - GitHub workflow orchestration
- `pr-manager` - Pull request lifecycle
- `code-review-swarm` - Multi-agent code reviews
- `issue-tracker` - Issue management
- `release-manager` - Release coordination
- `workflow-automation` - GitHub Actions automation
- `project-board-sync` - Project board synchronization
- `repo-architect` - Repository structure optimization
- `multi-repo-swarm` - Cross-repository coordination

### SPARC Methodology
- `sparc-coord` - SPARC orchestration
- `sparc-coder` - SPARC implementation
- `specification` - Requirements analysis
- `pseudocode` - Algorithm design
- `architecture` - System design
- `refinement` - Iterative improvement

### Specialized Development
- `backend-dev` - Backend API development
- `mobile-dev` - React Native development
- `ml-developer` - Machine learning specialist
- `cicd-engineer` - CI/CD pipeline specialist
- `api-docs` - API documentation
- `system-architect` - System architecture
- `code-analyzer` - Advanced code analysis
- `base-template-generator` - Template generation

### Testing & Validation
- `tdd-london-swarm` - TDD London School
- `production-validator` - Production readiness
- `test-writer-fixer` - Test automation

## 🔧 Configuration

### CLAUDE.md
Main configuration file containing:
- Execution rules and patterns
- File organization guidelines
- SPARC workflow phases
- Agent coordination protocols
- Performance optimization settings

## 🚀 Quick Commands

```bash
# Initialize swarm
npx claude-flow@alpha swarm init --topology mesh

# Spawn agents
npx claude-flow@alpha agent spawn --type coder
npx claude-flow@alpha agent spawn --type tester

# Execute SPARC workflow
npx claude-flow@alpha sparc tdd "feature description"

# Monitor performance
npx claude-flow@alpha metrics collect
```

## 📊 Metrics & Monitoring

### Performance Metrics
- Task execution times
- Agent efficiency scores
- Memory usage patterns
- Token consumption tracking

### System Metrics
- Swarm health status
- Agent availability
- Resource utilization
- Error rates and patterns

### Task Metrics
- Completion rates
- Quality scores
- Collaboration effectiveness
- Learning progression

## 🎯 Best Practices

1. **Agent Selection**: Choose specialized agents for specific tasks
2. **Swarm Topology**: Match topology to task complexity
3. **Memory Management**: Use persistent memory for context
4. **Performance Monitoring**: Regular metrics collection
5. **Workflow Templates**: Reuse proven patterns

## 🔗 Integration

Claude Flow integrates with:
- GitHub Actions and workflows
- Development environments
- Testing frameworks
- Deployment pipelines
- Monitoring systems

## 📚 Documentation

- [Agent Definitions](./agents/)
- [Workflow Templates](./workflows/)
- [Configuration Guide](./config/CLAUDE.md)
- [Performance Metrics](./metrics/)

---

**Remember**: Claude Flow coordinates, Claude Code creates!