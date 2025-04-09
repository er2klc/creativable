
import { create } from 'zustand';
import { Tables } from '@/integrations/supabase/types';

interface LeadStore {
  leads: Tables<"leads">[];
  selectedLeadId: string | null;
  setLeads: (leads: Tables<"leads">[]) => void;
  addLead: (lead: Tables<"leads">) => void;
  updateLead: (id: string, data: Partial<Tables<"leads">>) => void;
  removeLead: (id: string) => void;
  archiveLead: (id: string) => void;
  setSelectedLeadId: (id: string | null) => void;
}

export const useLeadStore = create<LeadStore>((set) => ({
  leads: [],
  selectedLeadId: null,
  
  setLeads: (leads) => set({ leads }),
  
  addLead: (lead) => set((state) => ({
    leads: [...state.leads, lead]
  })),
  
  updateLead: (id, data) => set((state) => ({
    leads: state.leads.map((lead) => 
      lead.id === id ? { ...lead, ...data } : lead
    )
  })),
  
  removeLead: (id) => set((state) => ({
    leads: state.leads.filter((lead) => lead.id !== id),
    selectedLeadId: state.selectedLeadId === id ? null : state.selectedLeadId
  })),

  archiveLead: (id) => set((state) => ({
    leads: state.leads.filter((lead) => lead.id !== id),
    selectedLeadId: state.selectedLeadId === id ? null : state.selectedLeadId
  })),
  
  setSelectedLeadId: (id) => set({ selectedLeadId: id })
}));
