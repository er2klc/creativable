import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tables } from "@/integrations/supabase/types";
import { Platform } from "@/config/platforms";
import { useSettings } from "@/hooks/use-settings";
import { MessageSquare, CheckSquare, StickyNote, Calendar, Upload, Presentation } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface LeadDetailTabsProps {
  lead: Tables<"leads"> & {
    platform: Platform;
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
    notes: Tables<"notes">[];
  };
}

const tabColors = {
  notes: "#FEF7CD", // Soft yellow for notes
  tasks: "#40E0D0", // Turquoise for tasks
  appointments: "#FFA500", // Orange for appointments
  messages: "#D3E4FD", // Soft blue for messages
  uploads: "#E5DEFF", // Soft purple for uploads
  presentations: "#FFDEE2", // Soft pink for presentations
};

export function LeadDetailTabs({ lead }: LeadDetailTabsProps) {
  const { settings } = useSettings();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [newTask, setNewTask] = useState("");
  const [newAppointment, setNewAppointment] = useState("");
  const [newMessage, setNewMessage] = useState("");

  const createNoteMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from("notes")
        .insert([
          {
            lead_id: lead.id,
            content,
            color: tabColors.notes,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      setNewNote("");
      toast.success(settings?.language === "en" ? "Note created" : "Notiz erstellt");
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: async (title: string) => {
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            lead_id: lead.id,
            title,
            color: tabColors.tasks,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      setNewTask("");
      toast.success(settings?.language === "en" ? "Task created" : "Aufgabe erstellt");
    },
  });

  const createMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            lead_id: lead.id,
            content,
            platform: lead.platform,
            user_id: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lead", lead.id] });
      setNewMessage("");
      toast.success(settings?.language === "en" ? "Message created" : "Nachricht erstellt");
    },
  });
  
  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger 
          value="notes" 
          className={cn(
            "flex items-center gap-2 relative",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "data-[state=active]:after:bg-[#FEF7CD]"
          )}
        >
          <StickyNote className="h-4 w-4" />
          {settings?.language === "en" ? "Notes" : "Notizen"}
        </TabsTrigger>
        
        <TabsTrigger 
          value="tasks"
          className={cn(
            "flex items-center gap-2 relative",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "data-[state=active]:after:bg-[#40E0D0]"
          )}
        >
          <CheckSquare className="h-4 w-4" />
          {settings?.language === "en" ? "Tasks" : "Aufgaben"}
        </TabsTrigger>
        
        <TabsTrigger 
          value="appointments"
          className={cn(
            "flex items-center gap-2 relative",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "data-[state=active]:after:bg-[#FFA500]"
          )}
        >
          <Calendar className="h-4 w-4" />
          {settings?.language === "en" ? "Appointments" : "Termine"}
        </TabsTrigger>
        
        <TabsTrigger 
          value="messages"
          className={cn(
            "flex items-center gap-2 relative",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "data-[state=active]:after:bg-[#D3E4FD]"
          )}
        >
          <MessageSquare className="h-4 w-4" />
          {settings?.language === "en" ? "Messages" : "Nachrichten"}
        </TabsTrigger>

        <TabsTrigger 
          value="uploads"
          className={cn(
            "flex items-center gap-2 relative",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "data-[state=active]:after:bg-[#E5DEFF]"
          )}
        >
          <Upload className="h-4 w-4" />
          {settings?.language === "en" ? "Uploads" : "Uploads"}
        </TabsTrigger>

        <TabsTrigger 
          value="presentations"
          className={cn(
            "flex items-center gap-2 relative",
            "after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5",
            "data-[state=active]:after:bg-[#FFDEE2]"
          )}
        >
          <Presentation className="h-4 w-4" />
          {settings?.language === "en" ? "Presentations" : "Präsentationen"}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="notes">
        <div className="p-4 bg-white rounded-lg shadow">
          <Label htmlFor="new-note">
            {settings?.language === "en" ? "New Note" : "Neue Notiz"}
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="new-note"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder={settings?.language === "en" ? "Enter note content..." : "Notiz eingeben..."}
            />
            <Button 
              onClick={() => createNoteMutation.mutate(newNote)}
              disabled={!newNote.trim()}
            >
              {settings?.language === "en" ? "Add" : "Hinzufügen"}
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="tasks">
        <div className="p-4 bg-white rounded-lg shadow">
          <Label htmlFor="new-task">
            {settings?.language === "en" ? "New Task" : "Neue Aufgabe"}
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="new-task"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder={settings?.language === "en" ? "Enter task title..." : "Aufgabe eingeben..."}
            />
            <Button 
              onClick={() => createTaskMutation.mutate(newTask)}
              disabled={!newTask.trim()}
            >
              {settings?.language === "en" ? "Add" : "Hinzufügen"}
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="appointments">
        <div className="p-4 bg-white rounded-lg shadow">
          <Label htmlFor="new-appointment">
            {settings?.language === "en" ? "New Appointment" : "Neuer Termin"}
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="new-appointment"
              value={newAppointment}
              onChange={(e) => setNewAppointment(e.target.value)}
              placeholder={settings?.language === "en" ? "Enter appointment details..." : "Termin eingeben..."}
            />
            <Button disabled={!newAppointment.trim()}>
              {settings?.language === "en" ? "Add" : "Hinzufügen"}
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="messages">
        <div className="p-4 bg-white rounded-lg shadow">
          <Label htmlFor="new-message">
            {settings?.language === "en" ? "New Message" : "Neue Nachricht"}
          </Label>
          <div className="flex gap-2 mt-2">
            <Input
              id="new-message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={settings?.language === "en" ? "Enter message..." : "Nachricht eingeben..."}
            />
            <Button 
              onClick={() => createMessageMutation.mutate(newMessage)}
              disabled={!newMessage.trim()}
            >
              {settings?.language === "en" ? "Add" : "Hinzufügen"}
            </Button>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="uploads">
        <div className="p-4 bg-white rounded-lg shadow">
          <Label>
            {settings?.language === "en" ? "Upload Files" : "Dateien hochladen"}
          </Label>
          <div className="mt-2">
            <Input
              type="file"
              className="w-full"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="presentations">
        <div className="p-4 bg-white rounded-lg shadow">
          <Label>
            {settings?.language === "en" ? "Select Presentation" : "Präsentation auswählen"}
          </Label>
          <div className="mt-2">
            <select className="w-full p-2 border rounded">
              <option value="">
                {settings?.language === "en" ? "Select a presentation..." : "Präsentation auswählen..."}
              </option>
            </select>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}