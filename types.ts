
export type PaymentStatus = 'pago' | 'pendente_baixa' | 'atraso';
export type PaymentType = 'negociacao' | 'saldo_devedor';
export type AuditEventType = 'status_change' | 'payment_added' | 'negotiation_started' | 'system_alert';

export interface AuditEntry {
  id: string;
  timestamp: string;
  event: AuditEventType;
  description: string;
  user: string;
}

export interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  status: 'confirmado' | 'pendente';
  method: string;
  type: PaymentType;
}

export interface DebtBreakdown {
  id: string;
  employeeName: string;
  cpf: string;
  employeeId: string;
  ticketNumber: string;
  totalBalance: number;       
  negotiatedAmount: number;   
  unprocessedPayment: number; 
  negotiationStartDate: string;
  dueDate: string;
  status: PaymentStatus;
  installments: string;
  lastUpdate: string;
  payments: PaymentHistoryItem[];
  history: AuditEntry[];
}

export interface AnalyticsData {
  totalDebtVolume: number;
  totalNegotiatedVolume: number;
  totalPaidVolume: number;
  pendingWriteOffs: number;
  statusDistribution: {
    pago: number;
    pendente_baixa: number;
    atraso: number;
  };
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
}
