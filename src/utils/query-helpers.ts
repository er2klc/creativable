import { supabase } from "@/integrations/supabase/client";

export const getLeadWithRelations = async (leadId: string) => {
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

  if (error) throw error;
  return data;
};

export const getLeadsWithRelations = async () => {
  const { data, error } = await supabase
    .from("leads")
    .select(`
      *,
      messages (*),
      tasks (*),
      notes (*)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};