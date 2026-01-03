
import React, { useState, useEffect } from 'react';
import { DebtBreakdown } from '../types';

interface Props {
  data: DebtBreakdown;
}

const Calculator: React.FC<Props> = ({ data }) => {
  const [total, setTotal] = useState(data.totalBalance);
  const [neg, setNeg] = useState(data.negotiatedAmount);
  const [paid, setPaid] = useState(data.unprocessedPayment);
  
  const result = (total - neg) - paid;

  const format = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  return (
    <div className="bg-slate-900 text-white p-5 rounded-xl shadow-xl border border-slate-700">
      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
        Calculadora de Auditoria MBRF
      </h3>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-slate-400">Saldo Devedor Total</label>
          <input type="number" value={total} onChange={e => setTotal(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
        </div>
        <div className="text-center text-slate-500 font-bold">-</div>
        <div>
          <label className="text-xs text-slate-400">Valor Negociação</label>
          <input type="number" value={neg} onChange={e => setNeg(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
        </div>
        <div className="text-center text-slate-500 font-bold">-</div>
        <div>
          <label className="text-xs text-slate-400">Pagamento (Sem Baixa)</label>
          <input type="number" value={paid} onChange={e => setPaid(Number(e.target.value))} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none" />
        </div>
        
        <div className="pt-4 border-t border-slate-700 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-400">Saldo Restante:</span>
            <span className={`text-xl font-black ${result <= 0 ? 'text-green-400' : 'text-orange-400'}`}>
              {format(result)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
