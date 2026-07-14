import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { focusAreas, testimonials, teamMembers } from '../data/siteContent';

const fallbackDataByTable = {
  programs: focusAreas.map((item, index) => ({
    id: `fallback-program-${index}`,
    title: item.title,
    description: item.description,
  })),
  testimonials: testimonials.map((item, index) => ({
    id: `fallback-testimonial-${index}`,
    quote: item.quote,
    name: item.name || 'DAHI Participant',
    role: item.role,
  })),
  team_members: teamMembers.map((item, index) => ({
    id: `fallback-team-${index}`,
    name: item.name,
    role: item.role,
    position: item.role,
    bio: item.description,
    photo_url: '/docadi.jpeg',
  })),
};

export function useSupabaseData(table, select = '*', options = {}) {
  return useQuery({
    queryKey: [table, select],
    queryFn: async () => {
      if (!isSupabaseConfigured || !supabase) {
        return fallbackDataByTable[table] || [];
      }

      const { data, error } = await supabase
        .from(table)
        .select(select)
        .eq('status', 'Published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    ...options,
  });
}
