import React from 'react';
import { SystemConfig } from '../types';
import { Database } from 'lucide-react';

interface ConfigViewProps {
  config: SystemConfig | null;
}

export const ConfigView: React.FC<ConfigViewProps> = ({ config }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
       <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
             <Database className="w-6 h-6 text-purple-400" />
             <h2 className="text-xl font-bold text-white">Current Configuration State</h2>
          </div>
          
          {!config ? (
            <div className="p-12 text-center text-slate-500 border-2 border-dashed border-slate-800 rounded">
               No configuration active. Please use the Wizard tab to generate a profile.
            </div>
          ) : (
            <div className="font-mono text-sm">
              <pre className="bg-slate-950 p-6 rounded-lg text-green-400 overflow-x-auto border border-slate-800 shadow-inner">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          )}
       </div>

       {config && (
         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 p-4 rounded border border-slate-800">
               <label className="text-xs uppercase text-slate-500 font-bold">Autonomy Rating</label>
               <div className="text-2xl text-white font-bold mt-1">Level {config.autonomyLevel}/5</div>
            </div>
            <div className="bg-slate-900 p-4 rounded border border-slate-800">
               <label className="text-xs uppercase text-slate-500 font-bold">Safety Protocol</label>
               <div className={`text-2xl font-bold mt-1 ${config.requireConfirmationForCritical ? 'text-green-400' : 'text-red-400'}`}>
                  {config.requireConfirmationForCritical ? 'STRICT' : 'PERMISSIVE'}
               </div>
            </div>
         </div>
       )}
    </div>
  );
};