import { useState } from "react";
import { useForm } from "react-hook-form";
import { Calendar as CalendarIcon } from "lucide-react";
import { useSession } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AddAppointmentDialogProps {
  leadId: string;
  leadName: string;
}

export const AddAppointmentDialog = ({ leadId, leadName }: AddAppointmentDialogProps) => {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const session = useSession();
  const { settings } = useSettings();
  
  const { register, handleSubmit, reset } = useForm({
    defaultValues: {
      title: "",
      date: "",
      startTime: "",
      endTime: "",
      meetingType: "",
    },
  });

  const onSubmit = async (data: any) => {
    try {
      const startDateTime = new Date(`${data.date}T${data.startTime}`);
      const endDateTime = data.endTime 
        ? new Date(`${data.date}T${data.endTime}`)
        : new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default 1 hour

      const { error } = await supabase
        .from("tasks")
        .insert({
          title: data.title,
          lead_id: leadId,
          due_date: startDateTime.toISOString(),
          meeting_type: data.meetingType,
          color: "#4CAF50",
          user_id: session?.user?.id,
        });

      if (error) throw error;

      toast({
        title: settings?.language === "en" ? "Appointment created" : "Termin erstellt",
        description: settings?.language === "en"
          ? "The appointment has been created successfully"
          : "Der Termin wurde erfolgreich erstellt",
      });

      setOpen(false);
      reset();
    } catch (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: settings?.language === "en" ? "Error" : "Fehler",
        description: settings?.language === "en"
          ? "There was an error creating the appointment"
          : "Beim Erstellen des Termins ist ein Fehler aufgetreten",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <CalendarIcon className="h-4 w-4 mr-2" />
          {settings?.language === "en" ? "Add Appointment" : "Termin hinzufügen"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {settings?.language === "en" ? "Add Appointment" : "Termin hinzufügen"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">
              {settings?.language === "en" ? "Title" : "Titel"}
            </Label>
            <Input id="title" {...register("title", { required: true })} />
          </div>
          
          <div>
            <Label htmlFor="date">
              {settings?.language === "en" ? "Date" : "Datum"}
            </Label>
            <Input id="date" type="date" {...register("date", { required: true })} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">
                {settings?.language === "en" ? "Start Time" : "Startzeit"}
              </Label>
              <Input id="startTime" type="time" {...register("startTime", { required: true })} />
            </div>
            <div>
              <Label htmlFor="endTime">
                {settings?.language === "en" ? "End Time (optional)" : "Endzeit (optional)"}
              </Label>
              <Input id="endTime" type="time" {...register("endTime")} />
            </div>
          </div>
          
          <div>
            <Label htmlFor="meetingType">
              {settings?.language === "en" ? "Meeting Type" : "Terminart"}
            </Label>
            <Select onValueChange={(value) => register("meetingType").onChange({ target: { value } })}>
              <SelectTrigger>
                <SelectValue placeholder={settings?.language === "en" ? "Select type" : "Typ auswählen"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="initial">
                  {settings?.language === "en" ? "Initial Meeting" : "Erstgespräch"}
                </SelectItem>
                <SelectItem value="followup">
                  {settings?.language === "en" ? "Follow-up" : "Folgetermin"}
                </SelectItem>
                <SelectItem value="presentation">
                  {settings?.language === "en" ? "Presentation" : "Präsentation"}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button type="submit" className="w-full">
            {settings?.language === "en" ? "Create Appointment" : "Termin erstellen"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};