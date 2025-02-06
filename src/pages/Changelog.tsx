import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChangelogEntry } from "@/components/changelog/ChangelogEntry";
import { ChangelogItem } from "@/components/changelog/types";

export default function Changelog() {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const queryClient = useQueryClient();

  // Fetch changelog entries from database
  const { data: changelogEntries, isLoading } = useQuery({
    queryKey: ["changelog_entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("changelog_entries")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        console.error("Error fetching changelog entries:", error);
        throw error;
      }

      // Transform the data into the required format
      const groupedEntries = data.reduce((acc: any[], entry) => {
        const existingVersion = acc.find(v => v.version === entry.version);
        if (existingVersion) {
          existingVersion.changes.push({
            title: entry.title,
            status: entry.status as "completed" | "in-progress" | "planned",
            description: entry.description
          });
        } else {
          acc.push({
            version: entry.version,
            date: new Date(entry.date).toISOString().split('T')[0],
            changes: [{
              title: entry.title,
              status: entry.status as "completed" | "in-progress" | "planned",
              description: entry.description
            }]
          });
        }
        return acc;
      }, []);

      return groupedEntries;
    }
  });

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_super_admin")
        .eq("id", user.id)
        .single();
      
      setIsAdmin(profile?.is_super_admin || false);
    };

    checkAdminStatus();
  }, []);

  const handleStatusChange = async (version: string, title: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("changelog_entries")
        .update({ status: newStatus })
        .eq("version", version)
        .eq("title", title);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["changelog_entries"] });
      toast.success("Status erfolgreich aktualisiert");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Fehler beim Aktualisieren des Status");
    }
  };

  const handleDelete = async (version: string, title: string) => {
    try {
      const { error } = await supabase
        .from("changelog_entries")
        .delete()
        .eq("version", version)
        .eq("title", title);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["changelog_entries"] });
      toast.success("Eintrag erfolgreich gelöscht");
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Fehler beim Löschen des Eintrags");
    }
  };

  const handleEdit = async (version: string, originalTitle: string, newTitle: string, newDescription: string) => {
    try {
      const { error } = await supabase
        .from("changelog_entries")
        .update({
          title: newTitle,
          description: newDescription
        })
        .eq("version", version)
        .eq("title", originalTitle);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ["changelog_entries"] });
      toast.success("Eintrag erfolgreich aktualisiert");
    } catch (error) {
      console.error("Error updating entry:", error);
      toast.error("Fehler beim Aktualisieren des Eintrags");
    }
  };

  if (isLoading) {
    return <div>Lädt...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Changelog</h1>
      <p className="text-muted-foreground mb-8">
        Hier finden Sie alle Änderungen und geplanten Features unserer Anwendung.
      </p>
      
      <div className="space-y-6">
        {changelogEntries?.map((entry) => (
          <ChangelogEntry
            key={entry.version}
            entry={entry}
            isAdmin={isAdmin}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
}