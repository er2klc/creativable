import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChangelogEntry } from "@/components/changelog/ChangelogEntry";

const changelog = [
  {
    version: "0.2",
    date: "2024-03-21",
    changes: [
      {
        title: "MLM-Einstellungen Verbesserungen",
        status: "completed",
        description: "KI-Analyse Button für automatische Firmendaten-Erfassung hinzugefügt"
      },
      {
        title: "UI Verbesserungen",
        status: "completed",
        description: "Schwarz-weiße Icons im Vordergrund, farbige Welt-Icons im Hintergrund"
      },
      {
        title: "Changelog Seite",
        status: "completed",
        description: "Neue Seite zur Verfolgung von Änderungen und geplanten Features"
      },
      {
        title: "Handynummer & Sprache Einstellungen",
        status: "in-progress",
        description: "Behebung von Problemen beim Speichern von Handynummer und Spracheinstellungen"
      },
      {
        title: "Automatische MLM-Datenerfassung",
        status: "planned",
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
        status: "completed",
        description: "Initiale Version mit grundlegenden Funktionen"
      }
    ]
  }
];

export default function Changelog() {
  const [isAdmin, setIsAdmin] = React.useState(false);
  const queryClient = useQueryClient();

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

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Changelog</h1>
      <p className="text-muted-foreground mb-8">
        Hier finden Sie alle Änderungen und geplanten Features unserer Anwendung.
      </p>
      
      <div className="space-y-6">
        {changelog.map((entry) => (
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