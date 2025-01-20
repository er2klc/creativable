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
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'X-Client-Info': 'supabase-js-web'
      },
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          credentials: 'include',
          headers: {
            ...options.headers,
            'Cache-Control': 'no-cache',
          }
        }).catch(error => {
          console.error('Supabase request failed:', {
            url,
            error,
            method: options.method || 'GET'
          });
          throw error;
        });
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
    if (!response.ok) {
      console.error('HTTP Error Response:', {
        status: response.status,
        statusText: response.statusText,
        url: args[0]
      });
    }
    return response;
  } catch (error) {
    console.error('Supabase request failed:', error);
    if (error.message === 'Failed to fetch') {
      console.error('Network error - please check your connection');
    }
    throw error;
  }
};