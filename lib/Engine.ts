import { store } from './Store';
import { AgentWorker } from './AgentWorker';
import { eventBus } from './EventBus';
import { EVENTS } from '../types';

class Engine {
  private intervalId: number | null = null;
  private tickRate: number = 1000;
  private isRunning: boolean = false;
  private workers: AgentWorker[] = [];

  constructor() {
    // Initialize workers from store state
    this.syncWorkers();
  }

  syncWorkers() {
    // Re-instantiate worker logic classes based on current store state
    const workerStates = store.getState().workers;
    this.workers = workerStates.map(state => new AgentWorker(state));
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    
    // Initial Tick
    this.loop();
    
    // Start Loop
    this.intervalId = window.setInterval(() => this.loop(), this.tickRate);
    eventBus.publish(EVENTS.CORE_INIT);
    store.addLog('CORE', 'success', 'Engine started. Heartbeat active.');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    store.addLog('CORE', 'warning', 'Engine stopped.');
  }

  setSpeed(speedMultiplier: number) {
    // Speed 1 = 1000ms, Speed 5 = 200ms
    this.tickRate = 1000 / speedMultiplier;
    if (this.isRunning) {
        this.stop();
        this.start();
    }
  }

  private loop() {
    try {
      // 1. Tick Store (updates stats, emits events)
      store.incrementTick();
      eventBus.publish(EVENTS.TICK);

      // 2. Run Workers
      // We pass a snapshot of workflows to avoid direct mutation issues during iteration,
      // though JS is single threaded so it's mostly fine.
      const workflows = store.getState().workflows;
      
      this.workers.forEach(worker => {
        worker.think(workflows);
      });

    } catch (error) {
      console.error("Engine Crash:", error);
      store.addLog('CORE', 'error', 'Engine Loop Exception Recovered.');
    }
  }
}

export const engine = new Engine();
