
import React, { useState, useMemo, useEffect } from 'react';
import { parseMBRFDebt } from './services/geminiService';
import { DebtBreakdown, PaymentStatus, PaymentHistoryItem, PaymentType, AuditEntry } from './types';
import DebtSummary from './components/DebtSummary';
import NegotiationChat from './components/NegotiationChat';
import Calculator from './components/Calculator';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import PaymentHistory from './components/PaymentHistory';
import NotificationCenter from './components/NotificationCenter';
import AuditTimeline from './components/AuditTimeline';
import Login from './components/Login';

const LOGO_URL = "https://i.imgur.com/M2385CF.png";

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
  }
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [employees, setEmployees] = useState<DebtBreakdown[]>(INITIAL_DATA);
  const [viewMode, setViewMode] = useState<'management' | 'analytics'>('management');
  const [showBaixaConfirm, setShowBaixaConfirm] = useState(false);
  const [selectedData, setSelectedData] = useState<DebtBreakdown | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rawInput, setRawInput] = useState('');
  
  const [filterName, setFilterName] = useState('');
  const [filterCPF, setFilterCPF] = useState('');
  const [filterID, setFilterID] = useState('');
  const [filterTicket, setFilterTicket] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'todos'>('todos');
  
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const handleLogin = (email: string, pass: string) => {
    if (email.includes('financeiro') && pass === 'admin') {
      setIsAuthenticated(true);
      setUserRole('Financeiro');
      return true;
    }
    if (email.includes('auditoria') && pass === 'admin') {
      setIsAuthenticated(true);
      setUserRole('Auditoria');
      return true;
    }
    if (email === 'admin@mbrf.com' || (email === 'teste@admin.com' && pass === 'teste')) {
      setIsAuthenticated(true);
      setUserRole('Gestão');
      return true;
    }
    if (pass === 'user') {
      setIsAuthenticated(true);
      setUserRole('Colaborador');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setSelectedData(null);
    setUserRole(null);
  };

  const clearFilters = () => {
    setFilterName('');
    setFilterCPF('');
    setFilterID('');
    setFilterTicket('');
    setStatusFilter('todos');
  };

  const createAuditLog = (event: AuditEntry['event'], description: string): AuditEntry => ({
    id: `AUD-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
    timestamp: new Date().toISOString(),
    event,
    description,
    user: `Operador (${userRole})`
  });

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesName = emp.employeeName.toLowerCase().includes(filterName.toLowerCase());
      const matchesCPF = emp.cpf.replace(/\D/g, '').includes(filterCPF.replace(/\D/g, ''));
      const matchesID = emp.employeeId.toLowerCase().includes(filterID.toLowerCase());
      const matchesTicket = emp.ticketNumber.toLowerCase().includes(filterTicket.toLowerCase());
      const matchesStatus = statusFilter === 'todos' || emp.status === statusFilter;
      
      return matchesName && matchesCPF && matchesID && matchesTicket && matchesStatus;
    });
  }, [employees, filterName, filterCPF, filterID, filterTicket, statusFilter]);

  const nearDueAlerts = useMemo(() => {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    return employees.filter(emp => {
      if (emp.status === 'pago') return false;
      const parts = emp.dueDate.split('/');
      const dueDate = parts.length === 3 ? new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0])) : null;
      return (dueDate && dueDate >= today && dueDate <= sevenDaysFromNow) || emp.status === 'atraso';
    });
  }, [employees]);

  const hasCriticalAlerts = nearDueAlerts.some(a => a.status === 'atraso');

  const handleConfirmPayment = (id: string) => {
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        const amountToProcess = emp.unprocessedPayment;
        const newNegotiatedAmount = Math.max(0, emp.negotiatedAmount - amountToProcess);
        const newTotalBalance = Math.max(0, emp.totalBalance - amountToProcess);
        const newStatus: PaymentStatus = newNegotiatedAmount <= 0 ? 'pago' : emp.status;

        const log = createAuditLog('payment_added', `Amortização Automática: R$ ${amountToProcess} liquidados.`);
        
        const updated = {
          ...emp,
          totalBalance: newTotalBalance,
          negotiatedAmount: newNegotiatedAmount,
          unprocessedPayment: 0,
          status: newStatus,
          lastUpdate: new Date().toISOString().split('T')[0],
          history: [log, ...(emp.history || [])]
        };

        if (selectedData?.id === id) setSelectedData(updated);
        return updated;
      }
      return emp;
    }));
  };

  const handleBaixa = (id: string, newStatus: PaymentStatus) => {
    const log = createAuditLog('status_change', `Status alterado para ${newStatus.toUpperCase()}`);
    setEmployees(prev => prev.map(emp => {
      if (emp.id === id) {
        const updated = { 
          ...emp, 
          status: newStatus, 
          unprocessedPayment: newStatus === 'pago' ? 0 : emp.unprocessedPayment,
          lastUpdate: new Date().toISOString().split('T')[0],
          history: [log, ...(emp.history || [])]
        };
        if (selectedData?.id === id) setSelectedData(updated);
        return updated;
      }
      return emp;
    }));
    setShowBaixaConfirm(false);
  };

  const handleAddPayment = (employeeId: string, amount: number, date: string, type: PaymentType) => {
    const log = createAuditLog('payment_added', `Entrada de R$ ${amount} (${type}) aguardando auditoria.`);
    const paymentId = `PAY-${Math.floor(Math.random() * 10000)}`;
    const newPayment: PaymentHistoryItem = { id: paymentId, amount, date, status: 'pendente', method: 'Transferência', type };

    setEmployees(prev => prev.map(emp => {
      if (emp.id === employeeId) {
        const updated = {
          ...emp,
          payments: [newPayment, ...(emp.payments || [])],
          unprocessedPayment: emp.unprocessedPayment + amount,
          status: emp.status === 'atraso' ? 'pendente_baixa' : emp.status,
          lastUpdate: new Date().toISOString().split('T')[0],
          history: [log, ...(emp.history || [])]
        };
        if (selectedData?.id === employeeId) setSelectedData(updated);
        return updated;
      }
      return emp;
    }));
  };

  const handleProcessAI = async () => {
    if (!rawInput.trim()) return;
    setIsProcessing(true);
    try {
      const result = await parseMBRFDebt(rawInput);
      const log = createAuditLog('negotiation_started', 'Registro criado via MBRF AI-Analysis');
      const enriched = {
        ...result,
        id: Math.random().toString(36).substr(2, 9),
        negotiationStartDate: result.negotiationStartDate || new Date().toLocaleDateString('pt-BR'),
        installments: result.installments || 'Cálculo dinâmico',
        lastUpdate: new Date().toISOString().split('T')[0],
        payments: [],
        history: [log]
      } as DebtBreakdown;
      setEmployees(prev => [enriched, ...prev]);
      setSelectedData(enriched);
      setRawInput('');
    } catch (error) {
      alert("Erro ao processar via IA.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      <header className="bg-[#0f172a] text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-6 h-full">
            <div className="bg-white p-2 rounded-2xl h-14 w-32 flex items-center justify-center shadow-xl border border-slate-700/30 overflow-hidden">
               <img src={LOGO_URL} alt="Marfrig Logo" className="max-h-full max-w-full object-contain" />
            </div>
            <div className="h-10 w-px bg-slate-700 mx-2 hidden sm:block"></div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase leading-none">Saldo Devedor <span className="text-blue-400">MBRF</span></h1>
              <span className="text-[8px] uppercase tracking-widest text-slate-400 block mt-1 font-bold">Portal Auditoria &bull; {userRole}</span>
            </div>
          </div>
          
          <nav className="flex bg-slate-800 p-1.5 rounded-2xl shadow-inner border border-slate-700">
            <button onClick={() => setViewMode('management')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'management' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Gestão</button>
            <button onClick={() => setViewMode('analytics')} className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'analytics' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Analítico</button>
          </nav>

          <div className="flex items-center gap-6">
            <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className={`relative p-2.5 bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700 ${hasCriticalAlerts ? 'ring-2 ring-red-500 ring-opacity-50' : ''}`}>
              <svg className={`w-6 h-6 ${hasCriticalAlerts ? 'animate-bounce text-red-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              {nearDueAlerts.length > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 ${hasCriticalAlerts ? 'bg-red-600' : 'bg-blue-600'} text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xl ring-2 ring-slate-900`}>{nearDueAlerts.length}</span>
              )}
            </button>
            <button onClick={handleLogout} className="px-4 py-2.5 bg-slate-800 hover:bg-red-600/20 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all text-slate-400 hover:text-red-400">Sair</button>
          </div>
        </div>
        
        <NotificationCenter isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} alerts={nearDueAlerts} onSelectEmployee={(emp) => { setSelectedData(emp); setIsNotificationsOpen(false); }} />
      </header>

      <main className="max-w-7xl mx-auto w-full p-6 pb-20">
        {viewMode === 'analytics' ? (
          <AnalyticsDashboard data={employees} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-5">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Auditoria Rápida</h3>
                  {(filterName || filterCPF || filterID || filterTicket || statusFilter !== 'todos') && (
                    <button onClick={clearFilters} className="text-[9px] font-black text-blue-600 uppercase hover:underline">Limpar</button>
                  )}
                </div>
                <div className="space-y-3">
                  <input type="text" placeholder="Nome Completo" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={filterName} onChange={e => setFilterName(e.target.value)} />
                  <input type="text" placeholder="CPF" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={filterCPF} onChange={e => setFilterCPF(e.target.value)} />
                  <div className="grid grid-cols-2 gap-2">
                    <input type="text" placeholder="ID MBRF" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={filterID} onChange={e => setFilterID(e.target.value)} />
                    <input type="text" placeholder="Ticket" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-semibold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" value={filterTicket} onChange={e => setFilterTicket(e.target.value)} />
                  </div>
                  <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-[11px] font-black uppercase tracking-wider outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer" value={statusFilter} onChange={e => setStatusFilter(e.target.value as any)}>
                    <option value="todos">Todos Status</option>
                    <option value="pago">Liquidados (Verde)</option>
                    <option value="pendente_baixa">Pendentes (Amarelo)</option>
                    <option value="atraso">Atrasados (Vermelho)</option>
                  </select>
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Filtrados ({filteredEmployees.length})</h3>
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {filteredEmployees.map(emp => (
                    <button key={emp.id} onClick={() => setSelectedData(emp)} className={`w-full text-left p-4 rounded-2xl transition-all border-2 group relative overflow-hidden ${selectedData?.id === emp.id ? 'border-blue-500 bg-blue-50 shadow-md' : emp.status === 'atraso' ? 'border-red-50 bg-red-50/20 hover:bg-red-50' : emp.status === 'pendente_baixa' ? 'border-amber-50 bg-amber-50/20 hover:bg-amber-50' : 'border-emerald-50 bg-emerald-50/20 hover:bg-emerald-50'}`}>
                      <div className="flex justify-between items-start mb-1">
                        <p className={`text-xs font-black truncate pr-2 uppercase ${emp.status === 'atraso' ? 'text-red-900' : emp.status === 'pendente_baixa' ? 'text-amber-900' : 'text-emerald-900'}`}>{emp.employeeName}</p>
                        <div className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${emp.status === 'pago' ? 'bg-emerald-500' : emp.status === 'pendente_baixa' ? 'bg-amber-500' : 'bg-red-500 animate-pulse'}`}></div>
                      </div>
                      <p className="text-[10px] font-mono font-black text-slate-400">#{emp.ticketNumber}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-2xl border border-slate-700">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 mb-4">IA para Novos Chamados</h3>
                <textarea className="w-full h-24 p-3 text-[11px] bg-slate-800/50 border border-slate-700 rounded-2xl outline-none resize-none mb-4 font-mono" placeholder="Ex: Saldo R$20k, acorda R$15k..." value={rawInput} onChange={e => setRawInput(e.target.value)} />
                <button onClick={handleProcessAI} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">{isProcessing ? 'Sincronizando...' : 'Criar Registro via IA'}</button>
              </div>
            </div>

            <div className="lg:col-span-3 space-y-8">
              {!selectedData ? (
                <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] h-[700px] flex flex-col items-center justify-center text-slate-400 animate-in fade-in duration-500">
                   <img src={LOGO_URL} className="w-48 opacity-10 grayscale mb-8" alt="placeholder" />
                   <p className="text-sm font-black uppercase tracking-[0.3em] opacity-40">Módulo de Auditoria MBRF</p>
                </div>
              ) : (
                <>
                  <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden animate-in slide-in-from-right-4 duration-300">
                    <div className="bg-slate-50 px-8 py-6 border-b border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="bg-slate-900 text-white w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-lg">{selectedData.employeeName.charAt(0)}</div>
                        <div>
                          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{selectedData.employeeName}</h2>
                          <div className="flex gap-4 items-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ID: {selectedData.employeeId}</span>
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">#{selectedData.ticketNumber}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        {selectedData.unprocessedPayment > 0 && selectedData.status !== 'pago' && (
                          <button 
                            onClick={() => handleConfirmPayment(selectedData.id)} 
                            className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase px-6 py-3 rounded-2xl transition-all shadow-xl shadow-blue-500/20 animate-bounce"
                          >
                            Processar Amortização (R$ {selectedData.unprocessedPayment.toFixed(0)})
                          </button>
                        )}
                        {selectedData.status !== 'pago' && (
                          <button onClick={() => setShowBaixaConfirm(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-black uppercase px-6 py-3 rounded-2xl transition-all shadow-xl shadow-emerald-500/10">
                            Quitação Total
                          </button>
                        )}
                        <span className={`px-6 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest text-white shadow-xl ${selectedData.status === 'pago' ? 'bg-emerald-500' : selectedData.status === 'pendente_baixa' ? 'bg-amber-500' : 'bg-red-500'}`}>
                          {selectedData.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                    <div className="p-8">
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                        <div className="p-8 bg-slate-900 text-white rounded-[2rem] shadow-2xl border-b-8 border-blue-600">
                          <p className="text-[11px] font-black text-slate-400 uppercase mb-3">Dívida Bruta Atual</p>
                          <p className="text-4xl font-black">{formatCurrency(selectedData.totalBalance)}</p>
                        </div>
                        <div className="p-8 bg-blue-600 text-white rounded-[2rem] shadow-2xl border-b-8 border-blue-900">
                          <p className="text-[11px] font-black text-blue-100 uppercase mb-3">Valor para Quitação</p>
                          <p className="text-4xl font-black">{formatCurrency(selectedData.negotiatedAmount)}</p>
                        </div>
                        <div className={`p-8 bg-white border-2 border-slate-100 rounded-[2rem] shadow-sm border-b-8 ${selectedData.unprocessedPayment > 0 ? 'border-amber-500 animate-pulse' : 'border-slate-200'}`}>
                          <p className="text-[11px] font-black text-slate-400 uppercase mb-3">Aguardando Baixa</p>
                          <p className="text-4xl font-black text-slate-800">{formatCurrency(selectedData.unprocessedPayment)}</p>
                        </div>
                      </div>
                      <DebtSummary breakdown={selectedData} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <AuditTimeline history={selectedData.history || []} />
                    <Calculator data={selectedData} />
                  </div>
                  <PaymentHistory breakdown={selectedData} onAddPayment={(amt, dt, type) => handleAddPayment(selectedData.id, amt, dt, type)} />
                  <NegotiationChat breakdown={selectedData} />
                </>
              )}
            </div>
          </div>
        )}
      </main>

      {showBaixaConfirm && selectedData && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-xl z-[150] flex items-center justify-center p-6">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl overflow-hidden p-12 text-center">
            <h3 className="text-3xl font-black text-slate-800 mb-4 uppercase">Liquidação MBRF</h3>
            <p className="text-slate-500 mb-10 leading-relaxed">Deseja liquidar totalmente o saldo de <span className="font-black text-slate-800">{selectedData.employeeName}</span> no ticket #{selectedData.ticketNumber}?</p>
            <div className="flex flex-col gap-4">
              <button onClick={() => {
                const updatedEmp = {...selectedData, negotiatedAmount: 0, unprocessedPayment: 0, status: 'pago' as PaymentStatus};
                setEmployees(prev => prev.map(e => e.id === selectedData.id ? updatedEmp : e));
                setSelectedData(updatedEmp);
                setShowBaixaConfirm(false);
              }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-5 rounded-2xl font-black uppercase text-xs shadow-2xl">Confirmar Quitação Permanente</button>
              <button onClick={() => setShowBaixaConfirm(false)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-500 py-5 rounded-2xl font-black uppercase text-[10px]">Cancelar Operação</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
