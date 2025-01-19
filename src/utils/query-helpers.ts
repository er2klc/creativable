import { supabase } from "@/integrations/supabase/client";

export const getLeadWithRelations = async (leadId: string) => {
  console.log('[getLeadWithRelations] Starting fetch for lead:', leadId);
  
  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      messages (*),
      tasks (*),
      notes (*)
    `)
    .eq("id", leadId)
    .maybeSingle();

  if (error) {
    console.error('[getLeadWithRelations] Error fetching lead:', error);
    throw error;
  }

  console.log('[getLeadWithRelations] Data fetched:', {
    id: data?.id,
    messages: data?.messages?.length || 0,
    tasks: data?.tasks?.length || 0,
    notes: data?.notes?.length || 0,
    timestamp: new Date().toISOString()
  });

  return data;
};

export const getLeadsWithRelations = async () => {
  console.log('[getLeadsWithRelations] Starting fetch');
  
  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      messages (*),
      tasks (*),
      notes (*)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getLeadsWithRelations] Error fetching leads:', error);
    throw error;
  }

  console.log('[getLeadsWithRelations] Data fetched:', {
    count: data?.length || 0,
    timestamp: new Date().toISOString()
  });

  return data;
};