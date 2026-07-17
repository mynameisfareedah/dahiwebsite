import { ArrowUpRight, Users, Calendar, BookOpen, Heart, MessageSquare } from 'lucide-react';

/**
 * StatCard Component
 * Displays a statistic with icon, label, and value
 */
export function StatCard({ icon: Icon, label, value, change, changeType = 'positive' }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-2">{label}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
          {change && (
            <p
              className={`text-xs mt-2 flex items-center gap-1 ${
                changeType === 'positive' ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <ArrowUpRight className="w-3 h-3" />
              {change}
            </p>
          )}
        </div>
        <div
          className={`p-3 rounded-lg ${
            changeType === 'positive'
              ? 'bg-blue-100 text-blue-600'
              : 'bg-red-100 text-red-600'
          }`}
        >
          {Icon && <Icon className="w-6 h-6" />}
        </div>
      </div>
    </div>
  );
}

/**
 * RecentActivityCard Component
 * Shows recent activity item
 */
export function RecentActivityCard({ title, description, timestamp, type = 'info' }) {
  const typeStyles = {
    info: 'bg-blue-50 border-blue-200',
    success: 'bg-green-50 border-green-200',
    warning: 'bg-amber-50 border-amber-200',
    error: 'bg-red-50 border-red-200',
  };

  return (
    <div className={`p-4 rounded-lg border ${typeStyles[type]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
        <p className="text-xs text-gray-500 ml-2">{timestamp}</p>
      </div>
    </div>
  );
}

/**
 * Welcome Message Component
 */
export function WelcomeSection({ userName }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900">
        {getGreeting()}, {userName || 'Admin'}! 👋
      </h1>
      <p className="text-gray-600 mt-2">
        Here's what's happening with your community today.
      </p>
    </div>
  );
}
