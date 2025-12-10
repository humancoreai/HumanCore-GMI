import React, { useState } from 'react';
import { SystemConfig } from '../types';
import { Settings, Save, RefreshCw } from 'lucide-react';

interface WizardProps {
  onSaveConfig: (config: SystemConfig) => void;
  currentConfig: SystemConfig | null;
}

export const Wizard: React.FC<WizardProps> = ({ onSaveConfig, currentConfig }) => {
  const [profileName, setProfileName] = useState('Standard Profile');
  const [autonomyLevel, setAutonomyLevel] = useState(1);
  const [confirmCritical, setConfirmCritical] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const newConfig: SystemConfig = {
      profileName,
      autonomyLevel,
      requireConfirmationForCritical: confirmCritical,
      generatedAt: new Date().toISOString(),
    };
    onSaveConfig(newConfig);
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-lg p-8 shadow-xl">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
        <Settings className="w-8 h-8 text-cyan-400" />
        <div>
          <h2 className="text-2xl font-bold text-white">System Configuration Wizard</h2>
          <p className="text-slate-400 text-sm">Create and apply a new behavioral profile for the multi-agent system.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-slate-300 text-sm font-bold mb-2">Profile Name</label>
          <input
            type="text"
            value={profileName}
            onChange={(e) => setProfileName(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded p-3 text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
            placeholder="e.g., High Security Ops"
          />
        </div>

        <div>
          <label className="block text-slate-300 text-sm font-bold mb-2">
            Autonomy Level (1-5)
          </label>
          <div className="flex items-center gap-4">
             <input
              type="range"
              min="1"
              max="5"
              value={autonomyLevel}
              onChange={(e) => setAutonomyLevel(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <span className="bg-slate-800 border border-slate-700 px-4 py-2 rounded text-cyan-400 font-mono font-bold">
              Lvl {autonomyLevel}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Level 1: Full Human Control | Level 5: Full Autonomous Operation
          </p>
        </div>

        <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded border border-slate-700">
          <input
            type="checkbox"
            checked={confirmCritical}
            onChange={(e) => setConfirmCritical(e.target.checked)}
            className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-cyan-500 focus:ring-cyan-500"
          />
          <div>
            <span className="text-slate-200 font-medium">Require Confirmation for Critical Actions</span>
            <p className="text-xs text-slate-500">Red zone workflows will require manual approval.</p>
          </div>
        </div>

        <div className="pt-4 flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded transition flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20"
          >
            <Save className="w-5 h-5" />
            Apply Configuration
          </button>
        </div>
      </form>
    </div>
  );
};