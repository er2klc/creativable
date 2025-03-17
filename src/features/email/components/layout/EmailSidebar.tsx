
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PenLine, Inbox, Send, Archive, Trash, Star, Tag, MailQuestion, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useEmailFolders } from '../../hooks/useEmailFolders';
import { Skeleton } from '@/components/ui/skeleton';

interface EmailSidebarProps {
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
}

export function EmailSidebar({ selectedFolder, onSelectFolder }: EmailSidebarProps) {
  const { folders, isLoading, refreshFolders } = useEmailFolders();

  // Filter folders by type to organize them
  const inboxFolder = folders.find(f => f.type === 'inbox') || { id: 'inbox', name: 'Posteingang', path: 'INBOX', type: 'inbox', unreadCount: 0 };
  const sentFolder = folders.find(f => f.type === 'sent') || { id: 'sent', name: 'Gesendet', path: 'Sent', type: 'sent' };
  const draftsFolder = folders.find(f => f.type === 'drafts') || { id: 'drafts', name: 'Entwürfe', path: 'Drafts', type: 'drafts' };
  const trashFolder = folders.find(f => f.type === 'trash') || { id: 'trash', name: 'Papierkorb', path: 'Trash', type: 'trash' };
  const spamFolder = folders.find(f => f.type === 'spam') || { id: 'spam', name: 'Spam', path: 'Spam', type: 'spam' };
  const archiveFolder = folders.find(f => f.type === 'archive') || { id: 'archive', name: 'Archiv', path: 'Archive', type: 'archive' };
  
  // Special folders to always show at the top
  const specialFolders = [
    { id: inboxFolder.id, name: inboxFolder.name, icon: <Inbox className="h-4 w-4" />, unreadCount: inboxFolder.unread_messages || 0, path: inboxFolder.path, type: inboxFolder.type },
    { id: draftsFolder.id, name: draftsFolder.name, icon: <PenLine className="h-4 w-4" />, path: draftsFolder.path, type: draftsFolder.type },
    { id: sentFolder.id, name: sentFolder.name, icon: <Send className="h-4 w-4" />, path: sentFolder.path, type: sentFolder.type },
    { id: archiveFolder.id, name: archiveFolder.name, icon: <Archive className="h-4 w-4" />, path: archiveFolder.path, type: archiveFolder.type },
    { id: spamFolder.id, name: spamFolder.name, icon: <MailQuestion className="h-4 w-4" />, path: spamFolder.path, type: spamFolder.type },
    { id: trashFolder.id, name: trashFolder.name, icon: <Trash className="h-4 w-4" />, path: trashFolder.path, type: trashFolder.type },
  ];
  
  // Custom folders (exclude the special ones)
  const customFolders = folders.filter(
    folder => !['inbox', 'sent', 'drafts', 'trash', 'spam', 'archive'].includes(folder.type)
  );

  // Define common icons and labels
  const getFolderIcon = (type: string) => {
    switch (type) {
      case 'inbox': return <Inbox className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'drafts': return <PenLine className="h-4 w-4" />;
      case 'archive': return <Archive className="h-4 w-4" />;
      case 'spam': return <MailQuestion className="h-4 w-4" />;
      case 'trash': return <Trash className="h-4 w-4" />;
      default: return <Tag className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full p-2">
        <div className="mb-4">
          <Skeleton className="w-full h-10" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="w-full h-9" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full p-2">
      <div className="mb-4 flex flex-col gap-2">
        <Button className="w-full" size="lg">
          <PenLine className="mr-2 h-4 w-4" />
          Neue E-Mail
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full" 
          onClick={() => refreshFolders()}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Ordner aktualisieren
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1">
          {specialFolders.map((folder) => (
            <Button
              key={folder.id}
              variant={selectedFolder === folder.path ? "secondary" : "ghost"}
              className={cn(
                "w-full justify-start",
                selectedFolder === folder.path && "bg-secondary"
              )}
              onClick={() => onSelectFolder(folder.path)}
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

          {customFolders.length > 0 && (
            <>
              <div className="pt-4 pb-2">
                <p className="px-2 text-xs font-semibold text-muted-foreground">
                  Andere Ordner
                </p>
              </div>

              {customFolders.map((folder) => (
                <Button
                  key={folder.id}
                  variant={selectedFolder === folder.path ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    selectedFolder === folder.path && "bg-secondary"
                  )}
                  onClick={() => onSelectFolder(folder.path)}
                >
                  {getFolderIcon(folder.type)}
                  <span className="ml-2 flex-1 text-left">{folder.name}</span>
                  {folder.unread_messages > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                      {folder.unread_messages}
                    </span>
                  )}
                </Button>
              ))}
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
