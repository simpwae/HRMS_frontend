import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../state/auth';
import CECOSLogo from '../../../components/CECOSLogo';
import InputWithIcon from '../../../components/InputWithIcon';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const switchRole = useAuthStore((s) => s.switchRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    // Mock login
    if (email && password) {
      login({ id: '1', name: 'Demo User', email, role: 'employee' });
      navigate('/employee');
    } else {
      setError('Invalid credentials');
    }
  };

  const handleDevLogin = (role) => {
    switchRole(role);
    navigate(`/${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1606761568499-6d2451b23c66?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center relative">
      <div className="absolute inset-0 bg-linear-to-br from-[#800020]/90 to-[#001F3F]/90 backdrop-blur-sm" />

      <div className="relative w-full max-w-md p-4 animate-fade-in">
        <div className="glass p-8 rounded-3xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex p-4 rounded-full bg-white/10 mb-4 backdrop-blur-md shadow-inner border border-white/10">
              <CECOSLogo variant="icon" size="lg" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-blue-100 mt-2">Sign in to CECOS HRMS</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">
                  Email Address
                </label>
                <InputWithIcon
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  inputClassName="pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                  placeholder="admin@cecos.edu.pk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-100 mb-1">Password</label>
                <div className="relative">
                  <InputWithIcon
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full"
                    inputClassName="pr-12 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-300 text-sm text-center bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-white text-[#800020] font-bold text-lg hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-[#800020] transition-all shadow-lg transform active:scale-95"
            >
              Sign In
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-xs text-blue-200 text-center mb-4 uppercase tracking-wider font-semibold">
              Development Access
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleDevLogin('hr')}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all"
              >
                HR Portal
              </button>
              <button
                onClick={() => handleDevLogin('vp')}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all"
              >
                VP Portal
              </button>
              <button
                onClick={() => handleDevLogin('dean')}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all"
              >
                Dean Portal
              </button>
              <button
                onClick={() => handleDevLogin('hod')}
                className="px-3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-medium border border-white/10 transition-all"
              >
                HOD Portal
              </button>
            </div>
          </div>
        </div>
        <p className="text-center text-blue-200/60 text-xs mt-6">
          © {new Date().getFullYear()} CECOS University. All rights reserved.
        </p>
      </div>
    </div>
  );
}
