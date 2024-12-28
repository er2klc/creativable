import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { ChangelogItem } from "./types";

interface ChangelogEntryProps {
  entry: {
    version: string;
    date: string;
    changes: ChangelogItem[];
  };
  isAdmin: boolean;
  onStatusChange: (version: string, title: string, newStatus: string) => Promise<void>;
}

export function ChangelogEntry({ entry, isAdmin, onStatusChange }: ChangelogEntryProps) {
  return (
    <Card>
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
                  <StatusBadge
                    status={change.status}
                    version={entry.version}
                    title={change.title}
                    isAdmin={isAdmin}
                    onStatusChange={onStatusChange}
                  />
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
  );
}