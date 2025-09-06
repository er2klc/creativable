import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Simplified types to avoid deep inference
type SimplePhase = {
  id: string;
  name: string;
  order_index: number;
  color: string;
  leads: SimpleLead[];
};

type SimpleLead = {
  id: string;
  name: string;
  platform: string;
  avatar_url: string | null;
};

export const LeadPhases = () => {
  const { data: phases = [], isLoading, error } = useQuery<SimplePhase[], Error>({
    queryKey: ['lead-phases'],
    queryFn: async (): Promise<SimplePhase[]> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // Get first available pipeline
        const { data: pipelineData, error: pipelineError } = await supabase
          .from('pipelines')
          .select('id')
          .eq('user_id', user.id)
          .limit(1)
          .single();
            
        if (pipelineError || !pipelineData) {
          console.error('No pipeline found:', pipelineError);
          return [];
        }

        // Then get the phases for this pipeline
        const { data: phasesData, error: phasesError } = await supabase
          .from('pipeline_phases')
          .select(`
            id,
            name,
            order_index,
            leads:leads (
              id,
              name,
              platform,
              social_media_profile_image_url
            )
          `)
          .eq('pipeline_id', pipelineData.id)
          .order('order_index');

        if (phasesError) {
          console.error('Error fetching phases:', phasesError);
          return [];
        }

        // Generate colors for phases
        const colors = [
          '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', 
          '#ec4899', '#f43f5e', '#ef4444', '#f97316'
        ];
        
        return (phasesData || []).map((phase, index) => ({
          id: phase.id,
          name: phase.name,
          order_index: phase.order_index,
          color: colors[index % colors.length],
          leads: (phase.leads || []).map(lead => ({
            id: lead.id,
            name: lead.name,
            platform: lead.platform,
            avatar_url: lead.social_media_profile_image_url
          }))
        }));
      } catch (error) {
        console.error('Error in lead phases query:', error);
        return [];
      }
    }
  });

  if (isLoading) {
    return <div className="text-center py-4">Loading phases...</div>;
  }

  if (error) {
    console.error("Error loading phases:", error);
    return <div className="text-center text-red-500 py-4">Error loading phases</div>;
  }

  if (phases.length === 0) {
    return <div className="text-center text-gray-500 py-4">No phases found. Please set up your pipeline.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {phases.map((phase) => (
        <div 
          key={phase.id} 
          className="bg-white rounded-lg shadow-md p-4"
          style={{ borderTop: `3px solid ${phase.color}` }}
        >
          <h3 className="text-lg font-semibold mb-2">{phase.name}</h3>
          {phase.leads.length === 0 ? (
            <p className="text-gray-400 text-sm">No leads in this phase</p>
          ) : (
            <ul>
              {phase.leads.map((lead) => (
                <li key={lead.id} className="py-2 border-b last:border-b-0">
                  <div className="flex items-center">
                    <img
                      src={lead.avatar_url || "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=32&h=32&fit=crop&crop=face"}
                      alt={lead.name}
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=32&h=32&fit=crop&crop=face";
                      }}
                    />
                    <span className="truncate">{lead.name}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};