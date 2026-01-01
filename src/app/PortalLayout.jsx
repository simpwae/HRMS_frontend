import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  BellIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useState, Fragment } from 'react';
import { useAuthStore, portalRoutes, roleNames } from '../state/auth';
import CECOSLogo from '../components/CECOSLogo';

/**
 * PortalLayout - Unified layout component for all portals
 *
 * @param {string} portalKey - Portal identifier (employee, hr, vp, dean, hod, admin)
 * @param {string} portalName - Display name for the portal
 * @param {Array} navItems - Navigation items [{path, label, icon}]
 * @param {Array} switchableRoles - Roles user can switch to from this portal
 */
export default function PortalLayout({
  portalKey,
  portalName,
  navItems = [],
  switchableRoles = [],
  children,
}) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const { user, activeRole, logout, switchRole, getAvailableRoles } = useAuthStore();
  const availableRoles = getAvailableRoles().filter((r) => r !== activeRole);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleSwitch = (role) => {
    const redirectPath = switchRole(role);
    if (redirectPath) {
      navigate(redirectPath);
    }
    setProfileMenuOpen(false);
  };

  return (
    <div data-portal={portalKey} className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 glass-dark fixed inset-y-0 left-0 z-30">
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <CECOSLogo variant="icon" size="md" />
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">{portalName}</h1>
              <p className="text-xs text-blue-200/80">CECOS University</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ path, label, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-linear-to-r from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-white/10 space-y-2">
          {/* User Info */}
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{roleNames[activeRole]}</p>
            </div>
          </div>

          {/* Role Switcher */}
          {availableRoles.length > 0 && (
            <div className="px-2">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">
                Switch Role
              </p>
              {availableRoles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleSwitch(role)}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all"
                >
                  <UserCircleIcon className="w-4 h-4" />
                  <span>{roleNames[role]}</span>
                </button>
              ))}
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen">
        {/* Top Header - Desktop */}
        <header className="hidden lg:flex glass sticky top-0 z-20 px-8 py-4 items-center justify-between border-b border-gray-200/50">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome back, {user?.name?.split(' ')[0]}
            </h2>
            <p className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <BellIcon className="w-6 h-6 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-[hsl(var(--color-primary))] to-[hsl(var(--color-secondary))] flex items-center justify-center text-white text-sm font-bold">
                  {user?.name?.charAt(0) || 'U'}
                </div>
                <ChevronDownIcon className="w-4 h-4 text-gray-600" />
              </button>

              {profileMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-lg ring-1 ring-black/5 z-20 py-2">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    {availableRoles.length > 0 && (
                      <div className="py-2 border-b border-gray-100">
                        <p className="px-4 py-1 text-xs text-gray-400 uppercase">Switch Role</p>
                        {availableRoles.map((role) => (
                          <button
                            key={role}
                            onClick={() => handleRoleSwitch(role)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                          >
                            {roleNames[role]}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Header */}
        <header className="lg:hidden glass sticky top-0 z-30 px-4 py-3 flex items-center justify-between border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <CECOSLogo variant="icon" size="sm" />
            <span className="font-bold text-gray-900">{portalName}</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-lg hover:bg-gray-100">
              <BellIcon className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <Bars3Icon className="w-6 h-6 text-gray-700" />
            </button>
          </div>
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
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400">{roleNames[activeRole]}</p>
                  </div>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-400">
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <nav className="p-4 space-y-1">
                {navItems.map(({ path, label, icon: Icon, end }) => (
                  <NavLink
                    key={path}
                    to={path}
                    end={end}
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

              {availableRoles.length > 0 && (
                <div className="px-4 py-2 border-t border-white/10">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">
                    Switch Role
                  </p>
                  {availableRoles.map((role) => (
                    <button
                      key={role}
                      onClick={() => {
                        handleRoleSwitch(role);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-white/5"
                    >
                      <UserCircleIcon className="w-4 h-4" />
                      <span>{roleNames[role]}</span>
                    </button>
                  ))}
                </div>
              )}

              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
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

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">{children || <Outlet />}</div>
        </div>

        {/* Mobile Bottom Nav removed: sidebar present */}
      </main>
    </div>
  );
}
