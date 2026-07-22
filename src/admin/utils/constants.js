/**
 * Admin Panel Constants
 */

export const ADMIN_ROUTES = {
  LOGIN: '/admin/login',
  DASHBOARD: '/admin',
  EVENTS: '/admin/events',
  RESOURCES: '/admin/resources',
  TEAM: '/admin/team',
  COMMUNITY: '/admin/community',
  MESSAGES: '/admin/messages',
  VOLUNTEERS: '/admin/volunteers',
  VOLUNTEER_APPLICATIONS: '/admin/volunteer-applications',
  SPONSORS: '/admin/sponsors',
  DONATIONS: '/admin/donations',
  PROFILE: '/admin/profile',
  USERS: '/admin/users',
  SETTINGS: '/admin/settings',
  AUDIT_TRAIL: '/admin/audit-trail',
};

export const SIDEBAR_MENU = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: ADMIN_ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
  },
  {
    id: 'profile',
    label: 'Profile',
    path: ADMIN_ROUTES.PROFILE,
    icon: 'User',
  },
  {
    id: 'users',
    label: 'Admin Users',
    path: ADMIN_ROUTES.USERS,
    icon: 'Users',
  },
  {
    id: 'audit-trail',
    label: 'Audit Trail',
    path: ADMIN_ROUTES.AUDIT_TRAIL,
    icon: 'BookOpen',
  },
  {
    id: 'events',
    label: 'Events',
    path: ADMIN_ROUTES.EVENTS,
    icon: 'Calendar',
  },
  {
    id: 'team',
    label: 'Team Members',
    path: ADMIN_ROUTES.TEAM,
    icon: 'Users',
  },
  {
    id: 'volunteers',
    label: 'Volunteers',
    path: ADMIN_ROUTES.VOLUNTEERS,
    icon: 'Heart',
  },
  {
    id: 'volunteer_applications',
    label: 'Volunteer Applications',
    path: ADMIN_ROUTES.VOLUNTEER_APPLICATIONS,
    icon: 'Users',
  },
  {
    id: 'donations',
    label: 'Donations',
    path: ADMIN_ROUTES.DONATIONS,
    icon: 'Gift',
  },
  {
    id: 'sponsors',
    label: 'Sponsors',
    path: ADMIN_ROUTES.SPONSORS,
    icon: 'Gift',
  },
  {
    id: 'resources',
    label: 'Resources',
    path: ADMIN_ROUTES.RESOURCES,
    icon: 'BookOpen',
  },
  {
    id: 'community',
    label: 'Community',
    path: ADMIN_ROUTES.COMMUNITY,
    icon: 'MessageSquare',
  },
  {
    id: 'messages',
    label: 'Messages',
    path: ADMIN_ROUTES.MESSAGES,
    icon: 'Mail',
  },
  {
    id: 'settings',
    label: 'Settings',
    path: ADMIN_ROUTES.SETTINGS,
    icon: 'Settings',
  },
];

export const STORAGE_KEYS = {
  AUTH_SESSION: 'admin_auth_session',
  USER_PREFERENCES: 'admin_user_preferences',
};
