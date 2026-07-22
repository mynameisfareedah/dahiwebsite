import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const bucket = process.env.VITE_SUPABASE_STORAGE_BUCKET || process.env.VITE_SUPABASE_RESOURCES_BUCKET || 'resources';

console.log('Supabase URL:', supabaseUrl);
console.log('Bucket:', bucket);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase env vars');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

const filePath = `test-upload-${Date.now()}.png`;
const data = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAGgwJ/lFgKAAAAAElFTkSuQmCC', 'base64');

async function run() {
  try {
    const { data: result, error } = await supabase.storage.from(bucket).upload(filePath, data, {
      cacheControl: '3600',
      upsert: false,
      contentType: 'image/png',
    });
    console.log('Upload result:', result);
    console.log('Upload error:', error);

    if (error) {
      process.exitCode = 1;
      return;
    }

    const { data: urlData, error: urlError } = supabase.storage.from(bucket).getPublicUrl(filePath);
    console.log('Public URL data:', urlData);
    console.log('Public URL error:', urlError);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exitCode = 1;
  }
}

run();
