
import React, { useState, useMemo } from 'react';
import { DebtBreakdown } from '../types';

interface Props {
  alerts: DebtBreakdown[];
  onSelectEmployee: (emp: DebtBreakdown) => void;
  isOpen: boolean;
  onClose: () => void;
}

const LOGO_URL = "https://i.imgur.com/M2385CF.png";

const NotificationCenter: React.FC<Props> = ({ alerts, onSelectEmployee, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'todos' | 'criticos' | 'avisos'>('todos');

  const stats = useMemo(() => ({
    total: alerts.length,
    criticos: alerts.filter(a => a.status === 'atraso').length,
    avisos: alerts.filter(a => a.status === 'pendente_baixa').length
  }), [alerts]);

  const filteredAlerts = useMemo(() => {
    if (activeTab === 'criticos') return alerts.filter(a => a.status === 'atraso');
    if (activeTab === 'avisos') return alerts.filter(a => a.status === 'pendente_baixa');
    return alerts;
  }, [alerts, activeTab]);

  if (!isOpen) return null;

  return (
    <div className="absolute top-20 right-6 w-[440px] bg-white/95 backdrop-blur-2xl rounded-[3rem] shadow-[0_50px_100px_rgba(15,23,42,0.3)] border border-slate-200 z-[100] animate-in fade-in slide-in-from-top-4 duration-300 flex flex-col overflow-hidden">
      {/* Dynamic Header */}
      <div className="p-8 border-b border-slate-100 bg-slate-50/80">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.25em] text-slate-800 flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${stats.criticos > 0 ? 'bg-red-400' : 'bg-blue-400'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-3 w-3 ${stats.criticos > 0 ? 'bg-red-600' : 'bg-blue-600'}`}></span>
              </span>
              Radar de Riscos
            </h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status de Auditoria MBRF</p>
          </div>
          <button onClick={onClose} className="hover:bg-slate-200/50 p-2.5 rounded-2xl transition-all text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Tab Selection with Severity Highlights */}
        <div className="flex bg-slate-200/60 p-1.5 rounded-[1.5rem] border border-slate-200/50">
          <button 
            onClick={() => setActiveTab('todos')}
            className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'todos' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Todos ({stats.total})
          </button>
          <button 
            onClick={() => setActiveTab('criticos')}
            className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'criticos' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-red-500'}`}
          >
            Críticos ({stats.criticos})
          </button>
          <button 
            onClick={() => setActiveTab('avisos')}
            className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all ${activeTab === 'avisos' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-500 hover:text-amber-500'}`}
          >
            Pendentes ({stats.avisos})
          </button>
        </div>
      </div>

      {/* Main Alerts List */}
      <div className="max-h-[520px] overflow-y-auto p-6 space-y-4 custom-scrollbar bg-white">
        {filteredAlerts.length === 0 ? (
          <div className="py-24 text-center">
            <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-dashed border-slate-100">
               <svg className="w-12 h-12 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.2em]">Sem Alertas Ativos</p>
            <p className="text-[9px] text-slate-400 mt-2 font-medium">Sua base de dados está em conformidade.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAlerts.map((emp) => (
              <button
                key={emp.id}
                onClick={() => onSelectEmployee(emp)}
                className={`w-full text-left p-6 rounded-[2rem] transition-all group border-2 relative overflow-hidden flex gap-5 ${
                  emp.status === 'atraso' 
                    ? 'bg-red-50/40 border-red-100 hover:border-red-400 hover:bg-red-50' 
                    : 'bg-amber-50/40 border-amber-100 hover:border-amber-400 hover:bg-amber-50'
                }`}
              >
                {/* Visual Severity Indicator */}
                <div className={`flex-shrink-0 w-14 h-14 rounded-[1.25rem] flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                  emp.status === 'atraso' ? 'bg-red-600 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {emp.status === 'atraso' ? (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  ) : (
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  )}
                </div>

                {/* Data Column */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight truncate">{emp.employeeName}</h4>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-0.5">#{emp.ticketNumber} &bull; ID {emp.employeeId}</p>
                    </div>
                    <span className={`text-[8px] font-black px-2 py-1 rounded-xl uppercase border shadow-sm ${
                      emp.status === 'atraso' ? 'bg-red-600 text-white border-red-700' : 'bg-amber-500 text-white border-amber-600'
                    }`}>
                      {emp.status === 'atraso' ? 'CRÍTICO' : 'ATENÇÃO'}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-end border-t border-slate-100 pt-3">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Ação Vencendo em</p>
                      <p className={`text-xs font-black ${emp.status === 'atraso' ? 'text-red-600' : 'text-slate-800'}`}>
                        {emp.dueDate}
                      </p>
                    </div>
                    <div className="bg-slate-900 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest group-hover:bg-blue-600 transition-colors shadow-lg">
                       Auditar
                    </div>
                  </div>
                </div>

                {/* Subtle Brand Watermark */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity pointer-events-none">
                   <img src={LOGO_URL} className="w-20 grayscale" alt="mbrf branding" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actionable Footer */}
      <div className="p-6 bg-slate-900 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em]">Sincronização em Tempo Real</p>
        </div>
        <button 
          onClick={onClose}
          className="text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-white transition-all border border-blue-400/20 hover:border-white/50 px-6 py-2 rounded-xl"
        >
          Limpar Vista de Auditoria
        </button>
      </div>
    </div>
  );
};

export default NotificationCenter;
