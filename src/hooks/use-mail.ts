
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EmailMessage {
  id: string;
  subject: string;
  from: string;
  to: string;
  body: string;
  html_body?: string;
  read: boolean;
  starred: boolean;
  important: boolean;
  received_at: string;
  user_id: string;
  folder: string;
  has_attachments: boolean;
}

interface EmailFolder {
  id: string;
  name: string;
  count: number;
}

export const useMailFolders = () => {
  return useQuery({
    queryKey: ["mail-folders"],
    queryFn: async () => {
      // In future implementations, fetch real folder data from the database
      // For now, return mock folders
      return [
        { id: "inbox", name: "Inbox", count: 12 },
        { id: "sent", name: "Sent", count: 0 },
        { id: "archive", name: "Archive", count: 0 },
        { id: "trash", name: "Trash", count: 0 },
      ] as EmailFolder[];
    },
  });
};

export const useMailList = (folder: string) => {
  return useQuery({
    queryKey: ["mail-list", folder],
    queryFn: async () => {
      // In future implementations, fetch real emails from the database
      // For now, return mock data
      
      // This would be the real implementation:
      // const { data, error } = await supabase
      //   .from("emails")
      //   .select("*")
      //   .eq("folder", folder)
      //   .eq("user_id", user.id)
      //   .order("received_at", { ascending: false });
      
      // if (error) throw error;
      // return data;
      
      return [];
    },
  });
};

export const useMailSync = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // This would trigger an edge function to sync emails
      const { data, error } = await supabase.functions.invoke("sync-emails");
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail-list"] });
      queryClient.invalidateQueries({ queryKey: ["mail-folders"] });
      toast.success("Emails synchronized successfully");
    },
    onError: (error) => {
      console.error("Email sync error:", error);
      toast.error("Failed to synchronize emails. Please try again.");
    },
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (emailId: string) => {
      // This would update the read status in the database
      const { data, error } = await supabase
        .from("emails")
        .update({ read: true })
        .eq("id", emailId);
        
      if (error) throw error;
      return data;
    },
    onSuccess: (_, emailId) => {
      queryClient.invalidateQueries({ queryKey: ["mail-list"] });
      queryClient.invalidateQueries({ queryKey: ["mail-folders"] });
    },
  });
};

export const useStarEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ emailId, starred }: { emailId: string; starred: boolean }) => {
      // This would update the starred status in the database
      const { data, error } = await supabase
        .from("emails")
        .update({ starred })
        .eq("id", emailId);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail-list"] });
    },
  });
};

export const useMoveEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ emailId, folder }: { emailId: string; folder: string }) => {
      // This would update the folder in the database
      const { data, error } = await supabase
        .from("emails")
        .update({ folder })
        .eq("id", emailId);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail-list"] });
      queryClient.invalidateQueries({ queryKey: ["mail-folders"] });
    },
  });
};

export const useDeleteEmail = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (emailId: string) => {
      // This would either move to trash or permanently delete
      const { data, error } = await supabase
        .from("emails")
        .update({ folder: "trash" })
        .eq("id", emailId);
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["mail-list"] });
      queryClient.invalidateQueries({ queryKey: ["mail-folders"] });
      toast.success("Email moved to trash");
    },
  });
};
