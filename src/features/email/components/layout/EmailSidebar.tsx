
import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEmailFolders, EmailFolder } from '../../hooks/useEmailFolders';
import { 
  Archive, 
  CheckCircle2, 
  ChevronDown, 
  ChevronRight, 
  Clock, 
  File, 
  Inbox, 
  Loader2, 
  Mail,
  RefreshCcw, 
  Send, 
  Star, 
  Trash, 
  AlertTriangle
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface EmailSidebarProps {
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
}

// Helper to get icon based on folder type
function getFolderIcon(folder: EmailFolder) {
  switch (folder.type) {
    case 'inbox':
      return <Inbox className="h-4 w-4" />;
    case 'sent':
      return <Send className="h-4 w-4" />;
    case 'drafts':
      return <File className="h-4 w-4" />;
    case 'trash':
      return <Trash className="h-4 w-4" />;
    case 'spam':
      return <CheckCircle2 className="h-4 w-4" />;
    case 'archive':
      return <Archive className="h-4 w-4" />;
    default:
      return <Mail className="h-4 w-4" />;
  }
}

export function EmailSidebar({ selectedFolder, onSelectFolder }: EmailSidebarProps) {
  const { folders, isLoading, error, syncFolders, syncInProgress } = useEmailFolders();
  const [otherFoldersExpanded, setOtherFoldersExpanded] = React.useState(true);
  
  // Function to handle folder selection
  const handleSelectFolder = (folder: EmailFolder) => {
    onSelectFolder(folder.path);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 flex items-center justify-between">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton 
                key={i} 
                className="h-9 w-full rounded-md mb-1"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-3 flex items-center justify-between">
          <h2 className="font-semibold">E-Mail</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => syncFolders()}
            disabled={syncInProgress}
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center flex-col p-4">
          <AlertTriangle className="h-8 w-8 text-amber-500 mb-2" />
          <p className="text-sm text-center text-muted-foreground mb-2">
            Error loading folders
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => syncFolders()}
            disabled={syncInProgress}
          >
            {syncInProgress ? (
              <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Syncing...</>
            ) : (
              <>Sync Folders</>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 flex items-center justify-between">
        <h2 className="font-semibold">E-Mail</h2>
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => syncFolders()}
          disabled={syncInProgress}
        >
          {syncInProgress ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw className="h-4 w-4" />
          )}
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {/* Special folders section */}
            {folders.special.length > 0 ? (
              folders.special.map((folder) => (
                <Button
                  key={folder.id}
                  variant={folder.path === selectedFolder ? "secondary" : "ghost"}
                  className={cn("w-full justify-start", 
                    folder.path === selectedFolder && "bg-muted"
                  )}
                  onClick={() => handleSelectFolder(folder)}
                >
                  {getFolderIcon(folder)}
                  <span className="ml-2 flex-1 truncate">{folder.name}</span>
                  {folder.unread_messages > 0 && (
                    <span className="ml-auto text-xs font-medium bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                      {folder.unread_messages}
                    </span>
                  )}
                </Button>
              ))
            ) : (
              <div className="text-sm text-muted-foreground py-2 text-center">
                No special folders found
              </div>
            )}
            
            {/* Regular folders section with toggle */}
            {folders.regular.length > 0 && (
              <>
                <div 
                  className="flex items-center gap-2 py-2 text-sm text-muted-foreground cursor-pointer"
                  onClick={() => setOtherFoldersExpanded(!otherFoldersExpanded)}
                >
                  {otherFoldersExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                  <span>Andere Ordner</span>
                </div>
                
                {otherFoldersExpanded && (
                  <div className="pl-2 space-y-1">
                    {folders.regular.map((folder) => (
                      <Button
                        key={folder.id}
                        variant={folder.path === selectedFolder ? "secondary" : "ghost"}
                        className={cn("w-full justify-start",
                          folder.path === selectedFolder && "bg-muted"
                        )}
                        onClick={() => handleSelectFolder(folder)}
                      >
                        <Mail className="h-4 w-4" />
                        <span className="ml-2 flex-1 truncate">{folder.name}</span>
                        {folder.unread_messages > 0 && (
                          <span className="ml-auto text-xs font-medium bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                            {folder.unread_messages}
                          </span>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Empty state when no folders available */}
            {folders.all.length === 0 && (
              <div className="flex flex-col items-center justify-center py-8 px-2">
                <Mail className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-center text-muted-foreground mb-4">
                  No email folders found. Sync to fetch your folders.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => syncFolders()}
                  disabled={syncInProgress}
                >
                  {syncInProgress ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />Syncing...</>
                  ) : (
                    <>Sync Folders</>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
