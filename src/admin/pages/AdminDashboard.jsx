/**
 * Admin Dashboard
 * Main dashboard showing overview and statistics
 */

import { Users, Calendar, BookOpen, Heart, MessageSquare, TrendingUp } from 'lucide-react';
import { useAdminAuth } from '../hooks/useAdminAuth';
import {
  StatCard,
  RecentActivityCard,
  WelcomeSection,
} from '../components/DashboardComponents';

export default function AdminDashboard() {
  const { user } = useAdminAuth();

  // Mock data for dashboard
  const stats = [
    {
      icon: Users,
      label: 'Community Members',
      value: '2,543',
      change: '+12% from last month',
    },
    {
      icon: Calendar,
      label: 'Upcoming Events',
      value: '8',
      change: '+2 events this week',
    },
    {
      icon: BookOpen,
      label: 'Resources Published',
      value: '34',
      change: '+5 this month',
    },
    {
      icon: Heart,
      label: 'Volunteers Active',
      value: '142',
      change: '+8 new volunteers',
    },
  ];

  const recentActivity = [
    {
      title: 'New Community Member',
      description: 'Fatima Ahmed joined the community',
      timestamp: '2 hours ago',
      type: 'success',
    },
    {
      title: 'Event Created',
      description: 'August Community Health Outreach scheduled',
      timestamp: '5 hours ago',
      type: 'info',
    },
    {
      title: 'Resource Published',
      description: 'New guide on menstrual health published',
      timestamp: '1 day ago',
      type: 'success',
    },
    {
      title: 'Volunteer Application',
      description: 'New volunteer application received',
      timestamp: '2 days ago',
      type: 'info',
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome Section */}
      <WelcomeSection userName={user?.user_metadata?.full_name || user?.email} />

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <RecentActivityCard key={index} {...activity} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                Create Event
              </button>
              <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
                Add Resource
              </button>
              <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
                Manage Team
              </button>
              <button className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm">
                View Messages
              </button>
            </div>

            {/* Help Card */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-sm text-blue-900 mb-2">Need Help?</h3>
              <p className="text-xs text-blue-800 mb-3">
                Check out the documentation to learn more about managing your community.
              </p>
              <a
                href="/"
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                View Documentation →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

