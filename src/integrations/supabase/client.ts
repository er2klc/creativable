
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://nqahuocznyiqphgoktid.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5xYWh1b2N6bnlpcXBoZ29rdGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxOTYwMDQsImV4cCI6MjA2NTc3MjAwNH0.s_6M1zp6Mn9Gz_ISEZMTECx18PsaW89qz2mY4WWkWnw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
