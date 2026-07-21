import { supabase, isSupabaseConfigured, handleSupabaseError } from '../../lib/supabase';

/**
 * Volunteer Opportunities Service
 * Handles all CRUD operations for volunteer opportunities via Supabase
 */

const OPPORTUNITIES_BUCKET = 'volunteer-opportunities';

const resolveImageUrl = (imageValue) => {
  if (!imageValue) return null;
  if (/^https?:\/\//i.test(imageValue)) return imageValue;

  const { data } = supabase.storage.from(OPPORTUNITIES_BUCKET).getPublicUrl(imageValue);
  return data?.publicUrl || null;
};

const mapOpportunity = (opportunity) => {
  if (!opportunity) return null;

  return {
    ...opportunity,
    image_url: resolveImageUrl(opportunity.image_url),
  };
};

const mapOpportunities = (opportunities) =>
  Array.isArray(opportunities) ? opportunities.map(mapOpportunity) : [];

/**
 * Get all active volunteer opportunities (public)
 */
export async function getActiveVolunteerOpportunities() {
  try {
    if (!isSupabaseConfigured) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .select('*')
      .eq('active', true)
      .order('display_order', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching volunteer opportunities:', error);
      return { data: [], error: handleSupabaseError(error) };
    }

    return { data: mapOpportunities(data || []), error: null };
  } catch (err) {
    console.error('Error in getActiveVolunteerOpportunities:', err);
    return { data: [], error: handleSupabaseError(err) };
  }
}

/**
 * Get all volunteer opportunities (admin)
 */
export async function getAllVolunteerOpportunities() {
  try {
    if (!isSupabaseConfigured) {
      return { data: [], error: null };
    }

    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .select('*')
      .order('display_order', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching all volunteer opportunities:', error);
      return { data: [], error: handleSupabaseError(error) };
    }

    return { data: mapOpportunities(data || []), error: null };
  } catch (err) {
    console.error('Error in getAllVolunteerOpportunities:', err);
    return { data: [], error: handleSupabaseError(err) };
  }
}

/**
 * Get volunteer opportunity by slug
 */
export async function getOpportunityBySlug(slug) {
  try {
    if (!isSupabaseConfigured) {
      return { data: null, error: null };
    }

    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      console.error('Error fetching opportunity by slug:', error);
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: mapOpportunity(data), error: null };
  } catch (err) {
    console.error('Error in getOpportunityBySlug:', err);
    return { data: null, error: handleSupabaseError(err) };
  }
}

/**
 * Create volunteer opportunity (admin)
 */
export async function createVolunteerOpportunity(opportunityData) {
  try {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .insert([opportunityData])
      .select()
      .single();

    if (error) {
      console.error('Error creating volunteer opportunity:', error);
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: mapOpportunity(data), error: null };
  } catch (err) {
    console.error('Error in createVolunteerOpportunity:', err);
    return { data: null, error: handleSupabaseError(err) };
  }
}

/**
 * Update volunteer opportunity (admin)
 */
export async function updateVolunteerOpportunity(id, updates) {
  try {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Supabase not configured' };
    }

    const { data, error } = await supabase
      .from('volunteer_opportunities')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating volunteer opportunity:', error);
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: mapOpportunity(data), error: null };
  } catch (err) {
    console.error('Error in updateVolunteerOpportunity:', err);
    return { data: null, error: handleSupabaseError(err) };
  }
}

/**
 * Delete volunteer opportunity (admin)
 */
export async function deleteVolunteerOpportunity(id) {
  try {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase not configured' };
    }

    const { error } = await supabase
      .from('volunteer_opportunities')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting volunteer opportunity:', error);
      return { error: handleSupabaseError(error) };
    }

    return { error: null };
  } catch (err) {
    console.error('Error in deleteVolunteerOpportunity:', err);
    return { error: handleSupabaseError(err) };
  }
}

/**
 * Upload opportunity image
 */
export async function uploadOpportunityImage(file, opportunityId) {
  try {
    if (!isSupabaseConfigured) {
      return { data: null, error: 'Supabase not configured' };
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${opportunityId}_${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(OPPORTUNITIES_BUCKET)
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error('Error uploading opportunity image:', error);
      return { data: null, error: handleSupabaseError(error) };
    }

    return { data: fileName, error: null };
  } catch (err) {
    console.error('Error in uploadOpportunityImage:', err);
    return { data: null, error: handleSupabaseError(err) };
  }
}

/**
 * Delete opportunity image
 */
export async function deleteOpportunityImage(fileName) {
  try {
    if (!isSupabaseConfigured) {
      return { error: 'Supabase not configured' };
    }

    const { error } = await supabase.storage
      .from(OPPORTUNITIES_BUCKET)
      .remove([fileName]);

    if (error) {
      console.error('Error deleting opportunity image:', error);
      return { error: handleSupabaseError(error) };
    }

    return { error: null };
  } catch (err) {
    console.error('Error in deleteOpportunityImage:', err);
    return { error: handleSupabaseError(err) };
  }
}
