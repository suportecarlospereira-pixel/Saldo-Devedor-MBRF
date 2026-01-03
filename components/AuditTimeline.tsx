
import React from 'react';
import { AuditEntry } from '../types';

interface Props {
  history: AuditEntry[];
}

const AuditTimeline: React.FC<Props> = ({ history }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case 'status_change': return <div className="bg-blue-100 text-blue-600 p-1.5 rounded-full"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></div>;
      case 'payment_added': return <div className="bg-emerald-100 text-emerald-600 p-1.5 rounded-full"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
      case 'negotiation_started': return <div className="bg-purple-100 text-purple-600 p-1.5 rounded-full"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>;
      default: return <div className="bg-slate-100 text-slate-600 p-1.5 rounded-full"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200">
        <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Tópico 4: Trilha de Auditoria</h2>
      </div>
      <div className="p-6">
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100"></div>
          <div className="space-y-6">
            {history.length > 0 ? history.map((entry) => (
              <div key={entry.id} className="relative flex items-start gap-4 pl-0.5">
                <div className="z-10">{getIcon(entry.event)}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-0.5">
                    <p className="text-[10px] font-bold text-slate-800 uppercase tracking-tight">{entry.description}</p>
                    <span className="text-[8px] font-black text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                      {new Date(entry.timestamp).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-[9px] text-slate-500 italic">Usuário: {entry.user}</p>
                </div>
              </div>
            )) : (
              <p className="text-[10px] text-slate-400 italic text-center py-4">Nenhum evento registrado no histórico.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditTimeline;
