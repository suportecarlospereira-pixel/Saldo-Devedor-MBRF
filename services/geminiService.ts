
import { GoogleGenAI, Type } from "@google/genai";
import { DebtBreakdown } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

export const parseMBRFDebt = async (rawText: string): Promise<DebtBreakdown> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analise o texto de dívida da empresa MBRF e extraia os dados conforme o exemplo:
    "Saldo de R$18.000, negociação de 1.500x10 (total 15.000), pagamento de 1.500 sem baixa."
    
    Regras de cálculo MBRF:
    1. totalBalance: O valor bruto inicial (ex: 18.000).
    2. negotiatedAmount: O valor total acordado na negociação (ex: 15.000).
    3. unprocessedPayment: Pagamentos feitos mas ainda não baixados (ex: 1.500).
    
    Texto: "${rawText}"`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          employeeName: { type: Type.STRING },
          cpf: { type: Type.STRING },
          employeeId: { type: Type.STRING },
          ticketNumber: { type: Type.STRING },
          totalBalance: { type: Type.NUMBER },
          negotiatedAmount: { type: Type.NUMBER },
          paidAmount: { type: Type.NUMBER },
          unprocessedPayment: { type: Type.NUMBER },
          negotiationStartDate: { type: Type.STRING },
          dueDate: { type: Type.STRING },
          status: { type: Type.STRING, enum: ['pago', 'pendente_baixa', 'atraso'] }
        },
        required: ["totalBalance", "negotiatedAmount", "unprocessedPayment"]
      }
    }
  });

  return JSON.parse(response.text);
};

export const getNegotiationAdvice = async (breakdown: DebtBreakdown, userMessage: string) => {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: `Você é o consultor financeiro da MBRF.
      Contexto: Colaborador ${breakdown.employeeName}.
      Saldo Devedor Bruto: R$ ${breakdown.totalBalance}.
      Negociação Total: R$ ${breakdown.negotiatedAmount}.
      Pagamento Pendente de Baixa: R$ ${breakdown.unprocessedPayment}.
      
      Explique que o saldo restante é calculado como (Total - Negociação) - Pagamentos.
      Seja formal e direto.`
    }
  });

  const response = await chat.sendMessage({ message: userMessage });
  return response.text;
};
