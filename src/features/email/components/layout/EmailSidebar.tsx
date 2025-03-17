
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PenLine, Inbox, Send, Archive, Trash, Star, Tag, MailQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailSidebarProps {
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
}

interface FolderItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  unreadCount?: number;
}

export function EmailSidebar({ selectedFolder, onSelectFolder }: EmailSidebarProps) {
  // Mock folders - in a real implementation, these would come from the backend
  const folders: FolderItem[] = [
    { id: 'inbox', name: 'Posteingang', icon: <Inbox className="h-4 w-4" />, unreadCount: 12 },
    { id: 'drafts', name: 'Entwürfe', icon: <PenLine className="h-4 w-4" /> },
    { id: 'sent', name: 'Gesendet', icon: <Send className="h-4 w-4" /> },
    { id: 'starred', name: 'Wichtig', icon: <Star className="h-4 w-4" /> },
    { id: 'archive', name: 'Archiv', icon: <Archive className="h-4 w-4" /> },
    { id: 'spam', name: 'Spam', icon: <MailQuestion className="h-4 w-4" /> },
    { id: 'trash', name: 'Papierkorb', icon: <Trash className="h-4 w-4" /> },
  ];

  // Mock labels - in a real implementation, these would come from the backend
  const labels: { id: string; name: string; color: string }[] = [
    { id: 'work', name: 'Arbeit', color: 'bg-blue-500' },
    { id: 'personal', name: 'Persönlich', color: 'bg-green-500' },
    { id: 'urgent', name: 'Dringend', color: 'bg-red-500' },
  ];

  return (
    <div className="flex flex-col h-full p-2">
      <div className="mb-4">
        <Button className="w-full" size="lg">
          <PenLine className="mr-2 h-4 w-4" />
          Neue E-Mail
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {folders.map((folder) => (
            <Button
              key={folder.id}
              variant={selectedFolder === folder.id ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                selectedFolder === folder.id && "bg-secondary"
              )}
              onClick={() => onSelectFolder(folder.id)}
            >
              {folder.icon}
              <span className="ml-2 flex-1 text-left">{folder.name}</span>
              {folder.unreadCount ? (
                <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {folder.unreadCount}
                </span>
              ) : null}
            </Button>
          ))}

          <div className="pt-4 pb-2">
            <p className="px-2 text-xs font-semibold text-muted-foreground">
              Labels
            </p>
          </div>

          {labels.map((label) => (
            <Button
              key={label.id}
              variant="ghost"
              className="w-full justify-start"
            >
              <div className={cn("mr-2 h-3 w-3 rounded-full", label.color)} />
              <span className="text-left">{label.name}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
