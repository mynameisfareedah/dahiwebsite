import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQueries } from '@tanstack/react-query';
import { LayoutDashboard, CalendarDays, Files, Newspaper, Users, Mail, HandHeart, MessageSquareText, BarChart3 } from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import SectionHeader from '../../components/admin/SectionHeader';
import { countCommunityMembers, countMessages, countPublishedResources, countSponsors, countUpcomingEvents, countVolunteers, countActiveTeamMembers } from '../../services/supabase/adminStatsService';

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/admin' },
  { label: 'Programs', icon: Files, to: '/admin/programs' },
  { label: 'Events', icon: CalendarDays, to: '/admin/events' },
  { label: 'Resources', icon: Files, to: '/admin/resources' },
  { label: 'Blog', icon: Newspaper, to: '/admin/blog' },
  { label: 'Team', icon: Users, to: '/admin/team' },
  { label: 'Testimonials', icon: MessageSquareText, to: '/admin/testimonials' },
  { label: 'Newsletter', icon: Mail, to: '/admin/newsletter' },
  { label: 'Volunteers', icon: HandHeart, to: '/admin/volunteers' },
  { label: 'Contact Messages', icon: MessageSquareText, to: '/admin/messages' },
  { label: 'Analytics', icon: BarChart3, to: '/admin/analytics' },
];

function AdminDashboardPage() {
  const statsConfig = [
    {
      label: 'Upcoming Events',
      hint: 'Scheduled events',
      accent: 'bg-dahiSecondary/10 text-dahiSecondary',
      queryKey: ['admin-count', 'upcoming-events'],
      queryFn: countUpcomingEvents,
    },
    {
      label: 'Resources',
      hint: 'Live resources',
      accent: 'bg-dahiAccent/20 text-dahiAccent',
      queryKey: ['admin-count', 'resources'],
      queryFn: countPublishedResources,
    },
    {
      label: 'Team Members',
      hint: 'Active listing',
      accent: 'bg-amber-100 text-amber-700',
      queryKey: ['admin-count', 'team-members'],
      queryFn: countActiveTeamMembers,
    },
    {
      label: 'Volunteers',
      hint: 'Pending applications',
      accent: 'bg-sky-100 text-sky-700',
      queryKey: ['admin-count', 'volunteers'],
      queryFn: countVolunteers,
    },
    {
      label: 'Sponsors',
      hint: 'Active sponsors',
      accent: 'bg-emerald-100 text-emerald-700',
      queryKey: ['admin-count', 'sponsors'],
      queryFn: countSponsors,
    },
    {
      label: 'Community Members',
      hint: 'Active community',
      accent: 'bg-violet-100 text-violet-700',
      queryKey: ['admin-count', 'community-members'],
      queryFn: countCommunityMembers,
    },
    {
      label: 'Messages',
      hint: 'Contact enquiries',
      accent: 'bg-fuchsia-100 text-fuchsia-700',
      queryKey: ['admin-count', 'messages'],
      queryFn: countMessages,
    },
  ];

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
          label: stat.label,
          value: result.data.count,
          hint: stat.hint,
          accent: stat.accent,
        };
      })
      .filter(Boolean),
    [queryResults, statsConfig]
  );

  return (
    <div className="space-y-8">
      <SectionHeader title="Admin Dashboard" description="Overview of the DAHI website and content activity." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (<StatCard key={stat.label} {...stat} />))}
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-xl font-bold text-slate-900">Quick access</h3>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {navigation.slice(1, 7).map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.to} to={item.to} className="flex items-center gap-3 rounded-[1rem] border border-slate-200 p-4 transition hover:border-dahiPrimary hover:bg-slate-50">
                <div className="rounded-full bg-dahiPrimary/10 p-2 text-dahiPrimary"><Icon size={18} /></div>
                <span className="font-semibold text-slate-700">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
