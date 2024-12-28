import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Changelog</h1>
      <p className="text-muted-foreground mb-8">
        Hier finden Sie alle Änderungen und geplanten Features unserer Anwendung.
      </p>
      
      <ScrollArea className="h-[600px] rounded-md border p-4">
        {changelog.map((entry) => (
          <Card key={entry.version} className="mb-6">
            <CardHeader>
              <CardTitle>Version {entry.version}</CardTitle>
              <CardDescription>{entry.date}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entry.changes.map((change, index) => (
                  <div key={index} className="border-l-2 pl-4 py-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{change.title}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        change.status === 'completed' ? 'bg-green-100 text-green-800' :
                        change.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {change.status === 'completed' ? '✓ Fertig' :
                         change.status === 'in-progress' ? '⚡ In Arbeit' :
                         '📅 Geplant'}
                      </span>
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
      </ScrollArea>
    </div>
  );
}