import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Files, Newspaper, Users, Mail, HandHeart, MessageSquareText, BarChart3, Search } from 'lucide-react';
import StatCard from '../../components/admin/StatCard';
import SectionHeader from '../../components/admin/SectionHeader';
import { loadCollection } from '../../utils/adminData';

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
  const programs = loadCollection('dahi-programs', []);
  const events = loadCollection('dahi-events', []);
  const resources = loadCollection('dahi-resources', []);
  const blog = loadCollection('dahi-blog', []);
  const team = loadCollection('dahi-team', []);
  const subscribers = loadCollection('dahi-subscribers', []);
  const volunteers = loadCollection('dahi-volunteers', []);
  const messages = loadCollection('dahi-messages', []);

  const stats = useMemo(() => [
    { label: 'Programs', value: programs.filter((item) => item.status !== 'Draft').length, hint: 'Published programs', accent: 'bg-dahiPrimary/10 text-dahiPrimary' },
    { label: 'Upcoming Events', value: events.filter((item) => new Date(item.date) >= new Date()).length, hint: 'Scheduled events', accent: 'bg-dahiSecondary/10 text-dahiSecondary' },
    { label: 'Resources', value: resources.filter((item) => item.status !== 'Draft').length, hint: 'Live resources', accent: 'bg-dahiAccent/20 text-dahiAccent' },
    { label: 'Blog Posts', value: blog.filter((item) => item.status !== 'Draft').length, hint: 'Published articles', accent: 'bg-emerald-100 text-emerald-700' },
    { label: 'Team Members', value: team.filter((item) => item.active !== false).length, hint: 'Active listing', accent: 'bg-amber-100 text-amber-700' },
    { label: 'Subscribers', value: subscribers.length, hint: 'Newsletter list', accent: 'bg-rose-100 text-rose-700' },
    { label: 'Volunteers', value: volunteers.length, hint: 'Pending applications', accent: 'bg-sky-100 text-sky-700' },
    { label: 'Messages', value: messages.length, hint: 'Contact enquiries', accent: 'bg-violet-100 text-violet-700' },
  ], [blog, events, messages, programs, resources, subscribers.length, team, volunteers]);

  return (
    <div className="space-y-8">
      <SectionHeader title="Admin Dashboard" description="Overview of the DAHI website and content activity." action={<div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600"><Search size={16} /> <span>Global search coming soon</span></div>} />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (<StatCard key={stat.label} {...stat} />))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
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
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900">Recent activity</h3>
          <ul className="mt-6 space-y-4 text-sm text-slate-600">
            <li className="rounded-[1rem] border border-slate-200 p-4">New program drafts and events can be created from the dashboard.</li>
            <li className="rounded-[1rem] border border-slate-200 p-4">Resources and blog posts support publishing workflows and visibility controls.</li>
            <li className="rounded-[1rem] border border-slate-200 p-4">Messages and volunteer applications can be reviewed and exported.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
