import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const LeadPhases = () => {
  const { data: phases = [] } = useQuery({
    queryKey: ['lead-phases'],
    queryFn: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data: pipelineData, error: pipelineError } = await supabase
          .from('pipelines')
          .select('id')
          .eq('created_by', user.id)
          .eq('is_default', true)
          .single();

        if (pipelineError || !pipelineData) {
          console.error('Error fetching pipeline:', pipelineError);
          return [];
        }

        const { data: phasesData, error: phasesError } = await supabase
          .from('pipeline_phases')
          .select(`
            id,
            name,
            order_index,
            color,
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

        return phasesData.map(phase => ({
          id: phase.id,
          name: phase.name,
          order_index: phase.order_index,
          color: phase.color,
          leads: phase.leads || []
        }));
      } catch (error) {
        console.error('Error in lead phases query:', error);
        return [];
      }
    }
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {phases.map((phase) => (
        <div key={phase.id} className="bg-white rounded-lg shadow-md p-4">
          <h3 className="text-lg font-semibold mb-2">{phase.name}</h3>
          <ul>
            {phase.leads.map((lead) => (
              <li key={lead.id} className="py-2 border-b last:border-b-0">
                <div className="flex items-center">
                  <img
                    src={lead.avatar_url || "/placeholder-profile.png"}
                    alt={lead.name}
                    className="w-8 h-8 rounded-full mr-2"
                  />
                  <span>{lead.name}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
