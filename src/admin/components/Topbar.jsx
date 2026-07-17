import { useState } from 'react';
import { Menu, X, Bell, ChevronDown, LogOut } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import { useNavigate } from 'react-router-dom';

/**
 * Topbar Component
 * Top navigation with user profile and notifications
 */
export function Topbar({ onSidebarToggle, sidebarOpen }) {
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleLogout = async () => {
    setIsSigningOut(true);
    const { error } = await signOut();
    if (!error) {
      navigate('/admin/login', { replace: true });
    }
    setIsSigningOut(false);
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left Section - Menu Toggle */}
        <button
          onClick={onSidebarToggle}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
          aria-label="Toggle sidebar"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6 text-gray-600" />
          ) : (
            <Menu className="w-6 h-6 text-gray-600" />
          )}
        </button>

        {/* Spacer for desktop */}
        <div className="hidden lg:block flex-1" />

        {/* Right Section - Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile Menu */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 px-3 py-2 hover:bg-gray-100 rounded-lg transition"
            >
              {/* Avatar */}
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                {user?.email?.[0]?.toUpperCase() || 'A'}
              </div>

              {/* Name & Dropdown */}
              <div className="hidden sm:flex items-center gap-2">
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.user_metadata?.full_name || user?.email || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-gray-600 transition ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                {/* Profile Info */}
                <div className="px-4 py-3 border-b border-gray-200 sm:hidden">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.user_metadata?.full_name || user?.email || 'Admin'}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>

                {/* Menu Items */}
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/admin/profile');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  Profile
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/admin/settings');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  Settings
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigate('/admin/preferences');
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition"
                >
                  Preferences
                </button>

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Logout */}
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    handleLogout();
                  }}
                  disabled={isSigningOut}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                >
                  <LogOut className="w-4 h-4" />
                  {isSigningOut ? 'Signing out...' : 'Sign Out'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
