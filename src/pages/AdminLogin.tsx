import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        login(data.token);
        navigate('/admin');
      } else {
        setError(data.error || 'Credenziali non valide');
      }
    } catch (err) {
      setError('Errore di connessione al server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center page-padding">
      <div className="bg-white rounded-3xl p-10 border border-silver shadow-card w-full max-w-[400px]">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-full bg-[rgba(45,212,191,0.15)] flex items-center justify-center">
            <Lock className="text-brand-turquoise" size={24} />
          </div>
        </div>
        
        <h1 className="text-h3 text-center mb-2">Area Amministratore</h1>
        <p className="text-body text-sm text-center mb-8">Effettua il login per accedere alla dashboard</p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-label text-charcoal-deep mb-2 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-silver px-4 py-3 text-sm focus:outline-none focus:border-brand-turquoise"
              required
            />
          </div>
          <div>
            <label className="text-label text-charcoal-deep mb-2 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-silver px-4 py-3 text-sm focus:outline-none focus:border-brand-turquoise"
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="mt-4 rounded-pill bg-charcoal-deep text-white font-bold py-3 hover:bg-charcoal transition-colors disabled:opacity-50"
          >
            {loading ? 'Accesso in corso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  );
}
