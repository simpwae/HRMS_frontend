import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore, roleNames } from '../state/auth';
import CECOSLogo from '../components/CECOSLogo';
import InputWithIcon from '../components/InputWithIcon';
import Button from '../components/Button';
import {
  UserIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowRightIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  BriefcaseIcon,
  Cog6ToothIcon,
  BanknotesIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';

const roleIcons = {
  employee: UserIcon,
  hr: UserGroupIcon,
  dean: AcademicCapIcon,
  hod: BuildingOfficeIcon,
  president: BriefcaseIcon,
  vc: BriefcaseIcon,
  admin: Cog6ToothIcon,
  finance: BanknotesIcon,
  oric: LightBulbIcon,
};

const roleDescriptions = {
  employee: 'View attendance, apply for leaves, check salary',
  hr: 'Manage employees, attendance, leaves, payroll',
  dean: 'Faculty oversight, leave approvals, analytics',
  hod: 'Department management, staff coordination',
  president: 'Final authority, medical leave approvals',
  vc: 'Executive oversight, university-wide analytics',
  admin: 'System configuration, user management',
  finance: 'Manage provident fund requests', // Add finance description
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, loginAsRole } = useAuthStore();

  const from = location.state?.from?.pathname || null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = login(email, password);

    if (result.success) {
      navigate(from || result.redirectTo, { replace: true });
    } else {
      setError(result.error || 'Invalid credentials');
    }

    setIsLoading(false);
  };

  const handleQuickLogin = async (role) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const redirectPath = loginAsRole(role);
    navigate(redirectPath, { replace: true });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-[hsl(var(--cecos-maroon))] via-[hsl(var(--cecos-navy))] to-[hsl(345,100%,15%)]" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-[hsl(var(--cecos-gold))] rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 text-white">
          <div className="mb-8">
            <CECOSLogo variant="full" size="xl" className="text-white" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold mb-4 leading-tight">
            Human Resource
            <br />
            Management System
          </h1>
          <p className="text-lg text-blue-100/80 max-w-md">
            Streamline your HR operations with our comprehensive management platform. Manage
            employees, track attendance, process leaves, and handle payroll efficiently.
          </p>

          <div className="mt-12 grid grid-cols-2 gap-4">
            <div className="glass-dark rounded-xl p-4">
              <p className="text-3xl font-bold text-white">500+</p>
              <p className="text-sm text-gray-400">Employees</p>
            </div>
            <div className="glass-dark rounded-xl p-4">
              <p className="text-3xl font-bold text-white">6</p>
              <p className="text-sm text-gray-400">Faculties</p>
            </div>
            <div className="glass-dark rounded-xl p-4">
              <p className="text-3xl font-bold text-white">24</p>
              <p className="text-sm text-gray-400">Departments</p>
            </div>
            <div className="glass-dark rounded-xl p-4">
              <p className="text-3xl font-bold text-white">99%</p>
              <p className="text-sm text-gray-400">Uptime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <CECOSLogo variant="full" size="lg" />
            <p className="mt-2 text-gray-500">Human Resource Management System</p>
          </div>

          <div className="glass rounded-2xl p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-500 mt-1">Sign in to access your portal</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address
                </label>
                <InputWithIcon
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@cecos.edu.pk"
                  inputClassName="pr-4 py-2.5"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <InputWithIcon
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  inputClassName="pr-12 py-2.5"
                  required
                >
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="w-5 h-5" />
                    ) : (
                      <EyeIcon className="w-5 h-5" />
                    )}
                  </button>
                </InputWithIcon>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-[hsl(var(--cecos-maroon))]"
                  />
                  <span className="text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-[hsl(var(--cecos-maroon))] hover:underline">
                  Forgot password?
                </a>
              </div>

              <Button type="submit" className="w-full py-2.5" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In
                    <ArrowRightIcon className="w-4 h-4" />
                  </span>
                )}
              </Button>
            </form>
          </div>

          {/* Quick Login Section */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gray-50 text-gray-500">Demo Quick Access</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
              {['employee', 'hr', 'hod', 'dean', 'president', 'vc', 'admin', 'finance', 'oric'].map(
                (role) => {
                  const Icon = roleIcons[role];
                  return (
                    <button
                      key={role}
                      onClick={() => handleQuickLogin(role)}
                      disabled={isLoading}
                      className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 bg-white hover:border-[hsl(var(--cecos-maroon))] hover:shadow-md transition-all group disabled:opacity-50"
                    >
                      <div className="p-2 rounded-lg bg-gray-100 group-hover:bg-[hsl(var(--cecos-maroon)/0.1)] transition-colors">
                        <Icon className="w-5 h-5 text-gray-600 group-hover:text-[hsl(var(--cecos-maroon))]" />
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {role === 'finance'
                          ? 'Finance'
                          : role === 'oric'
                            ? 'ORIC'
                            : roleNames[role]}
                      </span>
                    </button>
                  );
                },
              )}
            </div>

            <p className="mt-4 text-center text-xs text-gray-400">
              Click any role above for instant demo access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
