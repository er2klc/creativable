import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChangelogEntry } from "@/components/changelog/ChangelogEntry";
import { ChangelogItem } from "@/components/changelog/types";

const defaultChangelog = [
  {
    version: "0.3",
    date: "2024-12-31",
    changes: [
      {
        title: "Unity Teams Plattform",
        status: "completed" as const,
        description: "Neue Teams-Plattform mit der Möglichkeit Teams zu erstellen und über Einladungscodes beizutreten"
      },
      {
        title: "Team Management",
        status: "completed" as const,
        description: "Verwaltung von Teammitgliedern, Rollen (Admin, Mitglied) und Team-Einstellungen"
      },
      {
        title: "Team Snaps Feature",
        status: "in-progress" as const,
        description: "Entwicklung einer Snaps-Funktion für Teams zur besseren visuellen Kommunikation"
      },
      {
        title: "Elevate Plattform",
        status: "planned" as const,
        description: "Geplante Elevate-Plattform für erweiterte Teamfunktionen und Schulungen"
      },
      {
        title: "Navigation Restrukturierung",
        status: "completed" as const,
        description: "Verbesserte Navigation mit klarer Trennung in Persönlich, Teams & Gruppen, Analyse & Tools und Rechtliches"
      },
      {
        title: "Team Kategorien",
        status: "completed" as const,
        description: "Möglichkeit Kategorien für Team-Diskussionen und Beiträge zu erstellen"
      },
      {
        title: "Team News System",
        status: "completed" as const,
        description: "Integriertes Nachrichtensystem für wichtige Team-Ankündigungen"
      }
    ]
  },
  {
    version: "0.2",
    date: "2024-12-29",
    changes: [
      {
        title: "Verbesserte Registrierung",
        status: "completed" as const,
        description: "Live-Tracking für Passwort-Anforderungen während der Registrierung"
      },
      {
        title: "Account-Verwaltung",
        status: "completed" as const,
        description: "Möglichkeit zum Löschen des Benutzerkontos hinzugefügt"
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
        title: "Social Media Integrationen",
        status: "in-progress" as const,
        description: "Integration verschiedener Social-Media-Plattformen für besseres Lead-Management"
      }
    ]
  },
  {
    version: "0.1",
    date: "2024-12-21",
    changes: [
      {
        title: "Erste Version",
        status: "completed" as const,
        description: "Initiale Version mit grundlegenden Funktionen"
      },
      {
        title: "Social Media Integrationen",
        status: "completed" as const,
        description: "Grundlegende Integration von verschiedenen Social-Media-Plattformen"
      },
      {
        title: "KI-Nachrichtengenerierung",
        status: "completed" as const,
        description: "Automatische Generierung von personalisierten Nachrichten mit KI"
      },
      {
        title: "Lead-Zusammenfassungen",
        status: "completed" as const,
        description: "KI-gestützte Zusammenfassungen von Lead-Informationen"
      },
      {
        title: "Notizen & Aufgaben",
        status: "completed" as const,
        description: "System zum Erstellen und Verwalten von Notizen und Aufgaben"
      },
      {
        title: "Kanban-Ansicht",
        status: "completed" as const,
        description: "Drag & Drop Kanban-Board für Lead-Management"
      },
      {
        title: "Spracheinstellungen",
        status: "completed" as const,
        description: "Anpassbare Hauptsprache für die Benutzeroberfläche"
      },
      {
        title: "Über Mich Profil",
        status: "completed" as const,
        description: "Profilbereich für bessere KI-Personalisierung"
      },
      {
        title: "Anpassbare Lead-Phasen",
        status: "completed" as const,
        description: "Benutzerdefinierte Erstellung und Benennung von Lead-Phasen"
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
