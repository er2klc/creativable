import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSettings } from "@/hooks/use-settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Calendar } from "lucide-react";

interface AppointmentListProps {
  leadId: string;
}

export function AppointmentList({ leadId }: AppointmentListProps) {
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const addAppointmentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("tasks")
        .insert({
          lead_id: leadId,
          color: "#40E0D0", // Turquoise for appointments
          meeting_type: "appointment",
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", leadId] });
      toast.success(
        settings?.language === "en" ? "Appointment added" : "Termin hinzugefügt"
      );
    },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Button 
              onClick={() => addAppointmentMutation.mutate()}
            >
              <Calendar className="h-4 w-4 mr-2" />
              {settings?.language === "en" ? "Add Appointment" : "Termin hinzufügen"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}