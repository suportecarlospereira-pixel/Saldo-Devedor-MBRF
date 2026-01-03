
import React, { useState, useMemo } from 'react';
import { parseMBRFDebt } from './services/geminiService';
import { DebtBreakdown, PaymentStatus, PaymentHistoryItem, PaymentType, AuditEntry } from './types';
import DebtSummary from './components/DebtSummary';
import NegotiationChat from './components/NegotiationChat';
import Calculator from './components/Calculator';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PaymentHistory from './components/PaymentHistory';
import NotificationCenter from './components/NotificationCenter';
import AuditTimeline from './components/AuditTimeline';

const INITIAL_DATA: DebtBreakdown[] = [
  {
    id: '1',
    employeeName: 'João Silva',
    cpf: '123.456.789-00',
    employeeId: 'MBRF-001',
    ticketNumber: 'CH-8821',
    totalBalance: 18000,
    negotiatedAmount: 15000,
    unprocessedPayment: 1500,
    negotiationStartDate: '10/10/2024',
    dueDate: '10/12/2024',
    status: 'pendente_baixa',
    installments: '10x R$ 1.500',
    lastUpdate: '2024-11-20',
    payments: [
      { id: 'PAY-001', date: '2024-10-10', amount: 1500, status: 'confirmado', method: 'Boleto', type: 'negociacao' }
    ],
    history: [
      { id: 'H-1', timestamp: '2024-10-10T10:00:00Z', event: 'negotiation_started', description: 'Acordo iniciado em 10 parcelas', user: 'Auditor Alpha' },
      { id: 'H-2', timestamp: '2024-10-10T11:30:00Z', event: 'payment_added', description: 'Primeira parcela confirmada', user: 'Sistema Automático' }
    ]
  },
  {
    id: '2',
    employeeName: 'Maria Oliveira',
    cpf: '987.654.321-11',
    employeeId: 'MBRF-002',
    ticketNumber: 'CH-9932',
    totalBalance: 25000,
    negotiatedAmount: 20000,
    unprocessedPayment: 0,
    negotiationStartDate: '05/11/2024',
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'), 
    status: 'atraso',
    installments: '5x R$ 4.000',
    lastUpdate: '2024-11-21',
    payments: [],
    history: [
      { id: 'H-3', timestamp: '2024-11-05T09:00:00Z', event: 'negotiation_started', description: 'Negociação aberta via portal', user: 'Auto-atendimento' }
    ]
  },
  {
    id: '3',
    employeeName: 'Roberto Santos',
    cpf: '456.789.123-22',
    employeeId: 'MBRF-003',
    ticketNumber: 'CH-1045',
    totalBalance: 42000,
    negotiatedAmount: 35000,
    unprocessedPayment: 5000,
    negotiationStartDate: '01/09/2024',
    dueDate: '15/09/2024', 
    status: 'atraso',
    installments: '7x R$ 5.000',
    lastUpdate: '2024-09-15',
    payments: [],
    history: [
      { id: 'H-4', timestamp: '2024-09-01T08:00:00Z', event: 'negotiation_started', description: 'Acordo de alto valor', user: 'Gerente Financeiro' },
      { id: 'H-5', timestamp: '2024-09-16T14:00:00Z', event: 'system_alert', description: 'Alerta de Inadimplência: 1ª Parcela Vencida', user: 'Robô MBRF' }
    ]
  },
  {
    id: '4',
    employeeName: 'Fernanda Costa',
    cpf: '321.654.987-44',
    employeeId: 'MBRF-004',
    ticketNumber: 'CH-1120',
    totalBalance: 12000,
    negotiatedAmount: 10000,
    unprocessedPayment: 10000,
    negotiationStartDate: '20/11/2024',
    dueDate: '20/12/2024', 
    status: 'pendente_baixa',
    installments: 'Quitação Única',
    lastUpdate: '2024-11-22',
    payments: [
      { id: 'PAY-112', date: '2024-11-21', amount: 10000, status: 'pendente', method: 'TED', type: 'negociacao' }
    ],
    history: [
      { id: 'H-6', timestamp: '2024-11-20T10:00:00Z', event: 'negotiation_started', description: 'Acordo para quitação total solicitado', user: 'Portal Colaborador' }
    ]
  }
];

const App: React.FC = () => {
  const [employees, setEmployees] = useState<DebtBreakdown[]>(INITIAL_DATA);
  const [viewMode, setViewMode] = useState<'management' | 'analytics'>('management');
  const [isRegistering, setIsRegistering] = useState(false);
  const [showBaixaConfirm, setShowBaixaConfirm] = useState(false);
  const [selectedData, setSelectedData] = useState<DebtBreakdown | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawInput, setRawInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'todos'>('todos');
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const [dateStartFrom, setDateStartFrom] = useState('');
  const [dateStartTo, setDateStartTo] = useState('');
  const [dueDateFrom, setDueDateFrom] = useState('');
  const [dueDateTo, setDueDateTo] = useState('');

  const createAuditLog = (event: AuditEntry['event'], description: string): AuditEntry => ({
    id: `AUD-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    event,
    description,
    user: 'Operador Financeiro'
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const search = searchTerm.toLowerCase();
      const matchesSearch = emp.employeeName.toLowerCase().includes(search) ||
                            emp.cpf.includes(searchTerm) ||
                            emp.employeeId.toLowerCase().includes(search) ||
                            emp.ticketNumber.toLowerCase().includes(search);
      
      const matchesStatus = statusFilter === 'todos' || emp.status === statusFilter;
      const empStartDate = stringToDate(emp.negotiationStartDate);
      let matchesDateStart = true;
      if (dateStartFrom && empStartDate) matchesDateStart = matchesDateStart && empStartDate >= new Date(dateStartFrom);
      if (dateStartTo && empStartDate) matchesDateStart = matchesDateStart && empStartDate <= new Date(dateStartTo);

      const empDueDate = stringToDate(emp.dueDate);
      let matchesDueDate = true;
      if (dueDateFrom && empDueDate) matchesDueDate = matchesDueDate && empDueDate >= new Date(dueDateFrom);
      if (dueDateTo && empDueDate) matchesDueDate = matchesDueDate && empDueDate <= new Date(dueDateTo);

      return matchesSearch && matchesStatus && matchesDateStart && matchesDueDate;
    });
  }, [employees, searchTerm, statusFilter, dateStartFrom, dateStartTo, dueDateFrom, dueDateTo]);

  const nearDueAlerts = useMemo(() => {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    return employees.filter(emp => {
      if (emp.status === 'pago') return false;
      const dueDate = stringToDate(emp.dueDate);
      return dueDate && dueDate >= today && dueDate <= sevenDaysFromNow;
    });
  }, [employees]);

  function stringToDate(str: string) {
    if (!str) return null;
    const parts = str.split('/');
    if (parts.length !== 3) {
      // Tenta parsear formato YYYY-MM-DD se vier da IA ou novo registro
      const isoParts = str.split('-');
      if (isoParts.length === 3) return new Date(parseInt(isoParts[0]), parseInt(isoParts[1]) - 1, parseInt(isoParts[2]));
      return null;
    }
    return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
  }

  const handleBaixa = (id: string, newStatus: PaymentStatus) => {
    const log = createAuditLog('status_change', `Status alterado para ${newStatus.toUpperCase()}`);
    setEmployees(prev => prev.map(emp => 
      emp.id === id ? { 
        ...emp, 
        status: newStatus, 
        unprocessedPayment: newStatus === 'pago' ? 0 : emp.unprocessedPayment,
        lastUpdate: new Date().toISOString().split('T')[0],
        history: [log, ...(emp.history || [])]
      } : emp
    ));
    if (selectedData?.id === id) {
      setSelectedData(prev => prev ? { 
        ...prev, 
        status: newStatus,
        unprocessedPayment: newStatus === 'pago' ? 0 : prev.unprocessedPayment,
        history: [log, ...(prev.history || [])]
      } : null);
    }
    setShowBaixaConfirm(false);
  };

  const handleAddPayment = (employeeId: string, amount: number, date: string, type: PaymentType) => {
    const log = createAuditLog('payment_added', `Pagamento de ${formatCurrency(amount)} (${type})`);
    const paymentId = `PAY-${Math.floor(Math.random() * 10000)}`;
    const newPayment: PaymentHistoryItem = { id: paymentId, amount, date, status: 'pendente', method: 'Transferência', type };

    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        return {
          ...emp,
          payments: [newPayment, ...(emp.payments || [])],
          unprocessedPayment: emp.unprocessedPayment + amount,
          lastUpdate: new Date().toISOString().split('T')[0],
          history: [log, ...(emp.history || [])]
        };
      }
      return emp;
    }));

    if (selectedData?.id === employeeId) {
      setSelectedData(prev => prev ? {
        ...prev,
        payments: [newPayment, ...(prev.payments || [])],
        unprocessedPayment: prev.unprocessedPayment + amount,
        history: [log, ...(prev.history || [])]
      } : null);
    }
  };

  const handleProcessAI = async () => {
    if (!rawInput.trim()) return;
    setIsProcessing(true);
    try {
      const result = await parseMBRFDebt(rawInput);
      const log = createAuditLog('negotiation_started', 'Negociação importada via IA');
      const enriched = {
        ...result,
        id: Math.random().toString(36).substr(2, 9),
        negotiationStartDate: result.negotiationStartDate || new Date().toLocaleDateString('pt-BR'),
        installments: result.installments || 'Calculado via IA',
        lastUpdate: new Date().toISOString().split('T')[0],
        payments: [],
        history: [log]
      } as DebtBreakdown;
      setEmployees(prev => [enriched, ...prev]);
      setSelectedData(enriched);
      setRawInput('');
    } catch (error) {
      alert("Erro ao processar com IA.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      <header className="bg-[#0f172a] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Saldo Devedor <span className="text-blue-400">MBRF</span></h1>
              <span className="text-[8px] uppercase tracking-widest text-slate-400">Asset Management Hub</span>
            </div>
          </div>
          
          <nav className="flex bg-slate-800 p-1 rounded-xl">
            <button onClick={() => setViewMode('management')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'management' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Gestão</button>
            <button onClick={() => setViewMode('analytics')} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'analytics' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>Analítico</button>
          </nav>

          <div className="flex items-center gap-4">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="relative p-2 text-slate-400 hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {nearDueAlerts.length > 0 && <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-bounce shadow-lg">{nearDueAlerts.length}</span>}
            </button>
          </div>
        </div>
        <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} alerts={nearDueAlerts} onSelectEmployee={(emp) => setSelectedData(emp)} />
      </header>

      <main className="max-w-7xl mx-auto w-full p-6">
        {viewMode === 'analytics' ? (
          <AnalyticsDashboard data={employees} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-4 text-center">Filtros Avançados</h3>
                <div className="space-y-3">
                  <input type="text" placeholder="Nome, CPF ou Chamado..." className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-blue-500" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                    <option value="todos">Todos Status</option>
                    <option value="pago">Pago</option>
                    <option value="pendente_baixa">Pendente Baixa</option>
                    <option value="atraso">Atraso</option>
                  </select>
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Base de Dados ({filteredEmployees.length})</h3>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" title="Atraso"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-500" title="Pendente"></div>
                  </div>
                </div>
                <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredEmployees.map(emp => (
                    <button 
                      key={emp.id} 
                      onClick={() => setSelectedData(emp)} 
                      className={`w-full text-left p-3 rounded-xl transition-all border group relative ${
                        selectedData?.id === emp.id 
                          ? 'border-blue-500 bg-blue-50/50 shadow-sm' 
                          : emp.status === 'atraso'
                            ? 'border-red-100 bg-red-50/30 hover:bg-red-50'
                            : emp.status === 'pendente_baixa'
                              ? 'border-amber-100 bg-amber-50/30 hover:bg-amber-50'
                              : 'border-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-xs font-bold truncate pr-2 ${emp.status === 'atraso' ? 'text-red-900' : 'text-slate-800'}`}>
                          {emp.employeeName}
                        </p>
                        <div className={`w-2 h-2 rounded-full mt-1 flex-shrink-0 animate-pulse ${
                          emp.status === 'pago' ? 'bg-emerald-500 animate-none' : emp.status === 'pendente_baixa' ? 'bg-amber-500' : 'bg-red-500'
                        }`}></div>
                      </div>
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-tighter">CPF: {emp.cpf}</p>
                          <p className={`text-[10px] font-mono font-bold ${emp.status === 'atraso' ? 'text-red-600' : 'text-blue-500'}`}>#{emp.ticketNumber}</p>
                        </div>
                        {emp.unprocessedPayment > 0 && (
                          <div className={`text-[8px] font-black px-1.5 py-0.5 rounded ${emp.status === 'atraso' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                            RETIDO: {formatCurrency(emp.unprocessedPayment)}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <div className="py-8 text-center text-slate-300">
                      <p className="text-[10px] uppercase font-black italic">Nenhum registro encontrado</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                   <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a1 1 0 10-1.415-1.414 3 3 0 01-4.242 0 1 1 0 00-1.415 1.414 5 5 0 007.072 0z" clipRule="evenodd" /></svg>
                </div>
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-3 relative z-10">Processamento IA MBRF</h3>
                <p className="text-[9px] text-slate-400 mb-3 leading-tight italic">Cole dados de extratos ou mensagens do sistema para processamento imediato.</p>
                <textarea className="w-full h-24 p-3 text-[10px] bg-slate-800 border border-slate-700 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none resize-none mb-3 relative z-10" placeholder="Ex: Saldo de 42.000, negociação de 35.000, pagamento de 5.000 pendente..." value={rawInput} onChange={e => setRawInput(e.target.value)} />
                <button onClick={handleProcessAI} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all disabled:opacity-50 relative z-10">{isProcessing ? 'Sincronizando...' : 'Analisar Saldo via IA'}</button>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-6">
              {!selectedData ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl h-[600px] flex flex-col items-center justify-center text-slate-400">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <svg className="w-10 h-10 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-sm font-black uppercase tracking-[0.2em] opacity-40">Módulo de Auditoria de Saldo MBRF</p>
                  <p className="text-[10px] font-medium mt-2">Selecione um colaborador na lista lateral para iniciar a auditoria</p>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center font-black">
                          {selectedData.employeeName.charAt(0)}
                        </div>
                        <div>
                          <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">{selectedData.employeeName}</h2>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">ID: {selectedData.employeeId} • Ticket: {selectedData.ticketNumber}</p>
                        </div>
                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${
                          selectedData.status === 'atraso' ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'
                        }`}>
                          Risco: {selectedData.status === 'atraso' ? 'ALTO' : 'MONITORADO'}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {selectedData.status !== 'pago' && (
                          <button onClick={() => setShowBaixaConfirm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all shadow-md active:scale-95">
                            Liquidar Ticket
                          </button>
                        )}
                        <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-white shadow-sm ${
                          selectedData.status === 'pago' ? 'bg-emerald-500' : selectedData.status === 'pendente_baixa' ? 'bg-amber-500' : 'bg-red-500'
                        }`}>
                          {selectedData.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-6 bg-slate-900 text-white rounded-2xl shadow-lg border-b-4 border-blue-500">
                          <div className="flex justify-between items-start mb-2">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dívida Bruta MBRF</p>
                             <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <p className="text-3xl font-black">{formatCurrency(selectedData.totalBalance)}</p>
                        </div>
                        <div className="p-6 bg-blue-600 text-white rounded-2xl shadow-lg border-b-4 border-blue-800">
                           <div className="flex justify-between items-start mb-2">
                             <p className="text-[10px] font-bold text-blue-100 uppercase tracking-widest">Acordo Negociado</p>
                             <svg className="w-4 h-4 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <p className="text-3xl font-black">{formatCurrency(selectedData.negotiatedAmount)}</p>
                        </div>
                        <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm border-b-4 border-amber-500">
                           <div className="flex justify-between items-start mb-2">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Abatimento Pendente</p>
                             <svg className="w-4 h-4 text-amber-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          </div>
                          <p className="text-3xl font-black text-slate-800">{formatCurrency(selectedData.unprocessedPayment)}</p>
                        </div>
                      </div>
                      <DebtSummary breakdown={selectedData} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <AuditTimeline history={selectedData.history || []} />
                    <Calculator data={selectedData} />
                  </div>

                  <PaymentHistory 
                    breakdown={selectedData} 
                    onAddPayment={(amt, dt, type) => handleAddPayment(selectedData.id, amt, dt, type)} 
                  />

                  <NegotiationChat breakdown={selectedData} />
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {showBaixaConfirm && selectedData && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden p-10 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tighter uppercase">Liquidar Dívida?</h3>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">Você está prestes a efetivar a baixa total do ticket <span className="font-bold text-slate-800">#{selectedData.ticketNumber}</span> do colaborador <span className="font-bold text-slate-800">{selectedData.employeeName}</span>. Esta ação registrará o status de quitação permanente.</p>
            <div className="flex flex-col gap-3">
              <button onClick={() => handleBaixa(selectedData.id, 'pago')} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg transition-transform active:scale-95">Confirmar Baixa Permanente</button>
              <button onClick={() => setShowBaixaConfirm(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-colors">Abortar Operação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
