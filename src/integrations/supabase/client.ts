import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] Missing environment variables');
  throw new Error('Missing environment variables VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce'
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
    },
    // Add better error handling and retries
    fetch: (url, options = {}) => {
      return fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Cache-Control': 'no-cache',
        },
      }).catch(error => {
        console.error('[Supabase] Network error:', error);
        if (error.message === 'Failed to fetch') {
          console.error('[Supabase] Network error - please check your connection and Supabase configuration');
        }
        throw error;
      });
    }
  }
);

// Add error handling through global fetch listener
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  try {
    const response = await originalFetch(...args);
    if (!response.ok) {
      console.error('[Supabase] Request failed:', {
        url: args[0],
        status: response.status,
        statusText: response.statusText
      });
    }
    return response;
  } catch (error) {
    console.error('[Supabase] Network error:', error);
    if (error.message === 'Failed to fetch') {
      console.error('[Supabase] Network error - please check your connection');
    }
    throw error;
  }
};