/**
 * Admin Dashboard
 * Main dashboard showing overview and statistics
 */

import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Users, Calendar, BookOpen, Heart } from 'lucide-react';
import { useAdminProfile } from '../hooks/useAdminProfile';
import { countCommunityMembers, countPublishedResources, countUpcomingEvents, countVolunteers } from '../../services/supabase/adminStatsService';
import {
  StatCard,
  WelcomeSection,
} from '../components/DashboardComponents';

export default function AdminDashboard() {
  const { displayName, loading: profileLoading, error: profileError } = useAdminProfile();
  console.log('Dashboard profileLoading:', profileLoading);
  const navigate = useNavigate();

  const statsConfig = useMemo(
    () => [
      {
        icon: Users,
        label: 'Community Members',
        queryKey: ['admin-count', 'community-members'],
        queryFn: countCommunityMembers,
      },
      {
        icon: Calendar,
        label: 'Upcoming Events',
        queryKey: ['admin-count', 'upcoming-events'],
        queryFn: countUpcomingEvents,
      },
      {
        icon: BookOpen,
        label: 'Resources Published',
        queryKey: ['admin-count', 'resources'],
        queryFn: countPublishedResources,
      },
      {
        icon: Heart,
        label: 'Volunteers Active',
        queryKey: ['admin-count', 'volunteers'],
        queryFn: countVolunteers,
      },
    ],
    []
  );

  const queryResults = useQueries({
    queries: statsConfig.map((stat) => ({
      queryKey: stat.queryKey,
      queryFn: stat.queryFn,
      staleTime: 1000 * 60 * 5,
    })),
  });

  const stats = useMemo(
    () => statsConfig
      .map((stat, index) => {
        const result = queryResults[index];
        if (!result || result.data?.count == null) return null;
        return {
          icon: stat.icon,
          label: stat.label,
          value: Intl.NumberFormat('en-US').format(result.data.count),
        };
      })
      .filter(Boolean),
    [queryResults, statsConfig]
  );

  return (
    <div className="p-6 lg:p-8">
      {/* Welcome Section */}
      <WelcomeSection userName={displayName} />
      {profileLoading ? (
        <p className="-mt-4 mb-6 text-sm text-gray-500">Loading your profile...</p>
      ) : null}
      {profileError ? (
        <p className="-mt-4 mb-6 text-sm text-amber-700">Unable to load profile details. Showing your email instead.</p>
      ) : null}

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/events')}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
              >
                Add Event
              </button>
              <button
                onClick={() => navigate('/admin/resources')}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                Add Resource
              </button>
              <button
                onClick={() => navigate('/admin/team')}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                Add Team Member
              </button>
              <button
                onClick={() => navigate('/admin/sponsors')}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                Add Sponsor
              </button>
              <button
                onClick={() => navigate('/admin/messages')}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                View Messages
              </button>
              <button
                onClick={() => navigate('/admin/settings')}
                className="w-full px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium text-sm"
              >
                Site Settings
              </button>
            </div>
          </div>
        </div>

        {/* Need Help */}
        <div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Need Help?</h2>
            <p className="text-sm text-gray-600 mb-4">
              Go back to the public website to see the community-facing content.
            </p>
            <a
              href="/"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Go Back to public website →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

