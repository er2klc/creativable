import { useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, UserPlus, CheckCircle } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_PHASES = [
  { name: "Erstkontakt", order_index: 0 },
  { name: "Follow-up", order_index: 1 },
  { name: "Abschluss", order_index: 2 },
];

export const LeadPhases = () => {
  const session = useSession();
  const { toast } = useToast();

  const { data: phases = [], isLoading, refetch } = useQuery({
    queryKey: ["lead-phases"],
    queryFn: async () => {
      if (!session?.user?.id) return [];
      
      const { data: existingPhases, error } = await supabase
        .from("lead_phases")
        .select("*")
        .eq("user_id", session.user.id)
        .order("order_index");

      if (error) throw error;
      return existingPhases;
    },
  });

  // Query to get lead counts per phase
  const { data: leadCounts = {} } = useQuery({
    queryKey: ["lead-phase-counts"],
    queryFn: async () => {
      if (!session?.user?.id) return {};
      
      const { data: leads, error } = await supabase
        .from("leads")
        .select("phase")
        .eq("user_id", session.user.id);

      if (error) throw error;

      // Calculate percentages
      const counts: { [key: string]: number } = {};
      const total = leads?.length || 0;
      
      leads?.forEach(lead => {
        counts[lead.phase] = (counts[lead.phase] || 0) + 1;
      });

      // Convert to percentages
      const percentages: { [key: string]: number } = {};
      Object.keys(counts).forEach(phase => {
        percentages[phase] = total > 0 ? Math.round((counts[phase] / total) * 100) : 0;
      });

      return percentages;
    },
  });

  useEffect(() => {
    const initializeDefaultPhases = async () => {
      if (!session?.user?.id || phases.length > 0) return;

      try {
        // Get existing phase names for this user
        const { data: existingPhases, error: checkError } = await supabase
          .from("lead_phases")
          .select("name")
          .eq("user_id", session.user.id);

        if (checkError) {
          console.error("Error checking existing phases:", checkError);
          return;
        }

        const existingPhaseNames = new Set(existingPhases?.map(p => p.name) || []);
        const phasesToAdd = DEFAULT_PHASES.filter(
          phase => !existingPhaseNames.has(phase.name)
        );

        if (phasesToAdd.length === 0) return;

        // Insert all phases at once to avoid multiple requests
        const { error: insertError } = await supabase
          .from("lead_phases")
          .insert(
            phasesToAdd.map(phase => ({
              name: phase.name,
              order_index: phase.order_index,
              user_id: session.user.id,
            }))
          );

        if (insertError) {
          // Handle duplicate key error gracefully
          if (insertError.code === "23505") {
            console.log("Some phases already exist for this user, continuing...");
            // Refresh the phases list to get the latest state
            refetch();
            return;
          }
          
          console.error("Error inserting phases:", insertError);
          toast({
            title: "Fehler",
            description: "Fehler beim Initialisieren der Phasen. Bitte versuchen Sie es später erneut.",
            variant: "destructive",
          });
          return;
        }
        
        // Refresh the phases list
        refetch();
      } catch (error) {
        console.error("Error in initializeDefaultPhases:", error);
        toast({
          title: "Fehler",
          description: "Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.",
          variant: "destructive",
        });
      }
    };

    initializeDefaultPhases();
  }, [session?.user?.id, phases.length, toast, refetch]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Users className="h-5 w-5" />
          Kontakt-Phasen
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {phases.map(phase => (
          <div key={phase.id}>
            <div className="flex justify-between mb-1 text-sm">
              <span className="flex items-center gap-2">
                {phase.order_index === 0 ? (
                  <UserPlus className="h-4 w-4" />
                ) : phase.order_index === phases.length - 1 ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Users className="h-4 w-4" />
                )}
                {phase.name}
              </span>
              <span>{leadCounts[phase.name] || 0}%</span>
            </div>
            <Progress value={leadCounts[phase.name] || 0} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};