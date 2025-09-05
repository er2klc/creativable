import { useState } from "react";
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
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const queryClient = useQueryClient();

  const addAppointmentMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("tasks")
        .insert({
          lead_id: leadId,
          title,
          color: "#40E0D0", // Turquoise for appointments
          due_date: date && time ? new Date(`${date}T${time}`).toISOString() : null,
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
      setTitle("");
      setDate("");
      setTime("");
    },
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={settings?.language === "en" ? "Appointment title..." : "Terminbeschreibung..."}
            />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-40"
            />
            <Input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-32"
            />
            <Button 
              onClick={() => addAppointmentMutation.mutate()}
              disabled={!title || !date || !time}
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