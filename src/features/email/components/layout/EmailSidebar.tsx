
import React, { useState } from 'react';
import { useEmailFolders, EmailFolder } from '../../hooks/useEmailFolders';
import { cn } from "@/lib/utils";
import { 
  Inbox, Send, File, Trash, AlertCircle, Archive, 
  FolderPlus, RefreshCw, MoreVertical, Folder, Pencil, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface EmailSidebarProps {
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
}

export function EmailSidebar({ selectedFolder, onSelectFolder }: EmailSidebarProps) {
  const { 
    folders, 
    isLoading, 
    syncFolders, 
    syncInProgress,
    createFolder,
    deleteFolder
  } = useEmailFolders();
  
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
  
  const handleCreateFolder = async () => {
    if (newFolderName.trim()) {
      await createFolder(newFolderName.trim());
      setNewFolderName('');
      setIsCreateFolderOpen(false);
    }
  };
  
  const handleDeleteFolder = async (folder: EmailFolder, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (confirm(`Are you sure you want to delete the folder "${folder.name}"?`)) {
      await deleteFolder(folder.path);
    }
  };
  
  const getFolderIcon = (folderType: string) => {
    switch (folderType.toLowerCase()) {
      case 'inbox': return <Inbox className="h-4 w-4" />;
      case 'sent': return <Send className="h-4 w-4" />;
      case 'drafts': return <File className="h-4 w-4" />;
      case 'trash': return <Trash className="h-4 w-4" />;
      case 'spam': return <AlertCircle className="h-4 w-4" />;
      case 'archive': return <Archive className="h-4 w-4" />;
      default: return <Folder className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b flex justify-between items-center">
        <h3 className="font-semibold text-sm">Folders</h3>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={() => syncFolders()}
            disabled={syncInProgress}
          >
            <RefreshCw className={cn("h-4 w-4", syncInProgress && "animate-spin")} />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7"
            onClick={() => setIsCreateFolderOpen(true)}
          >
            <FolderPlus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1 px-1">
        <div className="py-2 space-y-1">
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
            </div>
          ) : (
            <>
              {/* Special Folders */}
              {folders.special.map(folder => (
                <div
                  key={folder.id}
                  className={cn(
                    "flex items-center justify-between px-3 py-1.5 text-sm rounded-md cursor-pointer",
                    selectedFolder === folder.path 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => onSelectFolder(folder.path)}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    {getFolderIcon(folder.type)}
                    <span className="truncate">{folder.name}</span>
                  </div>
                  {folder.unread_messages > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {folder.unread_messages}
                    </Badge>
                  )}
                </div>
              ))}
              
              {folders.special.length > 0 && folders.regular.length > 0 && (
                <div className="h-px bg-border my-2 mx-3" />
              )}
              
              {/* Regular Folders */}
              {folders.regular.map(folder => (
                <div
                  key={folder.id}
                  className={cn(
                    "group flex items-center justify-between px-3 py-1.5 text-sm rounded-md cursor-pointer",
                    selectedFolder === folder.path 
                      ? "bg-primary/10 text-primary font-medium" 
                      : "hover:bg-muted"
                  )}
                  onClick={() => onSelectFolder(folder.path)}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    {getFolderIcon(folder.type)}
                    <span className="truncate">{folder.name}</span>
                  </div>
                  <div className="flex items-center">
                    {folder.unread_messages > 0 && (
                      <Badge variant="secondary" className="mr-1">
                        {folder.unread_messages}
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={(e) => handleDeleteFolder(folder, e)}>
                          <Trash className="h-4 w-4 mr-2 text-destructive" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
              
              {folders.all.length === 0 && (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  No folders found
                </div>
              )}
            </>
          )}
        </div>
      </ScrollArea>
      
      {/* Create Folder Dialog */}
      <Dialog open={isCreateFolderOpen} onOpenChange={setIsCreateFolderOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for the new folder to create in your email account.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="folder-name" className="text-right">
                Folder Name
              </Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="col-span-3"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
