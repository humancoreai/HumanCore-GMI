export type Zone = 'green' | 'yellow' | 'red';
export type WorkflowStatus = 'planned' | 'running' | 'waiting' | 'done';
export type WorkflowOrigin = 'SV' | 'Wizard';
export type WorkflowType = 'generic' | 'document';

export interface Workflow {
  id: string;
  name: string;
  type: WorkflowType;
  zone: Zone;
  status: WorkflowStatus;
  origin: WorkflowOrigin;
  progress: number; // 0-100
  assignedTo?: string; // Worker ID
  meta?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface LogEntry {
  id: string;
  source: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  context?: string;
  timestamp: string;
}

export interface SystemConfig {
  profileName: string;
  autonomyLevel: number;
  requireConfirmationForCritical: boolean;
  generatedAt: string | null;
}

export type WorkerStatus = 'IDLE' | 'BUSY' | 'COOLDOWN' | 'OFFLINE';

export interface WorkerState {
  id: string;
  name: string;
  status: WorkerStatus;
  currentTaskId: string | null;
  efficiency: number; // 0.1 - 2.0 speed multiplier
  stats: {
    tasksCompleted: number;
    ticksActive: number;
  };
}

export interface AppState {
  config: SystemConfig | null;
  workflows: Workflow[];
  logs: LogEntry[];
  workers: WorkerState[];
  stats: {
    ticks: number;
    lastSave: string;
  };
}

export type TabId = 'dashboard' | 'wizard' | 'workflows' | 'logs' | 'config';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'supervisor';
  text: string;
  type?: 'text' | 'alert' | 'success';
  timestamp: Date;
}

export const EVENTS = {
  CORE_INIT: 'CORE:INIT',
  TICK: 'TICK',
  STATE_CHANGED: 'STATE:CHANGED',
  WORKER_ASSIGNED: 'WORKER:ASSIGNED',
  LOG_NEW: 'LOG:NEW',
  WORKFLOW_ADDED: 'WORKFLOW:ADDED',
};
