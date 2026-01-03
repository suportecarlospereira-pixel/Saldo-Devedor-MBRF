
import React, { useState } from 'react';
import { DebtBreakdown, PaymentHistoryItem, PaymentType } from '../types';

interface Props {
  breakdown: DebtBreakdown;
  onAddPayment: (amount: number, date: string, type: PaymentType) => void;
}

const PaymentHistory: React.FC<Props> = ({ breakdown, onAddPayment }) => {
  const [newAmount, setNewAmount] = useState<string>('');
  const [newDate, setNewDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [newType, setNewType] = useState<PaymentType>('negociacao');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || isNaN(Number(newAmount))) return;
    onAddPayment(Number(newAmount), newDate, newType);
    setNewAmount('');
  };

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  const exportHistoryToCSV = () => {
    if (!breakdown.payments || breakdown.payments.length === 0) {
      alert("Não há histórico de pagamentos para exportar.");
      return;
    }

    const formatDate = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-');
      if (!year || !month || !day) {
        const parts = dateStr.split('/');
        if (parts.length === 3) return dateStr;
        return dateStr;
      }
      return `${day}/${month}/${year}`;
    };

    // Cabeçalho detalhado incluindo tipo para separação em planilhas
    const headers = ["Colaborador", "ID MBRF", "Chamado", "ID Pagamento", "Data Lancamento", "Valor (BRL)", "Categoria", "Status", "Metodo"];
    const rows = breakdown.payments.map(p => [
      `"${breakdown.employeeName}"`,
      `"${breakdown.employeeId}"`,
      `"${breakdown.ticketNumber}"`,
      `"${p.id}"`,
      `"${formatDate(p.date)}"`,
      p.amount,
      `"${p.type === 'negociacao' ? 'Efetivo Negociação' : 'Amortização Saldo Devedor'}"`,
      `"${p.status}"`,
      `"${p.method || 'N/A'}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    
    const safeName = breakdown.employeeName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, '_');
    
    link.setAttribute("href", url);
    link.setAttribute("download", `historico_mbrf_${safeName}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
           <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
           <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Tópico 3: Histórico de Pagamentos</h2>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportHistoryToCSV}
            title="Baixar histórico detalhado em CSV com separação por tipo"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-[9px] font-black uppercase tracking-wider text-slate-600 hover:bg-white hover:text-blue-600 hover:border-blue-300 transition-all shadow-sm active:scale-95"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Exportar CSV Detalhado
          </button>
          <span className="hidden sm:block text-[10px] font-bold text-slate-400 uppercase tracking-widest border-l border-slate-200 pl-3">Auditoria Financeira</span>
        </div>
      </div>
      
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulário de Registro */}
        <div className="lg:col-span-1 border-r border-slate-100 pr-0 lg:pr-8">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-wider">Registrar Novo Pagamento</h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Tipo de Lançamento</label>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setNewType('negociacao')}
                  className={`flex-1 text-[9px] font-black uppercase py-1.5 rounded-lg transition-all ${newType === 'negociacao' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'}`}
                >
                  Negociação
                </button>
                <button 
                  type="button"
                  onClick={() => setNewType('saldo_devedor')}
                  className={`flex-1 text-[9px] font-black uppercase py-1.5 rounded-lg transition-all ${newType === 'saldo_devedor' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
                >
                  Saldo Devedor
                </button>
              </div>
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Valor do Pagamento</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">R$</span>
                <input 
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  value={newAmount}
                  onChange={e => setNewAmount(e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-[9px] font-bold text-slate-500 uppercase mb-1 block">Data do Comprovante</label>
              <input 
                type="date"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                value={newDate}
                onChange={e => setNewDate(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[#0f172a] hover:bg-slate-800 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-[0.98]"
            >
              Registrar Lançamento
            </button>
          </form>
        </div>

        {/* Listagem de Histórico */}
        <div className="lg:col-span-2">
          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-4 tracking-wider">Últimos Lançamentos</h4>
          <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {breakdown.payments && breakdown.payments.length > 0 ? (
              breakdown.payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-100 hover:border-slate-200 transition-all group">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${payment.status === 'confirmado' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-black text-slate-800">{formatCurrency(payment.amount)}</p>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border ${payment.type === 'negociacao' ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                          {payment.type === 'negociacao' ? 'NEGOCIAÇÃO' : 'SALDO'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tight">
                        {payment.date.includes('-') ? payment.date.split('-').reverse().join('/') : payment.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[8px] font-black uppercase px-2 py-1 rounded-md shadow-sm ${payment.status === 'confirmado' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                      {payment.status}
                    </span>
                    <p className="text-[9px] text-slate-300 mt-1 font-mono">#{payment.id.split('-').pop()}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-slate-300 border-2 border-dashed border-slate-100 rounded-2xl">
                <svg className="w-10 h-10 mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Nenhum pagamento registrado</p>
              </div>
            )}
          </div>
          
          {/* Footer Informativo */}
          <div className="mt-6 p-4 bg-blue-50/50 rounded-xl flex items-start gap-3 border border-blue-100/50">
             <div className="bg-blue-100 p-1 rounded-full">
               <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
             </div>
             <div>
               <p className="text-[10px] text-blue-800 leading-tight font-medium">
                 <b>Categorização MBRF:</b> Pagamentos de 'Negociação' amortizam o acordo vigente. Pagamentos de 'Saldo Devedor' abatem o montante bruto que não entrou em negociação.
               </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
