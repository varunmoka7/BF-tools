/**
 * Claude Flow Orchestration Index
 * 
 * This module provides the main entry point for Claude Flow orchestration
 * in the BF-Tools waste intelligence platform.
 */

export * from './config';
export * from './agents';
export * from './workflows';
export * from './memory';
export * from './metrics';

/**
 * Claude Flow Configuration
 */
export interface ClaudeFlowConfig {
  maxAgents: number;
  topology: 'mesh' | 'hierarchical' | 'ring' | 'star';
  strategy: 'balanced' | 'specialized' | 'adaptive';
  enableMemory: boolean;
  enableMetrics: boolean;
}

/**
 * Default Claude Flow Configuration
 */
export const defaultConfig: ClaudeFlowConfig = {
  maxAgents: 8,
  topology: 'mesh',
  strategy: 'adaptive',
  enableMemory: true,
  enableMetrics: true,
};

/**
 * Available Agent Types
 */
export const AGENT_TYPES = [
  'coder',
  'reviewer', 
  'tester',
  'planner',
  'researcher',
  'hierarchical-coordinator',
  'mesh-coordinator',
  'adaptive-coordinator',
  'collective-intelligence-coordinator',
  'swarm-memory-manager',
  'byzantine-coordinator',
  'raft-manager',
  'gossip-coordinator',
  'consensus-builder',
  'crdt-synchronizer',
  'perf-analyzer',
  'performance-benchmarker',
  'task-orchestrator',
  'memory-coordinator',
  'smart-agent',
  'github-modes',
  'pr-manager',
  'code-review-swarm',
  'issue-tracker',
  'release-manager',
  'workflow-automation',
  'project-board-sync',
  'repo-architect',
  'multi-repo-swarm',
  'sparc-coord',
  'sparc-coder',
  'specification',
  'pseudocode',
  'architecture',
  'refinement',
  'backend-dev',
  'mobile-dev',
  'ml-developer',
  'cicd-engineer',
  'api-docs',
  'system-architect',
  'code-analyzer',
  'base-template-generator',
  'tdd-london-swarm',
  'production-validator',
  'test-writer-fixer',
] as const;

export type AgentType = typeof AGENT_TYPES[number];

/**
 * SPARC Workflow Phases
 */
export const SPARC_PHASES = [
  'specification',
  'pseudocode', 
  'architecture',
  'refinement',
  'completion',
] as const;

export type SparcPhase = typeof SPARC_PHASES[number];

/**
 * Claude Flow Commands
 */
export const CLAUDE_FLOW_COMMANDS = {
  // Core commands
  SPARC_MODES: 'npx claude-flow sparc modes',
  SPARC_RUN: 'npx claude-flow sparc run',
  SPARC_TDD: 'npx claude-flow sparc tdd',
  SPARC_INFO: 'npx claude-flow sparc info',
  
  // Batch commands
  SPARC_BATCH: 'npx claude-flow sparc batch',
  SPARC_PIPELINE: 'npx claude-flow sparc pipeline',
  SPARC_CONCURRENT: 'npx claude-flow sparc concurrent',
  
  // Swarm commands
  SWARM_INIT: 'npx claude-flow@alpha swarm init',
  AGENT_SPAWN: 'npx claude-flow@alpha agent spawn',
  TASK_ORCHESTRATE: 'npx claude-flow@alpha task orchestrate',
  
  // Monitoring
  METRICS_COLLECT: 'npx claude-flow@alpha metrics collect',
  SWARM_STATUS: 'npx claude-flow@alpha swarm status',
} as const;