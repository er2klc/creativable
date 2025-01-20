import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      }
    },
    db: {
      schema: 'public'
    },
    realtime: {
      params: {
        eventsPerSecond: 10
      }
    }
  }
);

// Add error handling through global fetch listener
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    return response;
  } catch (error) {
    console.error('Supabase request failed:', error);
    if (error.message === 'Failed to fetch') {
      console.error('Network error - please check your connection');
    }
    throw error;
  }
};