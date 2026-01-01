import { Outlet } from 'react-router-dom';
import {
  UsersIcon,
  CalendarIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuthStore } from '../state/auth';
import CECOSLogo from '../components/CECOSLogo';

const navItems = [
  { path: '/hr', label: 'Dashboard', icon: UsersIcon },
  { path: '/hr/employees', label: 'Employees', icon: UsersIcon },
  { path: '/hr/attendance', label: 'Attendance', icon: CalendarIcon },
  { path: '/hr/leaves', label: 'Leaves', icon: DocumentTextIcon },
];

export default function HRLayout() {
  const navigate = useNavigate();
  const switchRole = useAuthStore((s) => s.switchRole);
  const user = useAuthStore((s) => s.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    navigate('/hr/login');
  };

  const handleSwitchToEmployee = () => {
    switchRole('employee');
    navigate('/employee');
  };

  return (
    <div data-portal="hr" className="min-h-screen flex flex-col lg:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 glass-dark border-r border-white/10 z-20">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <CECOSLogo variant="icon" size="md" />
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">HR Portal</h1>
              <p className="text-xs text-blue-200/80">CECOS University</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/hr'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-linear-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] text-white shadow-lg shadow-blue-900/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <button
            onClick={handleSwitchToEmployee}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <UsersIcon className="w-5 h-5" /> Switch to Employee
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden glass sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-gray-200/50">
          <div className="flex items-center gap-2">
            <CECOSLogo variant="icon" size="sm" />
            <span className="font-bold text-gray-900">HR Portal</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <Bars3Icon className="w-6 h-6 text-gray-700" />
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] glass-dark">
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] flex items-center justify-center text-white font-bold">
                    {user?.name?.charAt(0) || 'H'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.name || 'HR User'}</p>
                    <p className="text-xs text-gray-400">HR Portal</p>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {navItems.map(({ path, label, icon: Icon }) => (
                  <NavLink
                    key={path}
                    to={path}
                    end={path === '/hr'}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-linear-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] text-white'
                          : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`
                    }
                  >
                    <Icon className="w-5 h-5" />
                    <span>{label}</span>
                  </NavLink>
                ))}
              </nav>

              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 border-t border-white/10">
                <button
                  onClick={() => {
                    handleSwitchToEmployee();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5"
                >
                  <UsersIcon className="w-5 h-5" />
                  <span>Switch to Employee</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                  <ArrowRightOnRectangleIcon className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </div>

        {/* Mobile Bottom Nav removed: sidebar present */}
      </main>
    </div>
  );
}
