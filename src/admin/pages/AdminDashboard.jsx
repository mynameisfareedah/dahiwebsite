/**
 * Admin Dashboard
 * Main dashboard showing overview and statistics
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { Users, Calendar, BookOpen, Heart } from 'lucide-react';
import { useAdminProfile } from '../hooks/useAdminProfile';
import { countCommunityMembers, countPublishedResources, countUpcomingEvents, countVolunteers } from '../../services/supabase/adminStatsService';
import { auditTrailService } from '../services/auditTrailService';
import {
  StatCard,
  WelcomeSection,
  RecentActivityCard,
} from '../components/DashboardComponents';

export default function AdminDashboard() {
  const { displayName, loading: profileLoading, error: profileError } = useAdminProfile();
  console.log('Dashboard profileLoading:', profileLoading);
  const navigate = useNavigate();
  const [recentEntries, setRecentEntries] = useState([]);
  const [recentLoading, setRecentLoading] = useState(true);

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

  useEffect(() => {
    let mounted = true;

    const loadRecentEntries = async () => {
      setRecentLoading(true);
      const result = await auditTrailService.getRecentAuditEntries(10);
      if (!mounted) return;

      if (result.success) {
        setRecentEntries(result.data || []);
      } else {
        setRecentEntries([]);
      }
      setRecentLoading(false);
    };

    loadRecentEntries();

    return () => {
      mounted = false;
    };
  }, []);

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
              <button
                onClick={() => navigate('/admin/audit-trail')}
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </button>
            </div>

            {recentLoading ? (
              <p className="text-sm text-gray-500">Loading recent activity...</p>
            ) : recentEntries.length === 0 ? (
              <p className="text-sm text-gray-500">No activity has been logged yet.</p>
            ) : (
              <div className="space-y-3">
                {recentEntries.map((entry) => (
                  <RecentActivityCard
                    key={entry.id}
                    title={`${entry.action} • ${entry.module}`}
                    description={entry.description || 'No description provided.'}
                    timestamp={entry.createdAt ? new Date(entry.createdAt).toLocaleString() : 'Just now'}
                    type="info"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

