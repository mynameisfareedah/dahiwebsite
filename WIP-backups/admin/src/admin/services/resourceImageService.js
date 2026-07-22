import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const STORAGE_BUCKET =
  import.meta.env.VITE_SUPABASE_STORAGE_BUCKET ||
  import.meta.env.VITE_SUPABASE_RESOURCES_BUCKET ||
  'resources';

const MAX_RESOURCE_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_RESOURCE_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

function buildStorageError(error) {
  if (!error) return null;

  const message = String(error.message || error.msg || error.code || '');
  if (message.toLowerCase().includes('bucket not found')) {
    return {
      message:
        `Supabase storage bucket "${STORAGE_BUCKET}" was not found. ` +
        'Create the bucket in the Supabase dashboard or set VITE_SUPABASE_STORAGE_BUCKET in .env.local.',
    };
  }

  return error;
}

export function getResourceImageStorageBucket() {
  return STORAGE_BUCKET;
}

export function getResourceImagePathFromUrl(publicUrl) {
  if (!publicUrl) return null;

  try {
    const parsed = new URL(publicUrl);
    const segments = parsed.pathname.split('/').filter(Boolean);
    const publicIndex = segments.indexOf('public');
    if (publicIndex >= 0 && segments[publicIndex + 1]) {
      return decodeURIComponent(segments.slice(publicIndex + 2).join('/'));
    }
  } catch {
    return null;
  }

  return null;
}

export async function uploadResourceCoverImage(file) {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured.');
  }

  if (!file) {
    throw new Error('Please choose an image to upload.');
  }

  if (!ALLOWED_RESOURCE_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Only PNG, JPEG, and WEBP images are supported.');
  }

  if (file.size > MAX_RESOURCE_IMAGE_SIZE_BYTES) {
    throw new Error('Image is too large. Maximum allowed size is 5MB.');
  }

  const safeName = (file.name || 'cover-image')
    .toLowerCase()
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const extension = safeName.includes('.') ? safeName.slice(safeName.lastIndexOf('.')) : '.jpg';
  const uniqueSuffix =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const filePath = `${Date.now()}-${uniqueSuffix}${extension}`;

  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
  });

  if (error) {
    throw buildStorageError(error);
  }

  const publicUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath).data?.publicUrl || null;
  if (!publicUrl) {
    throw new Error('The cover image upload completed, but a public URL could not be generated.');
  }

  return {
    publicUrl,
    storagePath: data?.path || filePath,
  };
}

export async function deleteResourceCoverImage(publicUrl) {
  if (!publicUrl || !isSupabaseConfigured || !supabase) {
    return null;
  }

  const storagePath = getResourceImagePathFromUrl(publicUrl);
  if (!storagePath) {
    return null;
  }

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
  if (error) {
    throw buildStorageError(error);
  }

  return true;
}
