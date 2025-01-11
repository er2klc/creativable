import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type ShortcutType = 'team' | 'team_calendar' | 'personal_calendar' | 'create_contact' | 'learning_platform' | 'todo_list';

export interface Shortcut {
  id: string;
  type: ShortcutType;
  title: string;
  target_id?: string;
  order_index: number;
}

export const useShortcuts = () => {
  const queryClient = useQueryClient();

  const { data: shortcuts = [], isLoading } = useQuery({
    queryKey: ["shortcuts"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      const { data, error } = await supabase
        .from("dashboard_shortcuts")
        .select("*")
        .eq("user_id", user.id)
        .order("order_index");

      if (error) {
        console.error("Error fetching shortcuts:", error);
        throw error;
      }

      return data as Shortcut[];
    },
  });

  const addShortcut = useMutation({
    mutationFn: async (shortcut: Omit<Shortcut, 'id'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("No user found");
      }

      const { data, error } = await supabase
        .from("dashboard_shortcuts")
        .insert([{ ...shortcut, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shortcuts"] });
      toast.success("Shortcut added successfully");
    },
    onError: (error) => {
      console.error("Error adding shortcut:", error);
      toast.error("Failed to add shortcut");
    },
  });

  const updateShortcut = useMutation({
    mutationFn: async (shortcut: Shortcut) => {
      const { error } = await supabase
        .from("dashboard_shortcuts")
        .update(shortcut)
        .eq("id", shortcut.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shortcuts"] });
      toast.success("Shortcut updated successfully");
    },
    onError: (error) => {
      console.error("Error updating shortcut:", error);
      toast.error("Failed to update shortcut");
    },
  });

  const deleteShortcut = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("dashboard_shortcuts")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shortcuts"] });
      toast.success("Shortcut deleted successfully");
    },
    onError: (error) => {
      console.error("Error deleting shortcut:", error);
      toast.error("Failed to delete shortcut");
    },
  });

  const reorderShortcuts = useMutation({
    mutationFn: async (shortcuts: Shortcut[]) => {
      const updates = shortcuts.map((shortcut, index) => ({
        id: shortcut.id,
        order_index: index,
      }));

      const { error } = await supabase
        .from("dashboard_shortcuts")
        .upsert(updates);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shortcuts"] });
    },
    onError: (error) => {
      console.error("Error reordering shortcuts:", error);
      toast.error("Failed to reorder shortcuts");
    },
  });

  return {
    shortcuts,
    isLoading,
    addShortcut,
    updateShortcut,
    deleteShortcut,
    reorderShortcuts,
  };
};