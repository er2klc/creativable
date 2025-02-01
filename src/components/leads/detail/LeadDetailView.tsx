import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useSettings } from "@/hooks/use-settings";
import { LeadDetailHeader } from "./LeadDetailHeader";
import { useLeadSubscription } from "./hooks/useLeadSubscription";
import { LeadWithRelations } from "./types/lead";
import { LeadDetailContent } from "./components/LeadDetailContent";
import { useLeadMutations } from "./hooks/useLeadMutations";

interface LeadDetailViewProps {
  leadId: string | null;
  onClose: () => void;
}

const isValidUUID = (uuid: string) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const LeadDetailView = ({ leadId, onClose }: LeadDetailViewProps) => {
  const { settings } = useSettings();
  
  const { data: lead, isLoading } = useQuery({
    queryKey: ["lead", leadId],
    queryFn: async () => {
      if (!leadId || !isValidUUID(leadId)) {
        throw new Error("Invalid lead ID");
      }

      const { data, error } = await supabase
        .from("leads")
        .select(`
          *,
          messages(*),
          tasks(*),
          notes(*),
          lead_files(*),
          linkedin_posts(*)
        `)
        .eq("id", leadId)
        .maybeSingle();

      if (error) {
        console.error("Error fetching lead:", error);
        throw error;
      }

      if (!data) {
        throw new Error("Lead not found");
      }

      // Log LinkedIn specific information
      if (data.platform === 'LinkedIn') {
        console.log('LinkedIn Contact Found:', {
          name: data.name,
          linkedInId: data.linkedin_id,
          position: data.position,
          company: data.current_company_name,
          experience: data.experience,
          educationSummary: data.education_summary
        });

        // Get LinkedIn posts for this lead
        const { data: linkedInPosts, error: postsError } = await supabase
          .from('linkedin_posts')
          .select('*')
          .eq('lead_id', leadId)
          .order('posted_at', { ascending: false });

        if (postsError) {
          console.error('Error fetching LinkedIn posts:', postsError);
        } else {
          console.log('LinkedIn Posts:', linkedInPosts);
          
          // Log timestamps for each post
          linkedInPosts?.forEach(post => {
            console.log('Post Time:', {
              id: post.id,
              postedAt: post.posted_at,
              createdAt: post.created_at,
              type: post.post_type,
              content: post.content,
              position: post.position,
              company: post.company,
              school: post.school,
              degree: post.degree
            });
          });

          // Assign the posts to data
          data.linkedin_posts = linkedInPosts;
        }
      }

      return data as unknown as LeadWithRelations;
    },
    enabled: !!leadId && isValidUUID(leadId),
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 10000),
  });

  const { updateLeadMutation, deleteLeadMutation } = useLeadMutations(leadId, onClose);
  useLeadSubscription(leadId);

  // Handler for updating lead that checks if values have actually changed
  const handleUpdateLead = (updates: Partial<Tables<"leads">>) => {
    if (!lead) return;
    
    // Check if any values are actually different
    const hasChanges = Object.entries(updates).some(([key, value]) => {
      // Skip if the key doesn't exist in lead
      if (!(key in lead)) return false;
      // Compare the values
      return lead[key as keyof typeof lead] !== value;
    });

    // Only trigger mutation if there are actual changes
    if (hasChanges) {
      updateLeadMutation.mutate(updates);
    }
  };

  return (
    <Dialog open={!!leadId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[90vh] bg-white border rounded-lg shadow-lg overflow-hidden">
        <DialogHeader className="p-0">
          {lead && (
            <LeadDetailHeader
              lead={lead}
              onUpdateLead={handleUpdateLead}
              onDeleteLead={() => deleteLeadMutation.mutate()}
            />
          )}
        </DialogHeader>

        {lead && (
          <LeadDetailContent 
            lead={lead}
            onUpdateLead={handleUpdateLead}
            isLoading={isLoading}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};