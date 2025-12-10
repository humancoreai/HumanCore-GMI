import React from 'react';
import { Workflow, Zone, WorkflowStatus } from '../types';
import { FileText, Play, CheckCircle, Clock, AlertOctagon, User } from 'lucide-react';

interface WorkflowListProps {
  workflows: Workflow[];
}

export const WorkflowList: React.FC<WorkflowListProps> = ({ workflows }) => {
  const getZoneBadge = (zone: Zone) => {
    switch (zone) {
      case 'red': return <span className="px-2 py-1 rounded text-xs font-bold bg-red-900/50 text-red-400 border border-red-900">RED ZONE</span>;
      case 'yellow': return <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-900/50 text-yellow-400 border border-yellow-900">YELLOW ZONE</span>;
      case 'green': return <span className="px-2 py-1 rounded text-xs font-bold bg-green-900/50 text-green-400 border border-green-900">GREEN ZONE</span>;
    }
  };

  const getStatusIcon = (status: WorkflowStatus) => {
    switch (status) {
      case 'running': return <Play className="w-4 h-4 text-blue-400 animate-pulse" />;
      case 'done': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'waiting': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'planned': return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden shadow-lg">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
        <h3 className="font-semibold text-slate-100">Active Workflows</h3>
        <span className="text-xs text-slate-500 font-mono">Total: {workflows.length}</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-300">
          <thead className="text-xs text-slate-500 uppercase bg-slate-950 border-b border-slate-800">
            <tr>
              <th scope="col" className="px-6 py-3">ID</th>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Type</th>
              <th scope="col" className="px-6 py-3">Zone</th>
              <th scope="col" className="px-6 py-3">Progress</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3 text-right">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {workflows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-slate-500 italic">
                  No active workflows found. Use the Supervisor Chat or Wizard to create one.
                </td>
              </tr>
            ) : (
              workflows.map((wf) => (
                <tr key={wf.id} className="bg-slate-900 hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-slate-500">{wf.id.substring(0, 8)}</td>
                  <td className="px-6 py-4 font-medium text-white">
                    {wf.name}
                    {wf.assignedTo && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
                            <User className="w-3 h-3" /> {wf.assignedTo}
                        </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2">
                       {wf.type === 'document' ? <FileText className="w-3 h-3"/> : <AlertOctagon className="w-3 h-3"/>}
                       {wf.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getZoneBadge(wf.zone)}</td>
                  <td className="px-6 py-4 min-w-[150px]">
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div 
                            className={`h-2 rounded-full transition-all duration-500 ${wf.status === 'done' ? 'bg-green-500' : 'bg-blue-500'}`} 
                            style={{ width: `${wf.progress || 0}%` }}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 block text-right mt-1">{Math.round(wf.progress || 0)}%</span>
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2 uppercase text-xs font-bold tracking-wider">
                    {getStatusIcon(wf.status)}
                    {wf.status}
                  </td>
                  <td className="px-6 py-4 text-right text-slate-500 font-mono text-xs">
                    {new Date(wf.createdAt).toLocaleTimeString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
