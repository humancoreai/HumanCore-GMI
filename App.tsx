import React, { useState, useEffect } from 'react';
import { TabId, AppState, EVENTS } from './types';
import { LayoutDashboard, Wand2, Network, ScrollText, Settings, Shield, Zap, Pause, Play } from 'lucide-react';

// Core Architecture
import { store } from './lib/Store';
import { engine } from './lib/Engine';
import { eventBus } from './lib/EventBus';

// Components
import { Dashboard } from './components/Dashboard';
import { Wizard } from './components/Wizard';
import { WorkflowList } from './components/WorkflowList';
import { LogViewer } from './components/LogViewer';
import { ConfigView } from './components/ConfigView';
import { SupervisorChat } from './components/SupervisorChat';

const App: React.FC = () => {
  // --- State ---
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  
  // Use global store state
  const [appState, setAppState] = useState<AppState>(store.getState());
  const [simSpeed, setSimSpeed] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  // --- Initialization & Subscriptions ---
  useEffect(() => {
    // Start the engine
    engine.start();

    // Subscribe to state changes
    const unsubscribe = eventBus.subscribe(EVENTS.STATE_CHANGED, (newState: AppState) => {
      setAppState({ ...newState }); // spread to ensure new reference for React
    });

    return () => {
      unsubscribe();
      engine.stop();
    };
  }, []);

  // --- Actions Wrappers ---
  // These bridge the UI to the Logic Layer

  const handleConfigSave = (newConfig: any) => {
    store.setConfig(newConfig);
    setActiveTab('config');
  };

  const handleAddWorkflow = (name: string, type: any, zone: any, meta: any) => {
    store.addWorkflow(name, type, zone, 'SV', meta);
  };

  const handleAddLog = (source: string, type: any, message: string) => {
    store.addLog(source, type, message);
  };

  const handleClearLogs = () => {
    store.clearLogs();
    engine.syncWorkers(); // Reset worker instances
  };

  const togglePause = () => {
    if (isPaused) {
      engine.start();
      setIsPaused(false);
    } else {
      engine.stop();
      setIsPaused(true);
    }
  };

  const changeSpeed = (e: React.ChangeEvent<HTMLInputElement>) => {
    const s = parseInt(e.target.value);
    setSimSpeed(s);
    engine.setSpeed(s);
  };

  // --- Render Helpers ---

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard workflows={appState.workflows} logs={appState.logs} workers={appState.workers} />;
      case 'wizard':
        return <Wizard onSaveConfig={handleConfigSave} currentConfig={appState.config} />;
      case 'workflows':
        return <WorkflowList workflows={appState.workflows} />;
      case 'logs':
        return <LogViewer logs={appState.logs} />;
      case 'config':
        return <ConfigView config={appState.config} />;
      default:
        return <div>Not found</div>;
    }
  };

  const NavItem = ({ id, label, icon: Icon }: { id: TabId, label: string, icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-3 px-4 py-3 w-full rounded-lg transition-all ${
        activeTab === id 
          ? 'bg-cyan-900/40 text-cyan-400 border border-cyan-800' 
          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200">
      
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 flex flex-col p-4">
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">
          <Shield className="w-8 h-8 text-cyan-500" />
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">HumanCore</h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest">v1.1 Awakening</p>
          </div>
        </div>

        <nav className="space-y-2 flex-1">
          <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
          <NavItem id="wizard" label="Wizard" icon={Wand2} />
          <NavItem id="workflows" label="Workflows" icon={Network} />
          <NavItem id="logs" label="System Logs" icon={ScrollText} />
          <NavItem id="config" label="Configuration" icon={Settings} />
        </nav>

        {/* Engine Controls */}
        <div className="p-4 bg-slate-900 rounded border border-slate-800 mb-4">
           <div className="flex items-center justify-between mb-2">
             <span className="text-xs font-bold text-slate-400 uppercase">Engine Speed</span>
             <span className="text-xs font-mono text-cyan-400">x{simSpeed}</span>
           </div>
           <input 
             type="range" 
             min="1" 
             max="10" 
             value={simSpeed} 
             onChange={changeSpeed}
             className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
           />
           <div className="flex items-center justify-between mt-3">
              <div className="text-[10px] text-slate-500 font-mono">
                Tick: {appState.stats.ticks}
              </div>
              <button onClick={togglePause} className="text-slate-300 hover:text-white">
                {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
           </div>
        </div>

        <div className="p-4 bg-slate-900 rounded border border-slate-800">
          <div className="flex items-center gap-2 mb-2">
            <div className={`w-2 h-2 rounded-full ${isPaused ? 'bg-yellow-500' : 'bg-green-500 animate-pulse'}`}></div>
            <span className="text-xs font-bold text-green-500 uppercase">{isPaused ? 'PAUSED' : 'SYSTEM ONLINE'}</span>
          </div>
          <p className="text-[10px] text-slate-500">
            Workers: {appState.workers.length}<br/>
            Secure Environment
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-8 relative">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-light text-white capitalize">{activeTab}</h2>
            {isPaused && <span className="px-2 py-0.5 bg-yellow-900/50 border border-yellow-700 text-yellow-500 text-xs rounded uppercase font-bold">Simulation Paused</span>}
          </div>
          <div className="text-sm text-slate-500 font-mono">
            {new Date().toLocaleDateString()} | {new Date().toLocaleTimeString()}
          </div>
        </header>
        
        {renderContent()}
      </main>

      {/* Supervisor Chat Overlay */}
      <SupervisorChat 
        onAddWorkflow={handleAddWorkflow} 
        onAddLog={handleAddLog} 
        onClearLogs={handleClearLogs}
      />
    </div>
  );
};

export default App;
