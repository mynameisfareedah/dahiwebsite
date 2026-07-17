import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  MessageSquare,
  Mail,
  Heart,
  Gift,
  Settings,
  ChevronDown,
  LogOut,
} from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { SIDEBAR_MENU } from '../utils/constants';

/**
 * Sidebar Component
 * Navigation menu for admin panel
 */
export function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAdminAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // Map icon names to actual icon components
  const iconMap = {
    LayoutDashboard,
    Calendar,
    BookOpen,
    Users,
    MessageSquare,
    Mail,
    Heart,
    Gift,
    Settings,
  };

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    setIsSigningOut(true);
    const { error } = await signOut();
    if (!error) {
      navigate('/admin/login', { replace: true });
    }
    setIsSigningOut(false);
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out z-50 lg:relative lg:transform-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1m0 20c-4.956 0-9-4.044-9-9s4.044-9 9-9 9 4.044 9 9-4.044 9-9 9m3.5-9c.828 0 1.5-.672 1.5-1.5S16.328 8.5 15.5 8.5 14 9.172 14 10s.672 1.5 1.5 1.5m-7 0c.828 0 1.5-.672 1.5-1.5S9.828 8.5 9 8.5 7.5 9.172 7.5 10 8.172 11.5 9 11.5m3.5 6.5c2.33 0 4.31-1.46 5.15-3.5H6.35c.84 2.04 2.82 3.5 5.15 3.5z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-sm">DAHI</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {SIDEBAR_MENU.map((item) => {
              const Icon = iconMap[item.icon];
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {Icon && <Icon className="w-5 h-5" />}
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout Section */}
        <div className="border-t border-gray-800 p-4">
          <button
            onClick={handleLogout}
            disabled={isSigningOut}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-800 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
