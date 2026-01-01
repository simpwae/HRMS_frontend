import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../state/auth';
import Button from '../../../components/Button';
import Card from '../../../components/Card';
import CECOSLogo from '../../../components/CECOSLogo';

export default function HRLogin() {
  const [email, setEmail] = useState('hr@university.com');
  const [password, setPassword] = useState('password');
  const navigate = useNavigate();
  const switchRole = useAuthStore((s) => s.switchRole);

  const handleLogin = (e) => {
    e.preventDefault();
    switchRole('hr');
    navigate('/hr');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-100 via-white to-amber-50">
      <Card className="w-full max-w-md">
        <div className="space-y-6">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CECOSLogo variant="icon" size="lg" />
            </div>
            <h2 className="text-2xl font-bold text-[#800020]">CECOS University</h2>
            <h3 className="text-lg font-semibold text-gray-900 mt-1">HR Management Portal</h3>
            <p className="mt-2 text-sm text-gray-600">Peshawar, Pakistan</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#800020] focus:ring-[#800020]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#800020] focus:ring-[#800020]"
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              className="w-full bg-[#003366] hover:bg-[#0066CC]"
            >
              Sign In
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
