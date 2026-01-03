
import React, { useState } from 'react';

interface Props {
  onLogin: (email: string, pass: string) => boolean;
}

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
        <div className="bg-white p-6 rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-2xl w-64 h-36 border border-slate-700/30 overflow-hidden">
          <img 
            src="https://i.ibb.co/hR8zM6K/mbrf-logo.png" 
            alt="Logo MBRF" 
            className="max-w-full max-h-full object-contain"
          />
        </div>
        <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden p-10 text-left">
           <h2 className="text-xl font-black text-slate-800 mb-6 uppercase tracking-tight">Login Administrativo</h2>
           <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="email"
                required
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="password"
                required
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-blue-500"
              />
              {error && <p className="text-red-500 text-xs font-bold">Credenciais incorretas.</p>}
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs"
              >
                {isLoading ? 'Autenticando...' : 'Entrar'}
              </button>
           </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
