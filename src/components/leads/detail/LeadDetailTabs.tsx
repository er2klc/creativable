import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";

interface LeadDetailTabsProps {
  lead: Tables<"leads"> & {
    messages: Tables<"messages">[];
    tasks: Tables<"tasks">[];
    notes: Tables<"notes">[];
  };
}

const tabColors = {
  notes: "#FEF7CD",
  tasks: "#FFE2DD",
  appointments: "#DCF0FF",
  messages: "#E5ECE9",
  uploads: "#F4E4FF",
  presentations: "#FFE4F3",
};

export function LeadDetailTabs({ lead }: LeadDetailTabsProps) {
  const { settings } = useSettings();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newNote, setNewNote] = useState("");
  const [newTask, setNewTask] = useState("");
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
      toast.success(settings?.language === "en" ? "Note added" : "Notiz hinzugefügt");
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
      toast.success(settings?.language === "en" ? "Task added" : "Aufgabe hinzugefügt");
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
      toast.success(settings?.language === "en" ? "Message added" : "Nachricht hinzugefügt");
    },
  });

  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList className="w-full">
        <TabsTrigger
          value="notes"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.notes}` }}
        >
          {settings?.language === "en" ? "Notes" : "Notizen"}
        </TabsTrigger>
        <TabsTrigger
          value="tasks"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.tasks}` }}
        >
          {settings?.language === "en" ? "Tasks" : "Aufgaben"}
        </TabsTrigger>
        <TabsTrigger
          value="appointments"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.appointments}` }}
        >
          {settings?.language === "en" ? "Appointments" : "Termine"}
        </TabsTrigger>
        <TabsTrigger
          value="messages"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.messages}` }}
        >
          {settings?.language === "en" ? "Messages" : "Nachrichten"}
        </TabsTrigger>
        <TabsTrigger
          value="uploads"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.uploads}` }}
        >
          {settings?.language === "en" ? "Uploads" : "Uploads"}
        </TabsTrigger>
        <TabsTrigger
          value="presentations"
          className="flex-1"
          style={{ borderBottom: `2px solid ${tabColors.presentations}` }}
        >
          {settings?.language === "en" ? "Presentations" : "Präsentationen"}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="notes" className="mt-4">
        <div className="space-y-4">
          <div>
            <Label>
              {settings?.language === "en" ? "Add Note" : "Notiz hinzufügen"}
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder={settings?.language === "en" ? "Enter note..." : "Notiz eingeben..."}
              />
              <Button onClick={() => createNoteMutation.mutate(newNote)}>
                {settings?.language === "en" ? "Add" : "Hinzufügen"}
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="tasks" className="mt-4">
        <div className="space-y-4">
          <div>
            <Label>
              {settings?.language === "en" ? "Add Task" : "Aufgabe hinzufügen"}
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder={settings?.language === "en" ? "Enter task..." : "Aufgabe eingeben..."}
              />
              <Button onClick={() => createTaskMutation.mutate(newTask)}>
                {settings?.language === "en" ? "Add" : "Hinzufügen"}
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="appointments" className="mt-4">
        <div className="space-y-4">
          <div>
            <Label>
              {settings?.language === "en" ? "Add Appointment" : "Termin hinzufügen"}
            </Label>
            <div className="mt-2">
              {/* Appointment form will be implemented here */}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="messages" className="mt-4">
        <div className="space-y-4">
          <div>
            <Label>
              {settings?.language === "en" ? "Add Message" : "Nachricht hinzufügen"}
            </Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={settings?.language === "en" ? "Enter message..." : "Nachricht eingeben..."}
              />
              <Button onClick={() => createMessageMutation.mutate(newMessage)}>
                {settings?.language === "en" ? "Add" : "Hinzufügen"}
              </Button>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="uploads" className="mt-4">
        <div className="space-y-4">
          <div>
            <Label>
              {settings?.language === "en" ? "Upload File" : "Datei hochladen"}
            </Label>
            <div className="mt-2">
              {/* File upload will be implemented here */}
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="presentations" className="mt-4">
        <div className="space-y-4">
          <div>
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
        </div>
      </TabsContent>
    </Tabs>
  );
}