import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings } from "@/hooks/use-settings";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddTaskDialog = ({ open, onOpenChange }: AddTaskDialogProps) => {
  const { settings } = useSettings();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [selectedLead, setSelectedLead] = useState<string | undefined>();
  const [priority, setPriority] = useState("Medium");

  const { data: leads = [] } = useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from("leads")
        .select("id, name")
        .eq("user_id", user.id)
        .order("name");

      if (error) throw error;
      return data;
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Get the current highest order_index
      const { data: lastTask } = await supabase
        .from('tasks')
        .select('order_index')
        .order('order_index', { ascending: false })
        .limit(1);

      const newOrderIndex = lastTask && lastTask[0] ? lastTask[0].order_index + 1 : 0;

      const { error } = await supabase
        .from("tasks")
        .insert({
          title,
          lead_id: selectedLead,
          user_id: user.id,
          priority,
          order_index: newOrderIndex
        });

      if (error) throw error;

      toast.success(
        settings?.language === "en" 
          ? "Task added successfully" 
          : "Aufgabe erfolgreich hinzugefügt"
      );
      
      // Invalidate and refetch tasks
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      setTitle("");
      setSelectedLead(undefined);
      setPriority("Medium");
      onOpenChange(false);
    } catch (error) {
      console.error("Error adding task:", error);
      toast.error(
        settings?.language === "en"
          ? "Error adding task"
          : "Fehler beim Hinzufügen der Aufgabe"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {settings?.language === "en" ? "Add New Task" : "Neue Aufgabe hinzufügen"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">
              {settings?.language === "en" ? "Task Title" : "Aufgabentitel"}
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={settings?.language === "en" ? "Enter task title" : "Aufgabentitel eingeben"}
            />
          </div>
          <div>
            <Label htmlFor="priority">
              {settings?.language === "en" ? "Priority" : "Priorität"}
            </Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue placeholder={settings?.language === "en" ? "Select priority" : "Priorität auswählen"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="lead">
              {settings?.language === "en" ? "Contact (optional)" : "Kontakt (optional)"}
            </Label>
            <Select value={selectedLead} onValueChange={setSelectedLead}>
              <SelectTrigger>
                <SelectValue placeholder={settings?.language === "en" ? "Select a contact" : "Kontakt auswählen"} />
              </SelectTrigger>
              <SelectContent>
                {leads.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {settings?.language === "en" ? "Cancel" : "Abbrechen"}
            </Button>
            <Button type="submit">
              {settings?.language === "en" ? "Add Task" : "Aufgabe hinzufügen"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};