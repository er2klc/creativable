import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { ChangelogItem } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, X, Check } from "lucide-react";

interface ChangelogEntryProps {
  entry: {
    version: string;
    date: string;
    changes: ChangelogItem[];
  };
  isAdmin: boolean;
  onStatusChange: (version: string, title: string, newStatus: string) => Promise<void>;
  onDelete?: (version: string, title: string) => Promise<void>;
  onEdit?: (version: string, title: string, newTitle: string, newDescription: string) => Promise<void>;
}

export function ChangelogEntry({ entry, isAdmin, onStatusChange, onDelete, onEdit }: ChangelogEntryProps) {
  const [editingItem, setEditingItem] = useState<{
    title: string;
    description: string;
    originalTitle: string;
  } | null>(null);

  const handleEdit = (title: string, description: string) => {
    setEditingItem({
      title,
      description,
      originalTitle: title,
    });
  };

  const handleSave = async () => {
    if (editingItem && onEdit) {
      await onEdit(
        entry.version,
        editingItem.originalTitle,
        editingItem.title,
        editingItem.description
      );
      setEditingItem(null);
    }
  };

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
              {editingItem?.originalTitle === change.title ? (
                <div className="space-y-2">
                  <Input
                    value={editingItem.title}
                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                    className="mb-2"
                  />
                  <Textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="mb-2"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={handleSave}>
                      <Check className="h-4 w-4 mr-1" />
                      Speichern
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingItem(null)}>
                      <X className="h-4 w-4 mr-1" />
                      Abbrechen
                    </Button>
                  </div>
                </div>
              ) : (
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
                  {isAdmin && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEdit(change.title, change.description)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => onDelete?.(entry.version, change.title)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
              {!editingItem?.originalTitle && (
                <p className="text-sm text-muted-foreground mt-1">
                  {change.description}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}