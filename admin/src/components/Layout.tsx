import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Bus,
  Navigation,
  MapPin,
  Calendar,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  Bell,
  Search,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Drivers', href: '/drivers', icon: UserCheck },
  { name: 'Buses', href: '/buses', icon: Bus },
  { name: 'Routes', href: '/routes', icon: Navigation },
  { name: 'Pickup Points', href: '/pickup-points', icon: MapPin },
  { name: 'Schedules', href: '/schedules', icon: Calendar },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme.background }}>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ backgroundColor: theme.surface }}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6" style={{ borderBottom: `1px solid ${theme.border}` }}>
            <div className="flex items-center">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center mr-3"
                style={{ backgroundColor: theme.primary }}
              >
                <Bus size={20} color="white" />
              </div>
              <h1 className="text-xl font-bold" style={{ color: theme.text }}>
                Ridra Admin
              </h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1"
              style={{ color: theme.textSecondary }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'text-white' 
                      : 'hover:opacity-80'
                    }
                  `}
                  style={{
                    backgroundColor: isActive ? theme.primary : 'transparent',
                    color: isActive ? 'white' : theme.text,
                  }}
                >
                  <Icon size={18} className="mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info */}
          <div className="p-4" style={{ borderTop: `1px solid ${theme.border}` }}>
            <div className="flex items-center mb-4">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center mr-3"
                style={{ backgroundColor: theme.primary }}
              >
                <span className="text-white font-semibold">
                  {user?.name?.charAt(0) || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: theme.text }}>
                  {user?.name}
                </p>
                <p className="text-xs truncate" style={{ color: theme.textSecondary }}>
                  {user?.email}
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg transition-colors"
                style={{ 
                  backgroundColor: theme.background,
                  color: theme.textSecondary 
                }}
              >
                {isDark ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{ 
                  backgroundColor: theme.error + '20',
                  color: theme.error 
                }}
              >
                <LogOut size={16} className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header 
          className="h-16 flex items-center justify-between px-6"
          style={{ 
            backgroundColor: theme.surface,
            borderBottom: `1px solid ${theme.border}`
          }}
        >
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg mr-4"
              style={{ color: theme.textSecondary }}
            >
              <Menu size={20} />
            </button>
            
            <div className="relative">
              <Search 
                size={16} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
                style={{ color: theme.textSecondary }}
              />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-opacity-50"
                style={{ 
                  backgroundColor: theme.background,
                  color: theme.text,
                  border: `1px solid ${theme.border}`,
                  outline: 'none',
                }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              className="p-2 rounded-lg relative"
              style={{ color: theme.textSecondary }}
            >
              <Bell size={20} />
              <span 
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs"
                style={{ backgroundColor: theme.error }}
              />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}