
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const LeadPhases = () => {
  const { data: phases = [], isLoading, error } = useQuery({
    queryKey: ['lead-phases'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        // First get the default or last used pipeline
        const lastUsedPipelineId = localStorage.getItem('lastUsedPipelineId');
        
        let pipelineQuery = supabase
          .from('pipelines')
          .select('id')
          .eq('user_id', user.id);
          
        if (lastUsedPipelineId) {
          pipelineQuery = pipelineQuery.eq('id', lastUsedPipelineId);
        } else {
          pipelineQuery = pipelineQuery.eq('is_default', true);
        }
          
        // Use let instead of const for pipelineData since we need to reassign it later
        let { data: pipelineData, error: pipelineError } = await pipelineQuery.single();

        if (pipelineError || !pipelineData) {
          // Fallback to any pipeline this user has
          const { data: fallbackPipeline, error: fallbackError } = await supabase
            .from('pipelines')
            .select('id')
            .eq('user_id', user.id)
            .limit(1)
            .single();
            
          if (fallbackError || !fallbackPipeline) {
            console.error('Error fetching any pipeline:', fallbackError);
            return [];
          }
          
          pipelineData = fallbackPipeline;
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
              avatar_url:social_media_profile_image_url
            )
          `)
          .eq('pipeline_id', pipelineData.id)
          .order('order_index');

        if (phasesError) {
          console.error('Error fetching phases:', phasesError);
          return [];
        }

        // Generate colors for phases based on index
        return phasesData.map((phase, index) => {
          // Generate a color from a predefined palette
          const colors = [
            '#3b82f6', // blue-500
            '#6366f1', // indigo-500
            '#8b5cf6', // violet-500
            '#d946ef', // fuchsia-500
            '#ec4899', // pink-500
            '#f43f5e', // rose-500
            '#ef4444', // red-500
            '#f97316', // orange-500
            '#f59e0b', // amber-500
            '#84cc16', // lime-500
            '#10b981', // emerald-500
            '#14b8a6', // teal-500
          ];
          
          return {
            id: phase.id,
            name: phase.name,
            order_index: phase.order_index,
            color: colors[index % colors.length],
            leads: phase.leads || []
          };
        });
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
                      src={lead.avatar_url || "/placeholder-profile.png"}
                      alt={lead.name}
                      className="w-8 h-8 rounded-full mr-2 object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-profile.png";
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
