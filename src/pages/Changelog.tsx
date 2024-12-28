import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChangelogEntry } from "@/components/changelog/ChangelogEntry";
import { ChangelogItem } from "@/components/changelog/types";

const defaultChangelog = [
  {
    version: "0.2",
    date: "2024-03-21",
    changes: [
      {
        title: "MLM-Einstellungen Verbesserungen",
        status: "completed" as const,
        description: "KI-Analyse Button für automatische Firmendaten-Erfassung hinzugefügt"
      },
      {
        title: "UI Verbesserungen",
        status: "completed" as const,
        description: "Schwarz-weiße Icons im Vordergrund, farbige Welt-Icons im Hintergrund"
      },
      {
        title: "Changelog Seite",
        status: "completed" as const,
        description: "Neue Seite zur Verfolgung von Änderungen und geplanten Features"
      },
      {
        title: "Handynummer & Sprache Einstellungen",
        status: "in-progress" as const,
        description: "Behebung von Problemen beim Speichern von Handynummer und Spracheinstellungen"
      },
      {
        title: "Automatische MLM-Datenerfassung",
        status: "planned" as const,
        description: "Verbesserung der KI-Analyse für genauere Firmendaten"
      }
    ]
  },
  {
    version: "0.1",
    date: "2024-03-20",
    changes: [
      {
        title: "Erste Version",
        status: "completed" as const,
        description: "Initiale Version mit grundlegenden Funktionen"
      }
    ]
  }
];

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

      // If no entries exist, create initial entries
      if (!data || data.length === 0) {
        console.log("No changelog entries found, creating initial entries...");
        await createInitialEntries();
        return defaultChangelog;
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
        .select("is_admin")
        .eq("id", user.id)
        .single();
      
      setIsAdmin(profile?.is_admin || false);
    };

    checkAdminStatus();
  }, []);

  const createInitialEntries = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Flatten the changelog data for database storage
    const entries = defaultChangelog.flatMap(version => 
      version.changes.map(change => ({
        version: version.version,
        date: version.date,
        title: change.title,
        description: change.description,
        status: change.status,
        created_by: user.id
      }))
    );

    const { error } = await supabase
      .from("changelog_entries")
      .insert(entries);

    if (error) {
      console.error("Error creating initial changelog entries:", error);
      throw error;
    }
  };

  const handleStatusChange = async (version: string, title: string, newStatus: string) => {
    try {
      console.log("Updating status:", { version, title, newStatus });
      
      const { error } = await supabase
        .from("changelog_entries")
        .update({ status: newStatus })
        .eq("version", version)
        .eq("title", title);

      if (error) {
        console.error("Error updating status in database:", error);
        throw error;
      }

      await queryClient.invalidateQueries({ queryKey: ["changelog_entries"] });
      toast.success("Status erfolgreich aktualisiert");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Fehler beim Aktualisieren des Status");
      throw error;
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
        {(changelogEntries || defaultChangelog).map((entry) => (
          <ChangelogEntry
            key={entry.version}
            entry={entry}
            isAdmin={isAdmin}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}