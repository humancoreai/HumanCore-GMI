import { WorkerState, Workflow, EVENTS } from '../types';
import { store } from './Store';
import { eventBus } from './EventBus';

export class AgentWorker {
  state: WorkerState;

  constructor(state: WorkerState) {
    this.state = state;
  }

  // Called every tick by the Engine
  think(workflows: Workflow[]) {
    // If offline, do nothing
    if (this.state.status === 'OFFLINE') return;

    this.state.stats.ticksActive++;

    // State Machine
    switch (this.state.status) {
      case 'IDLE':
        this.lookForWork(workflows);
        break;
      case 'BUSY':
        this.work();
        break;
      case 'COOLDOWN':
        this.rest();
        break;
    }
  }

  private lookForWork(workflows: Workflow[]) {
    // Find a planned workflow
    // Logic: Simple queue - take first 'planned' task
    // V1.1 Enhancement: Check autonomy level? For now, just grab work.
    
    const task = workflows.find(w => w.status === 'planned');
    if (task) {
      this.assignTask(task);
    }
  }

  private assignTask(task: Workflow) {
    this.state.status = 'BUSY';
    this.state.currentTaskId = task.id;
    
    // Update Workflow in Store (this is a bit direct, strictly should be an action)
    store.updateWorkflow(task.id, { 
      status: 'running', 
      assignedTo: this.state.id,
      updatedAt: new Date().toISOString()
    });

    eventBus.publish(EVENTS.LOG_NEW, {
      source: this.state.name,
      type: 'info',
      message: `Accepted task: ${task.name}`
    });
  }

  private work() {
    if (!this.state.currentTaskId) {
      this.state.status = 'IDLE';
      return;
    }

    const workflow = store.getWorkflow(this.state.currentTaskId);
    if (!workflow || workflow.status !== 'running') {
      // Task vanished or cancelled
      this.state.status = 'IDLE';
      this.state.currentTaskId = null;
      return;
    }

    // Simulate progress
    // Base speed 2% per tick * efficiency
    const progressIncrement = 2 * this.state.efficiency;
    const newProgress = Math.min((workflow.progress || 0) + progressIncrement, 100);

    store.updateWorkflow(workflow.id, { progress: newProgress });

    if (newProgress >= 100) {
      this.completeTask(workflow);
    }
  }

  private completeTask(workflow: Workflow) {
    store.updateWorkflow(workflow.id, { 
      status: 'done', 
      progress: 100,
      updatedAt: new Date().toISOString()
    });
    
    this.state.stats.tasksCompleted++;
    this.state.status = 'COOLDOWN';
    this.state.currentTaskId = null;

    eventBus.publish(EVENTS.LOG_NEW, {
      source: this.state.name,
      type: 'success',
      message: `Completed task: ${workflow.name}`
    });
  }

  private rest() {
    // 5% chance to recover per tick
    if (Math.random() > 0.90) {
      this.state.status = 'IDLE';
    }
  }
}
