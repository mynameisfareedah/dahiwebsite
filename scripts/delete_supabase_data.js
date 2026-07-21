import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve(process.cwd(), '.env.local');
const envText = fs.readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(envText
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#') && line.includes('='))
  .map((line) => {
    const [key, ...rest] = line.split('=');
    return [key.trim(), rest.join('=').trim()];
  })
);

const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
}

const supabase = createClient(url, key);

async function deleteTable(table) {
  const { error } = await supabase.from(table).delete().neq('id', '');
  if (error) {
    console.error(`Failed to delete from ${table}:`, error.message);
    process.exitCode = 1;
    return;
  }
  console.log(`Deleted all rows from ${table}`);
}

async function main() {
  await deleteTable('resources');
  await deleteTable('volunteers');
  await deleteTable('events');
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});