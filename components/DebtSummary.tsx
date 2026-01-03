
import React from 'react';
import { DebtBreakdown } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface Props {
  breakdown: DebtBreakdown;
}

const DebtSummary: React.FC<Props> = ({ breakdown }) => {
  const data = [
    { name: 'Valor Negociado', value: breakdown.negotiatedAmount, color: '#10b981' },
    { name: 'Saldo Remanescente', value: (breakdown.totalBalance - breakdown.negotiatedAmount), color: '#3b82f6' },
  ];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4">Composição do Saldo MBRF</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-slate-50 rounded-lg border-l-4 border-slate-400">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Saldo Total Bruto</p>
            <p className="text-xl font-black text-slate-900">{formatCurrency(breakdown.totalBalance)}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg border-l-4 border-emerald-500">
            <p className="text-[10px] text-emerald-600 font-bold uppercase">(-) Negociação Aplicada</p>
            <p className="text-xl font-black text-emerald-700">{formatCurrency(breakdown.negotiatedAmount)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebtSummary;
