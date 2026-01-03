
import React from 'react';
import { DebtBreakdown } from '../types';

interface Props {
  alerts: DebtBreakdown[];
  onSelectEmployee: (emp: DebtBreakdown) => void;
  isOpen: boolean;
  onClose: () => void;
}

const NotificationCenter: React.FC<Props> = ({ alerts, onSelectEmployee, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute top-16 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 z-[100] animate-in fade-in zoom-in-95 duration-200">
      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-2xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-800 flex items-center gap-2">
          <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          Alertas Críticos
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto p-2">
        {alerts.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nenhum vencimento próximo</p>
          </div>
        ) : (
          <div className="space-y-1">
            {alerts.map((emp) => (
              <button
                key={emp.id}
                onClick={() => {
                  onSelectEmployee(emp);
                  onClose();
                }}
                className="w-full text-left p-3 hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 group"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[11px] font-bold text-slate-800 truncate block max-w-[150px]">{emp.employeeName}</span>
                  <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded uppercase">Vence em {emp.dueDate}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[9px] text-slate-400 font-medium">Ticket: {emp.ticketNumber}</span>
                  <span className="text-[9px] text-blue-500 font-bold group-hover:underline">Ver detalhes →</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 border-t border-slate-100 rounded-b-2xl text-center">
        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Monitoramento Saldo Devedor MBRF</p>
      </div>
    </div>
  );
};

export default NotificationCenter;
