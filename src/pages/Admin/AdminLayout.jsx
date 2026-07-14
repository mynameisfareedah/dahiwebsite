import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, Files, Newspaper, Users, Mail, HandHeart, MessageSquareText, BarChart3, Settings, LogOut, Search } from 'lucide-react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import { toast } from 'react-hot-toast';

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
  { label: 'Settings', icon: Settings, to: '/admin/settings' },
  { label: 'Analytics', icon: BarChart3, to: '/admin/analytics' },
];

function AdminLayout() {
  const { user, signOut } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    toast.success('Signed out.');
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-700">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <aside className="w-full border-b border-slate-200 bg-slate-950 p-6 text-slate-100 lg:w-72 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between lg:block">
            <div>
              <div className="text-2xl font-black text-white">DAHI Admin</div>
              <p className="mt-2 text-sm text-slate-400">Content management portal</p>
            </div>
            <Link to="/" className="text-sm font-semibold text-dahiAccent lg:hidden">Public site</Link>
          </div>

          <nav className="mt-8 space-y-2" aria-label="Admin sidebar navigation">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={item.to} to={item.to} className={({ isActive }) => `flex items-center gap-3 rounded-[0.9rem] px-4 py-3 text-sm font-semibold transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-8 rounded-[1.25rem] border border-white/10 bg-white/10 p-4 text-sm text-slate-300">
            <div className="font-semibold text-white">{user?.email ?? 'Admin'}</div>
            <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-400">Signed in</div>
          </div>
        </aside>

        <div className="flex-1">
          <header className="border-b border-slate-200 bg-white px-6 py-4 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600">
                <Search size={16} />
                <span>Search content and data</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-dahiPrimary/10 px-3 py-2 text-sm font-semibold text-dahiPrimary">{user?.email ?? 'Admin'}</div>
                <button onClick={handleLogout} className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          </header>
          <main className="p-6 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

export default AdminLayout;
