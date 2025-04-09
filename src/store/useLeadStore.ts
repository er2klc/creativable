
import { create } from 'zustand';
import { Tables } from '@/integrations/supabase/types';

interface LeadState {
  leads: Tables<"leads">[];
  selectedLeadId: string | null;
  setLeads: (leads: Tables<"leads">[]) => void;
  addLead: (lead: Tables<"leads">) => void;
  updateLead: (leadId: string, data: Partial<Tables<"leads">>) => void;
  deleteLead: (leadId: string) => void;
  archiveLead: (leadId: string) => void;
  setSelectedLeadId: (leadId: string | null) => void;
}

export const useLeadStore = create<LeadState>((set) => ({
  leads: [],
  selectedLeadId: null,
  
  setLeads: (leads) => set({ leads }),
  
  addLead: (lead) => set((state) => ({
    leads: [...state.leads, lead]
  })),
  
  updateLead: (leadId, data) => set((state) => ({
    leads: state.leads.map((lead) => 
      lead.id === leadId ? { ...lead, ...data } : lead
    )
  })),
  
  deleteLead: (leadId) => set((state) => ({
    leads: state.leads.filter((lead) => lead.id !== leadId),
    selectedLeadId: state.selectedLeadId === leadId ? null : state.selectedLeadId
  })),
  
  archiveLead: (leadId) => set((state) => ({
    leads: state.leads.map((lead) => 
      lead.id === leadId ? { ...lead, archived: true } : lead
    )
  })),
  
  setSelectedLeadId: (leadId) => set({ selectedLeadId: leadId }),
}));
