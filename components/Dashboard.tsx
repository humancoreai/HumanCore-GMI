import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Workflow, LogEntry, WorkerState } from '../types';
import { Activity, ShieldCheck, AlertTriangle, Cpu, Users } from 'lucide-react';

interface DashboardProps {
  workflows: Workflow[];
  logs: LogEntry[];
  workers?: WorkerState[];
}

export const Dashboard: React.FC<DashboardProps> = ({ workflows, logs, workers = [] }) => {
  const activeWorkflows = workflows.filter(w => w.status === 'running').length;
  const criticalAlerts = logs.filter(l => l.type === 'error').length;
  const plannedWorkflows = workflows.filter(w => w.status === 'planned').length;
  const doneWorkflows = workflows.filter(w => w.status === 'done').length;

  // Transform worker data for the chart
  const data = workers.map(w => ({
    name: w.name.split(' ')[1] || w.name, // "Alpha" from "Worker Alpha"
    load: w.status === 'BUSY' ? 90 : w.status === 'COOLDOWN' ? 10 : 5,
    status: w.status
  }));

  const StatCard = ({ title, value, icon: Icon, colorClass }: any) => (
    <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg shadow-lg">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</p>
          <h3 className="text-3xl font-bold text-white mt-2">{value}</h3>
        </div>
        <div className={`p-3 rounded-full bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>
          <Icon className={`w-8 h-8 ${colorClass}`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Active Processes" 
          value={activeWorkflows} 
          icon={Activity} 
          colorClass="text-blue-400" 
        />
        <StatCard 
          title="System Alerts" 
          value={criticalAlerts} 
          icon={AlertTriangle} 
          colorClass="text-red-400" 
        />
        <StatCard 
          title="Pending Jobs" 
          value={plannedWorkflows} 
          icon={Cpu} 
          colorClass="text-yellow-400" 
        />
        <StatCard 
          title="Active Agents" 
          value={workers.length} 
          icon={Users} 
          colorClass="text-purple-400" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Agent Load Analysis
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b'}} />
                <YAxis stroke="#64748b" tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f1f5f9' }}
                  itemStyle={{ color: '#f1f5f9' }}
                  cursor={{fill: '#1e293b'}}
                />
                <Bar dataKey="load" radius={[4, 4, 0, 0]}>
                  {data.map((entry, index) => (
                    <Cell 
                        key={`cell-${index}`} 
                        fill={entry.status === 'BUSY' ? '#0ea5e9' : entry.status === 'COOLDOWN' ? '#eab308' : '#334155'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Agent Network</h3>
          <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
             {workers.map(w => (
                 <div key={w.id} className="p-3 bg-slate-800/50 rounded border border-slate-700 flex justify-between items-center">
                    <div>
                        <div className="text-sm font-bold text-white">{w.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">ID: {w.id} | Eff: {w.efficiency}x</div>
                    </div>
                    <div className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                        w.status === 'BUSY' ? 'bg-blue-900 text-blue-300' :
                        w.status === 'IDLE' ? 'bg-slate-700 text-slate-400' :
                        'bg-yellow-900 text-yellow-300'
                    }`}>
                        {w.status}
                    </div>
                 </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};
