
import React from 'react';
import { DebtBreakdown, AnalyticsData } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

interface Props {
  data: DebtBreakdown[];
}

const AnalyticsDashboard: React.FC<Props> = ({ data }) => {
  const analytics = React.useMemo(() => {
    const initial: AnalyticsData = {
      totalDebtVolume: 0,
      totalNegotiatedVolume: 0,
      totalPaidVolume: 0,
      pendingWriteOffs: 0,
      statusDistribution: { pago: 0, pendente_baixa: 0, atraso: 0 }
    };

    return data.reduce((acc, curr) => {
      acc.totalDebtVolume += curr.totalBalance;
      acc.totalNegotiatedVolume += curr.negotiatedAmount;
      acc.totalPaidVolume += (curr.status === 'pago' ? curr.negotiatedAmount : 0);
      acc.pendingWriteOffs += curr.unprocessedPayment;
      acc.statusDistribution[curr.status]++;
      return acc;
    }, initial);
  }, [data]);

  const pieData = [
    { name: 'Pago', value: analytics.statusDistribution.pago, color: '#10b981' },
    { name: 'Pendente Baixa', value: analytics.statusDistribution.pendente_baixa, color: '#f59e0b' },
    { name: 'Em Atraso', value: analytics.statusDistribution.atraso, color: '#ef4444' },
  ];

  const barData = [
    { name: 'Volume Total', valor: analytics.totalDebtVolume },
    { name: 'Negociado', valor: analytics.totalNegotiatedVolume },
    { name: 'Baixas Pendentes', valor: analytics.pendingWriteOffs },
  ];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Volume Total em Aberto', value: formatCurrency(analytics.totalDebtVolume), color: 'text-slate-800' },
          { label: 'Total Negociado', value: formatCurrency(analytics.totalNegotiatedVolume), color: 'text-blue-600' },
          { label: 'Pagamentos s/ Baixa', value: formatCurrency(analytics.pendingWriteOffs), color: 'text-amber-600' },
          { label: 'Taxa de Inadimplência', value: `${((analytics.statusDistribution.atraso / data.length) * 100).toFixed(1)}%`, color: 'text-red-600' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{card.label}</p>
            <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Comparativo de Volumes</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? '#3b82f6' : index === 2 ? '#f59e0b' : '#1e293b'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-sm font-bold text-slate-800 mb-6 uppercase tracking-wider">Distribuição por Status</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {pieData.map(d => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}}></div>
                <span className="text-[10px] font-bold text-slate-500 uppercase">{d.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
