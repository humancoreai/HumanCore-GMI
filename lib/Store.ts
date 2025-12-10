import { AppState, SystemConfig, LogEntry, Workflow, WorkerState, EVENTS, WorkflowType, Zone } from '../types';
import { eventBus } from './EventBus';

const STORAGE_KEY = 'hc_v1_1_state';

const INITIAL_STATE: AppState = {
  config: null,
  workflows: [],
  logs: [],
  workers: [
    { id: 'w-01', name: 'Worker Alpha', status: 'IDLE', currentTaskId: null, efficiency: 1.2, stats: { tasksCompleted: 0, ticksActive: 0 } },
    { id: 'w-02', name: 'Worker Beta', status: 'IDLE', currentTaskId: null, efficiency: 0.8, stats: { tasksCompleted: 0, ticksActive: 0 } },
    { id: 'w-03', name: 'Worker Gamma', status: 'IDLE', currentTaskId: null, efficiency: 1.0, stats: { tasksCompleted: 0, ticksActive: 0 } },
  ],
  stats: {
    ticks: 0,
    lastSave: new Date().toISOString()
  }
};

class Store {
  private state: AppState;

  constructor() {
    this.state = this.loadState();
    
    // Auto-save periodically or on important changes could be done here
    // For now we save on mutation
  }

  private loadState(): AppState {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with initial structure to ensure new fields exist if migrating
        return { ...INITIAL_STATE, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load state', e);
    }
    return JSON.parse(JSON.stringify(INITIAL_STATE));
  }

  private saveState() {
    try {
      this.state.stats.lastSave = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      eventBus.publish(EVENTS.STATE_CHANGED, this.state);
    } catch (e) {
      console.error('Failed to save state', e);
    }
  }

  getState() {
    return this.state;
  }

  // --- Actions ---

  incrementTick() {
    this.state.stats.ticks++;
    // We don't save on every tick to avoid performance hit, 
    // but we publish state change for UI
    eventBus.publish(EVENTS.STATE_CHANGED, this.state);
  }

  setConfig(config: SystemConfig) {
    this.state.config = config;
    this.addLog('WIZARD', 'success', `Configuration applied: ${config.profileName}`);
    this.saveState();
  }

  addWorkflow(name: string, type: WorkflowType, zone: Zone, origin: 'SV' | 'Wizard', meta: any = {}) {
    const newWf: Workflow = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      type,
      zone,
      status: 'planned',
      origin,
      progress: 0,
      meta,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.workflows = [newWf, ...this.state.workflows];
    this.addLog(origin, 'info', `New Workflow created: ${name}`);
    this.saveState();
  }

  updateWorkflow(id: string, updates: Partial<Workflow>) {
    this.state.workflows = this.state.workflows.map(w => 
      w.id === id ? { ...w, ...updates } : w
    );
    this.saveState();
  }

  getWorkflow(id: string) {
    return this.state.workflows.find(w => w.id === id);
  }

  addLog(source: string, type: LogEntry['type'], message: string) {
    const newLog: LogEntry = {
      id: Date.now().toString() + Math.random(),
      source,
      type,
      message,
      timestamp: new Date().toISOString(),
    };
    this.state.logs = [newLog, ...this.state.logs].slice(0, 100); // Keep last 100 logs
    
    // Also publish log specifically
    eventBus.publish(EVENTS.LOG_NEW, newLog);
    this.saveState();
  }

  clearLogs() {
    this.state.logs = [];
    this.state.workflows = []; // Reset workflows on full reset
    this.state.workers.forEach(w => {
        w.status = 'IDLE';
        w.currentTaskId = null;
        w.stats.tasksCompleted = 0;
    });
    this.saveState();
  }
}

export const store = new Store();
