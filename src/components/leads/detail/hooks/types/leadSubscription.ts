import { LeadWithRelations } from "@/types/leads";

export type { LeadWithRelations };

export type SubscriptionPayload = {
  new: Record<string, any>;
  old: Record<string, any>;
  errors: any[] | null;
};