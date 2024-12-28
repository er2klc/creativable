import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    title: string;
    status: "completed" | "planned" | "in-progress";
    description: string;
  }[];
}

const changelog: ChangelogEntry[] = [
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
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: entries } = useQuery({
    queryKey: ["changelog_entries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("changelog_entries")
        .select("*")
        .order("version", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();
      
      setIsAdmin(profile?.is_admin || false);
    };

    checkAdminStatus();
  }, [user]);

  const handleStatusChange = async (version: string, title: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("changelog_entries")
        .update({ status: newStatus })
        .eq("version", version)
        .eq("title", title);

      if (error) throw error;

      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: ["changelog_entries"] });
      setIsEditing(null);
      toast.success("Status erfolgreich aktualisiert");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Fehler beim Aktualisieren des Status");
    }
  };

  const StatusBadge = ({ status, onClick }: { status: string; onClick?: () => void }) => (
    <span
      onClick={onClick}
      className={`text-xs px-2 py-1 rounded-full cursor-${onClick ? 'pointer' : 'default'} ${
        status === 'completed'
          ? 'bg-green-100 text-green-800'
          : status === 'in-progress'
          ? 'bg-blue-100 text-blue-800'
          : 'bg-orange-100 text-orange-800'
      }`}
    >
      {status === 'completed'
        ? '✓ Fertig'
        : status === 'in-progress'
        ? '⚡ In Arbeit'
        : '📅 Geplant'}
    </span>
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Changelog</h1>
      <p className="text-muted-foreground mb-8">
        Hier finden Sie alle Änderungen und geplanten Features unserer Anwendung.
      </p>
      
      <div className="space-y-6">
        {changelog.map((entry) => (
          <Card key={entry.version}>
            <CardHeader>
              <CardTitle>Version {entry.version}</CardTitle>
              <CardDescription>{entry.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entry.changes.map((change, index) => (
                  <div key={index} className="border-l-2 pl-4 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{change.title}</span>
                        {isAdmin && isEditing === `${entry.version}-${change.title}` ? (
                          <Select
                            defaultValue={change.status}
                            onValueChange={(value) => handleStatusChange(entry.version, change.title, value)}
                          >
                            <SelectTrigger className="w-[140px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="completed">✓ Fertig</SelectItem>
                              <SelectItem value="in-progress">⚡ In Arbeit</SelectItem>
                              <SelectItem value="planned">📅 Geplant</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <StatusBadge 
                            status={change.status} 
                            onClick={isAdmin ? () => setIsEditing(`${entry.version}-${change.title}`) : undefined}
                          />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {change.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}