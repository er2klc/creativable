
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Inbox, Send, FileEdit, Trash2, AlertOctagon, Archive, Folder, Plus, RefreshCw, File, Loader2, MoreVertical, Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmailFolder } from "../../hooks/useEmailFolders";
import { formatFolderName, getFolderIcon } from "../../hooks/useEmailFolders.helper";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface FolderItemProps {
  folder: EmailFolder;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => Promise<boolean>;
}

const FolderItem = ({ folder, isSelected, onSelect, onDelete }: FolderItemProps) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Function to get folder icon
  const getIcon = () => {
    let Icon;
    
    switch (folder.type) {
      case 'inbox': Icon = Inbox; break;
      case 'sent': Icon = Send; break;
      case 'drafts': Icon = FileEdit; break;
      case 'trash': Icon = Trash2; break;
      case 'spam': Icon = AlertOctagon; break;
      case 'archive': Icon = Archive; break;
      default: Icon = Folder;
    }
    
    return <Icon className="h-4 w-4 mr-2" />;
  };
  
  const isDefaultFolder = ['inbox', 'sent', 'drafts', 'trash', 'spam', 'archive'].includes(folder.type);
  
  const handleDeleteRequest = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (onDelete) {
      await onDelete();
    }
    setIsDeleteDialogOpen(false);
  };
  
  return (
    <>
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
          isSelected ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
        )}
        onClick={onSelect}
      >
        <div className="flex items-center overflow-hidden">
          {getIcon()}
          <span className="truncate">{formatFolderName(folder)}</span>
          {folder.unread_messages > 0 && (
            <span className="ml-auto pl-2 text-xs rounded-full bg-primary text-primary-foreground w-5 h-5 flex items-center justify-center">
              {folder.unread_messages > 99 ? "99+" : folder.unread_messages}
            </span>
          )}
        </div>
        
        {!isDefaultFolder && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100"
            onClick={handleDeleteRequest}
          >
            <Trash className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
          </Button>
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Folder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{formatFolderName(folder)}"? This action cannot be undone and will also delete the folder on your mail server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

interface EmailSidebarProps {
  folders: EmailFolder[];
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
  onRefreshFolders: () => Promise<boolean | void>;
  onCreateFolder: (name: string) => Promise<boolean>;
  onDeleteFolder: (path: string) => Promise<boolean>;
}

export function EmailSidebar({ 
  folders, 
  selectedFolder, 
  onSelectFolder,
  onRefreshFolders,
  onCreateFolder,
  onDeleteFolder
}: EmailSidebarProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const handleRefresh = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    try {
      await onRefreshFolders();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim() || isCreatingFolder) return;
    
    setIsCreatingFolder(true);
    try {
      const success = await onCreateFolder(newFolderName.trim());
      if (success) {
        setNewFolderName('');
        setIsCreateDialogOpen(false);
      }
    } finally {
      setIsCreatingFolder(false);
    }
  };
  
  // Group folders by type
  const specialFolders = folders.filter(f => 
    ['inbox', 'sent', 'drafts', 'trash', 'spam', 'archive'].includes(f.type)
  );
  
  const regularFolders = folders.filter(f => 
    !['inbox', 'sent', 'drafts', 'trash', 'spam', 'archive'].includes(f.type)
  );
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Folders</h2>
        <div className="flex space-x-1">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {/* Special Folders */}
          {specialFolders.map(folder => (
            <FolderItem
              key={folder.id}
              folder={folder}
              isSelected={selectedFolder === folder.path}
              onSelect={() => onSelectFolder(folder.path)}
            />
          ))}
          
          {specialFolders.length > 0 && regularFolders.length > 0 && (
            <div className="my-3 border-t border-border" />
          )}
          
          {/* Regular Folders */}
          {regularFolders.map(folder => (
            <FolderItem
              key={folder.id}
              folder={folder}
              isSelected={selectedFolder === folder.path}
              onSelect={() => onSelectFolder(folder.path)}
              onDelete={() => onDeleteFolder(folder.path)}
            />
          ))}
          
          {folders.length === 0 && !refreshing && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              <div className="mb-2 flex justify-center">
                <File className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p>No folders found</p>
              <Button variant="link" size="sm" onClick={handleRefresh} className="mt-1">
                Refresh Folders
              </Button>
            </div>
          )}
        </div>
      </ScrollArea>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new mail folder. This will be created on your email server.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Input 
              placeholder="Folder name" 
              value={newFolderName} 
              onChange={e => setNewFolderName(e.target.value)} 
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleCreateFolder();
                }
              }}
            />
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isCreatingFolder}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateFolder}
              disabled={!newFolderName.trim() || isCreatingFolder}
            >
              {isCreatingFolder ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
