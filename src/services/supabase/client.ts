import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/supabase';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase configuration missing!');
  console.error('Make sure .env.local file exists with proper values');
  throw new Error('Supabase URL and Anon Key are required. Check your .env.local file.');
}

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

// Supabase Storage helper functions
export const getPublicUrl = (bucket: string, path: string): string => {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Other helper functions
export const getServiceVersion = async (): Promise<string> => {
  const { data, error } = await supabase.rpc('get_service_version');
  
  if (error) {
    console.error('Error getting service version:', error);
    return 'unknown';
  }
  
  return data;
};
