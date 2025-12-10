import React from 'react';
import { LogEntry } from '../types';
import { Terminal } from 'lucide-react';

interface LogViewerProps {
  logs: LogEntry[];
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      case 'success': return 'text-green-400';
      default: return 'text-blue-300';
    }
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-lg shadow-xl flex flex-col h-[calc(100vh-200px)]">
      <div className="flex items-center gap-2 p-3 border-b border-slate-800 bg-slate-900 text-slate-400 text-sm font-mono">
        <Terminal className="w-4 h-4" />
        <span>System Logs</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1">
        {logs.length === 0 && (
          <div className="text-slate-600 italic">No logs generated yet...</div>
        )}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-3 hover:bg-slate-900 p-1 rounded transition-colors">
            <span className="text-slate-600 min-w-[140px]">
              [{new Date(log.timestamp).toISOString()}]
            </span>
            <span className={`font-bold uppercase min-w-[60px] ${getLogColor(log.type)}`}>
              {log.type}
            </span>
            <span className="text-slate-400 min-w-[80px]">
              {log.source}:
            </span>
            <span className="text-slate-300">
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};