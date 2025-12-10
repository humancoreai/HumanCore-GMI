import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, WorkflowType, Zone } from '../types';
import { Send, Bot, User, Paperclip, Minimize2, Maximize2 } from 'lucide-react';

interface SupervisorChatProps {
  onAddWorkflow: (name: string, type: WorkflowType, zone: Zone, meta?: any) => void;
  onAddLog: (source: string, type: 'info' | 'warning' | 'error' | 'success', message: string) => void;
  onClearLogs: () => void;
}

export const SupervisorChat: React.FC<SupervisorChatProps> = ({ onAddWorkflow, onAddLog, onClearLogs }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'supervisor',
      text: 'HumanCore Supervisor online. Waiting for commands. (Try "help", "workflow", "behörde")',
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const addMessage = (sender: 'user' | 'supervisor', text: string, type: 'text'|'alert'|'success' = 'text') => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender,
      text,
      type,
      timestamp: new Date()
    }]);
  };

  const processCommand = (text: string) => {
    const lower = text.toLowerCase().trim();

    if (lower === 'help') {
      addMessage('supervisor', 'Commands available: "workflow [name]", "bericht", "behörde" (alert), "reset" (clear chat/logs), "auslastung". Drag & drop simulated by paperclip.');
      return;
    }

    if (lower === 'reset') {
      setMessages([{ id: Date.now().toString(), sender: 'supervisor', text: 'System reset initiated.', timestamp: new Date() }]);
      onClearLogs();
      onAddLog('SV', 'warning', 'User requested full reset');
      return;
    }

    if (lower.startsWith('workflow ') || lower === 'workflow' || lower === 'bericht') {
      const name = lower.replace('workflow', '').trim() || `Auto-Task-${Math.floor(Math.random() * 1000)}`;
      onAddWorkflow(name, 'generic', 'yellow');
      onAddLog('SV', 'success', `Supervisor created workflow: ${name}`);
      addMessage('supervisor', `Workflow "${name}" initiated (Yellow Zone).`, 'success');
      return;
    }

    if (lower.includes('behörde') || lower.includes('finanz')) {
      onAddLog('SV', 'error', 'CRITICAL KEYWORD DETECTED');
      onAddWorkflow('Audit-Protocol', 'document', 'red');
      addMessage('supervisor', 'ALERT: Critical keyword detected. Red Zone protocol initiated.', 'alert');
      return;
    }

    if (lower === 'auslastung') {
      addMessage('supervisor', `Current System Load: ${Math.floor(Math.random() * 40) + 40}% (Simulated)`);
      return;
    }

    addMessage('supervisor', "Command not recognized. I am a demo agent, my capabilities are limited.");
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    addMessage('user', inputValue);
    const text = inputValue;
    setInputValue('');
    
    // Simulate thinking delay
    setTimeout(() => {
      processCommand(text);
    }, 600);
  };

  const handleSimulatedUpload = () => {
    addMessage('user', 'Uploaded: confidential_doc.pdf');
    setTimeout(() => {
        onAddWorkflow('Doc-Analysis', 'document', 'green', { file: 'confidential_doc.pdf' });
        onAddLog('SV', 'info', 'Document received via chat');
        addMessage('supervisor', 'Document received. Workflow started (Green Zone).', 'success');
    }, 500);
  };

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-4 right-4 bg-cyan-600 text-white p-4 rounded-full shadow-lg hover:bg-cyan-500 transition-all z-50 flex items-center gap-2"
      >
        <Bot className="w-6 h-6" />
        <span className="font-bold">Supervisor</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden max-h-[600px] animate-slide-up">
      {/* Header */}
      <div className="bg-slate-800 p-3 border-b border-slate-700 flex justify-between items-center cursor-pointer" onClick={() => setIsMinimized(true)}>
        <div className="flex items-center gap-2 text-cyan-400 font-bold">
          <Bot className="w-5 h-5" />
          <span>Supervisor Agent</span>
        </div>
        <Minimize2 className="w-4 h-4 text-slate-400 hover:text-white" />
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-900/90 h-[400px]">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] rounded-lg p-3 text-sm ${
                msg.sender === 'user' 
                  ? 'bg-slate-700 text-white rounded-br-none' 
                  : msg.type === 'alert' ? 'bg-red-900/60 border border-red-700 text-red-200 rounded-bl-none'
                  : msg.type === 'success' ? 'bg-green-900/60 border border-green-700 text-green-200 rounded-bl-none'
                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-slate-800 border-t border-slate-700 flex gap-2">
        <button 
          type="button" 
          onClick={handleSimulatedUpload}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"
          title="Simulate File Upload"
        >
            <Paperclip className="w-4 h-4" />
        </button>
        <input 
          type="text" 
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Command..." 
          className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-1 text-sm text-white focus:outline-none focus:border-cyan-500"
        />
        <button 
          type="submit"
          className="p-2 bg-cyan-600 text-white rounded hover:bg-cyan-500"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};