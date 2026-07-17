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
  SPONSORS: '/admin/sponsors',
  SETTINGS: '/admin/settings',
};

export const SIDEBAR_MENU = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: ADMIN_ROUTES.DASHBOARD,
    icon: 'LayoutDashboard',
  },
  {
    id: 'events',
    label: 'Events',
    path: ADMIN_ROUTES.EVENTS,
    icon: 'Calendar',
  },
  {
    id: 'resources',
    label: 'Resources',
    path: ADMIN_ROUTES.RESOURCES,
    icon: 'BookOpen',
  },
  {
    id: 'team',
    label: 'Team',
    path: ADMIN_ROUTES.TEAM,
    icon: 'Users',
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
    id: 'volunteers',
    label: 'Volunteers',
    path: ADMIN_ROUTES.VOLUNTEERS,
    icon: 'Heart',
  },
  {
    id: 'sponsors',
    label: 'Sponsors',
    path: ADMIN_ROUTES.SPONSORS,
    icon: 'Gift',
  },
  {
    id: 'settings',
    label: 'Website Settings',
    path: ADMIN_ROUTES.SETTINGS,
    icon: 'Settings',
  },
];

export const STORAGE_KEYS = {
  AUTH_SESSION: 'admin_auth_session',
  USER_PREFERENCES: 'admin_user_preferences',
};
