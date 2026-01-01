import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import CECOSLogo from './CECOSLogo';

// Example sidebar items prop: [{ label, icon: <Icon/>, to }]
export default function PortalLayout({ sidebarItems = [], children, user, topbarContent }) {
  const location = useLocation();
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col">
        <div className="h-20 flex items-center justify-center border-b">
          <CECOSLogo className="h-10" />
        </div>
        <nav className="flex-1 py-4">
          {sidebarItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 transition font-medium ${location.pathname === item.to ? 'bg-gray-100 border-l-4 border-blue-600 text-blue-700' : ''}`}
            >
              {item.icon && <span className="mr-3 h-5 w-5">{item.icon}</span>}
              {item.label}
            </Link>
          ))}
        </nav>
        {user && (
          <div className="p-4 border-t flex items-center space-x-3">
            {user.avatar && (
              <img src={user.avatar} alt="avatar" className="h-10 w-10 rounded-full" />
            )}
            <div>
              <div className="font-semibold text-gray-800">{user.name}</div>
              <div className="text-xs text-gray-500">{user.role}</div>
            </div>
          </div>
        )}
      </aside>
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-16 bg-white border-b flex items-center px-6 justify-between">
          <div className="font-bold text-lg text-blue-700">Portal</div>
          {topbarContent}
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
