
import React, { useState } from 'react';

interface Props {
  onLogin: (email: string, pass: string) => boolean;
}

const LOGO_URL = "https://i.imgur.com/M2385CF.png";

const Login: React.FC<Props> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(false);

    setTimeout(() => {
      const success = onLogin(email, password);
      if (!success) {
        setError(true);
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* New Official Logo Container */}
        <div className="bg-white p-8 rounded-[3rem] flex items-center justify-center mx-auto mb-10 shadow-[0_25px_60px_rgba(255,255,255,0.05)] w-72 h-44 border border-slate-700/30 overflow-hidden animate-in zoom-in duration-1000">
          <img 
            src={LOGO_URL} 
            alt="Marfrig Logo" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
        
        <div className="bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.5)] overflow-hidden p-12 text-left animate-in slide-in-from-bottom-8 duration-700">
           <div className="mb-10">
             <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Módulo de Auditoria</h2>
             <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 italic">Acesso Restrito &bull; Segurança BRF</p>
           </div>
           
           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Credencial Corporativa</label>
                <input
                  type="email"
                  required
                  placeholder="usuario@marfrig.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Senha de Auditor</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-[1.5rem] px-6 py-5 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-semibold"
                />
              </div>

              {error && (
                <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-center gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                   <p className="text-red-600 text-[10px] font-black uppercase">Credenciais Inválidas</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-[1.5rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl shadow-blue-500/30 transition-all active:scale-[0.98]"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Sincronizando...
                  </span>
                ) : 'Acessar Base de Dados'}
              </button>
           </form>
        </div>
        
        <div className="mt-12 flex flex-col items-center gap-4">
           <p className="text-slate-600 text-[9px] font-black uppercase tracking-[0.5em]">&copy; 2025 MARFRIG &bull; Auditoria Centralizada</p>
           <div className="flex gap-4 opacity-30">
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
              <div className="w-2 h-2 rounded-full bg-white"></div>
              <div className="w-2 h-2 rounded-full bg-blue-400"></div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
