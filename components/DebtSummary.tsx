
import React from 'react';
import { DebtBreakdown } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface Props {
  breakdown: DebtBreakdown;
}

const DebtSummary: React.FC<Props> = ({ breakdown }) => {
  const data = [
    { name: 'Valor a Pagar', value: breakdown.negotiatedAmount, color: '#3b82f6' },
    { name: 'Saldo Liquidado', value: (breakdown.totalBalance - breakdown.negotiatedAmount), color: '#10b981' },
  ];

  const progress = Math.min(100, Math.round(((breakdown.totalBalance - breakdown.negotiatedAmount) / breakdown.totalBalance) * 100));

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="bg-white rounded-[2rem] shadow-sm p-8 border border-slate-100">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Status da Dívida</h3>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Resumo de Amortização MBRF</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-emerald-600">{progress}%</p>
          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Liquidado</p>
        </div>
      </div>

      <div className="w-full h-4 bg-slate-100 rounded-full mb-10 overflow-hidden flex">
        <div 
          className="h-full bg-emerald-500 transition-all duration-1000 ease-out shadow-[0_0_20px_rgba(16,185,129,0.4)]" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={8}
                dataKey="value"
                animationDuration={1500}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] text-slate-400 font-black uppercase">Valor de Quitação</p>
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            </div>
            <p className="text-2xl font-black text-slate-800">{formatCurrency(breakdown.negotiatedAmount)}</p>
            <p className="text-[9px] text-slate-400 italic">Total restante para encerrar o ticket.</p>
          </div>
          <div className="p-5 bg-emerald-50/50 rounded-[1.5rem] border border-emerald-100 transition-all hover:shadow-md">
            <div className="flex justify-between items-center mb-1">
              <p className="text-[10px] text-emerald-600 font-black uppercase">Volume Amortizado</p>
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            </div>
            <p className="text-2xl font-black text-emerald-700">{formatCurrency(breakdown.totalBalance - breakdown.negotiatedAmount)}</p>
            <p className="text-[9px] text-emerald-600/60 italic">Valor já abatido da dívida bruta.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtSummary;
