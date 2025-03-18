
import React, { useState, useEffect } from "react";
import { Split } from "@geoffcox/react-splitter";
import { useEmailFolders } from "@/features/email/hooks/useEmailFolders";
import { useEmailMessages } from "@/features/email/hooks/useEmailMessages";
import { Inbox, Send, Trash2, Archive, File, Plus, Folder } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getFolderIcon, formatFolderName } from "@/features/email/hooks/useEmailFolders.helper";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface EmailLayoutProps {
  userEmail?: string;
  initialFolderPath?: string;
}

export function EmailLayout({ userEmail, initialFolderPath = "INBOX" }: EmailLayoutProps) {
  // State for folder and email management
  const [selectedFolderPath, setSelectedFolderPath] = useState<string>(initialFolderPath);
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [isCreateFolderDialogOpen, setIsCreateFolderDialogOpen] = useState(false);
  
  // Fetch folders and emails
  const { 
    folders, 
    isLoading: isFoldersLoading, 
    syncFolders,
    isSyncing: isFolderSyncing,
    createFolder
  } = useEmailFolders();
  
  const { 
    emails, 
    isLoading: isEmailsLoading,
    syncInProgress: isEmailSyncing,
    syncEmails,
    markAsRead,
    markAsStarred
  } = useEmailMessages(selectedFolderPath);
  
  // If initial folder path changes, update the selected folder
  useEffect(() => {
    if (initialFolderPath && initialFolderPath !== selectedFolderPath) {
      setSelectedFolderPath(initialFolderPath);
    }
  }, [initialFolderPath]);
  
  // If folders load and we have folders but no selected folder yet, select the first one
  useEffect(() => {
    if (!isFoldersLoading && folders.length > 0 && (!selectedFolderPath || selectedFolderPath === "INBOX")) {
      const inboxFolder = folders.find(folder => folder.type === "inbox");
      if (inboxFolder) {
        setSelectedFolderPath(inboxFolder.path);
      } else {
        setSelectedFolderPath(folders[0].path);
      }
    }
  }, [folders, isFoldersLoading, selectedFolderPath]);
  
  // Auto-sync emails when folder changes
  useEffect(() => {
    if (selectedFolderPath) {
      syncEmails();
    }
  }, [selectedFolderPath]);
  
  // Handle folder selection
  const handleFolderSelect = (folderPath: string) => {
    setSelectedFolderPath(folderPath);
    setSelectedEmailId(null); // Clear selected email when changing folders
  };
  
  // Handle email selection
  const handleEmailSelect = (emailId: string) => {
    setSelectedEmailId(emailId);
    
    // Mark as read when selected
    const email = emails.find(e => e.id === emailId);
    if (email && !email.read) {
      markAsRead(emailId, true);
    }
  };
  
  // Handle folder creation
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast.error("Please enter a folder name");
      return;
    }
    
    try {
      const result = await createFolder(newFolderName.trim());
      
      if (result.success) {
        setIsCreateFolderDialogOpen(false);
        setNewFolderName("");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    }
  };
  
  // Filter emails by search query
  const filteredEmails = emails.filter(email => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (email.subject && email.subject.toLowerCase().includes(query)) ||
      (email.from_name && email.from_name.toLowerCase().includes(query)) ||
      (email.from_email && email.from_email.toLowerCase().includes(query)) ||
      (email.text_content && email.text_content.toLowerCase().includes(query))
    );
  });

  // Render icons based on folder type
  const renderFolderIcon = (folderType: string) => {
    const iconName = getFolderIcon(folderType);
    
    switch (iconName) {
      case 'Inbox': return <Inbox className="h-4 w-4" />;
      case 'Send': return <Send className="h-4 w-4" />;
      case 'Trash2': return <Trash2 className="h-4 w-4" />;
      case 'Archive': return <Archive className="h-4 w-4" />;
      case 'FileEdit': return <File className="h-4 w-4" />;
      default: return <Folder className="h-4 w-4" />;
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Header with search and sync button */}
      <DashboardHeader
        title="Email"
        description={userEmail}
        searchQuery={searchQuery}
        searchPlaceholder="Search emails..."
        onSearchChange={setSearchQuery}
        actionLabel="Sync"
        actionIcon={<RefreshCw className="h-4 w-4 mr-2" />}
        onAction={() => syncEmails(true)}
        actionLoading={isEmailSyncing}
        secondaryActionLabel="New Folder"
        secondaryActionIcon={<Plus className="h-4 w-4 mr-2" />}
        onSecondaryAction={() => setIsCreateFolderDialogOpen(true)}
      />
      
      {/* Main email layout */}
      <div className="flex-1 overflow-hidden">
        <Split initialPrimarySize="250px" minPrimarySize="180px" minSecondarySize="300px">
          {/* Folder sidebar */}
          <div className="h-full flex flex-col border-r">
            <div className="p-2 flex justify-between items-center border-b">
              <h3 className="text-sm font-medium">Folders</h3>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7"
                onClick={() => syncFolders()}
                disabled={isFolderSyncing}
              >
                <RefreshCw className={cn("h-4 w-4", isFolderSyncing && "animate-spin")} />
              </Button>
            </div>
            
            <ScrollArea className="flex-1">
              {isFoldersLoading ? (
                <div className="p-2 space-y-2">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center space-x-2 p-2">
                      <Skeleton className="h-4 w-4" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  ))}
                </div>
              ) : folders.length === 0 ? (
                <div className="p-4 text-center text-sm text-muted-foreground">
                  <p>No folders found</p>
                  <Button 
                    variant="link" 
                    size="sm" 
                    onClick={() => syncFolders()}
                    disabled={isFolderSyncing}
                  >
                    Sync folders
                  </Button>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {folders.map((folder) => {
                    const isSelected = selectedFolderPath === folder.path;
                    return (
                      <Button
                        key={folder.id}
                        variant={isSelected ? "secondary" : "ghost"}
                        size="sm"
                        className={cn(
                          "w-full justify-start font-normal",
                          isSelected && "font-medium"
                        )}
                        onClick={() => handleFolderSelect(folder.path)}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center">
                            {renderFolderIcon(folder.type)}
                            <span className="ml-2 truncate">{formatFolderName(folder)}</span>
                          </div>
                          {folder.unread_messages > 0 && (
                            <Badge variant="secondary" className="ml-auto">
                              {folder.unread_messages}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Email list and content */}
          <Split initialPrimarySize="35%" minPrimarySize="200px" minSecondarySize="300px">
            {/* Email list */}
            <div className="h-full border-r">
              {isEmailsLoading ? (
                <div className="p-4 space-y-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  ))}
                </div>
              ) : filteredEmails.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No emails found</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    {searchQuery 
                      ? "Try a different search term"
                      : "There are no emails in this folder"}
                  </p>
                  <Button 
                    onClick={() => syncEmails(true)}
                    disabled={isEmailSyncing}
                  >
                    {isEmailSyncing ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sync Emails
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-full">
                  <div className="divide-y">
                    {filteredEmails.map((email) => {
                      const isSelected = email.id === selectedEmailId;
                      return (
                        <div
                          key={email.id}
                          className={cn(
                            "p-3 cursor-pointer hover:bg-muted/50 transition-colors",
                            isSelected && "bg-muted",
                            !email.read && "bg-primary-50 dark:bg-primary-950/20"
                          )}
                          onClick={() => handleEmailSelect(email.id)}
                        >
                          <div className="flex justify-between">
                            <div className="font-medium truncate">
                              {email.from_name || email.from_email}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(email.sent_at).toLocaleDateString()}
                            </div>
                          </div>
                          <div className={cn("truncate", !email.read && "font-semibold")}>
                            {email.subject || "(No subject)"}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1">
                            {email.text_content ? email.text_content.slice(0, 100) : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
            
            {/* Email content */}
            <div className="h-full overflow-auto">
              {selectedEmailId ? (
                <div className="p-4">
                  {(() => {
                    const email = emails.find(e => e.id === selectedEmailId);
                    if (!email) return null;
                    
                    return (
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-xl font-semibold">{email.subject || "(No subject)"}</h2>
                          <div className="mt-2 flex justify-between items-center">
                            <div>
                              <div className="font-medium">{email.from_name || email.from_email}</div>
                              <div className="text-sm text-muted-foreground">{email.from_email}</div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(email.sent_at).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        
                        <div className="border-t pt-4">
                          {email.html_content ? (
                            <div 
                              dangerouslySetInnerHTML={{ __html: email.html_content }} 
                              className="prose prose-sm max-w-none dark:prose-invert"
                            />
                          ) : (
                            <pre className="whitespace-pre-wrap text-sm">
                              {email.text_content || "No content"}
                            </pre>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <Mail className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg font-medium">No email selected</p>
                  <p className="text-sm text-muted-foreground">
                    Select an email to view its contents
                  </p>
                </div>
              )}
            </div>
          </Split>
        </Split>
      </div>
      
      {/* Create folder dialog */}
      <Dialog open={isCreateFolderDialogOpen} onOpenChange={setIsCreateFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>
              Enter a name for your new folder
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="e.g. Work, Personal, etc."
            />
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateFolderDialogOpen(false);
                setNewFolderName("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Helper icon components
const Mail = ({ className }: { className?: string }) => {
  return <Inbox className={className} />;
};
