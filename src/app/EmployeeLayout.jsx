import { Outlet } from 'react-router-dom';
import {
  UserCircleIcon,
  CalendarIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuthStore } from '../state/auth';
import CECOSLogo from '../components/CECOSLogo';

const navItems = [
  { path: '/employee', label: 'Dashboard', icon: UserCircleIcon },
  { path: '/employee/attendance', label: 'Attendance', icon: CalendarIcon },
  { path: '/employee/leave', label: 'Leave', icon: DocumentTextIcon },
  { path: '/employee/salary', label: 'Salary', icon: CurrencyDollarIcon },
];

export default function EmployeeLayout() {
  const navigate = useNavigate();
  const switchRole = useAuthStore((s) => s.switchRole);
  const user = useAuthStore((s) => s.user);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    navigate('/employee/login');
  };

  const handleSwitchToHR = () => {
    switchRole('hr');
    navigate('/hr');
  };

  return (
    <div data-portal="employee" className="min-h-screen bg-gray-50">
      {/* Top Nav */}
      <header className="bg-linear-to-r from-[#001F3F] to-[#001530] border-b border-gray-900 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CECOSLogo variant="icon" size="md" />
            <div>
              <h1 className="text-lg font-bold text-white">Employee Portal</h1>
              <p className="text-xs text-amber-300">CECOS University HRMS • Peshawar</p>
            </div>
          </div>
          <div className="flex gap-3">
            {/* Desktop Actions */}
            <button
              onClick={handleSwitchToHR}
              className="hidden sm:block text-sm text-blue-100 hover:text-white transition"
            >
              Switch to HR
            </button>
            <button
              onClick={handleLogout}
              className="hidden sm:flex text-sm text-blue-100 hover:text-white transition items-center gap-1"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" /> Logout
            </button>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/10 text-white"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#001F3F] to-[#800020] flex items-center justify-center text-white font-bold">
                  {user?.name?.charAt(0) || 'E'}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'Employee'}</p>
                  <p className="text-xs text-gray-500">Employee Portal</p>
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
                  end={path === '/employee'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                      isActive
                        ? 'bg-linear-to-r from-[#001F3F]/15 to-[#800020]/10 text-[#001F3F] border-l-4 border-[#800020]'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 border-t border-gray-200">
              <button
                onClick={() => {
                  handleSwitchToHR();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <UserCircleIcon className="w-5 h-5" />
                <span>Switch to HR</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <ArrowRightOnRectangleIcon className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar and Main Content */}
      <div className="flex h-[calc(100vh-64px)]">
        {/* Sidebar - Always visible on desktop */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <nav className="p-4 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                end={path === '/employee'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${isActive ? 'bg-linear-to-r from-[#001F3F]/15 to-[#800020]/10 text-[#001F3F] border-l-4 border-[#800020]' : 'text-gray-700 hover:bg-gray-50'}`
                }
              >
                <Icon className="w-5 h-5" />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile bottom nav removed: sidebar present */}
    </div>
  );
}
