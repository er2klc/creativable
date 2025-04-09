
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "react-router-dom";
import { Plus, Instagram, Linkedin, CalendarPlus, FileText, Link2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useSession } from "@supabase/auth-helpers-react";
import { useSettings } from "@/hooks/use-settings";
import { CreateInstagramContactDialog } from "@/components/leads/detail/social/CreateInstagramContactDialog";
import { CreateLinkedInContactDialog } from "@/components/leads/detail/social/CreateLinkedInContactDialog";

interface ShortcutDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShortcutDialog: React.FC<ShortcutDialogProps> = ({ isOpen, onClose }) => {
  return null; // Placeholder implementation
};

export const QuickActions = () => {
  const router = useRouter();
  const session = useSession();
  const { settings } = useSettings();

  const [showInstagramDialog, setShowInstagramDialog] = useState(false);
  const [showLinkedInDialog, setShowLinkedInDialog] = useState(false);
  const [showShortcutDialog, setShowShortcutDialog] = useState(false);

  const handleNewLeadClick = () => {
    router.push("/leads/new");
  };

  const handleNewTaskClick = () => {
    router.push("/tasks/new");
  };

  const handleNewNoteClick = () => {
    router.push("/notes/new");
  };

  const handleNewLinkClick = () => {
    router.push("/links/new");
  };

  const handleContactCreated = (leadId: string) => {
    router.push(`/leads/${leadId}`);
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <Tabs defaultValue="contacts">
          <TabsList className="mb-4">
            <TabsTrigger value="contacts">
              {settings?.language === "en" ? "New Contact" : "Neuer Kontakt"}
            </TabsTrigger>
            <TabsTrigger value="tasks">
              {settings?.language === "en" ? "Tasks" : "Aufgaben"}
            </TabsTrigger>
            <TabsTrigger value="other">
              {settings?.language === "en" ? "Other" : "Sonstiges"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contacts" className="space-y-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <Button variant="outline" className="flex flex-col h-24 items-center justify-center space-y-1" onClick={handleNewLeadClick}>
                <Plus className="h-5 w-5" />
                <span>{settings?.language === "en" ? "Manual Entry" : "Manuell"}</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-24 items-center justify-center space-y-1" onClick={() => setShowInstagramDialog(true)}>
                <Instagram className="h-5 w-5 text-pink-500" />
                <span>Instagram</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-24 items-center justify-center space-y-1" onClick={() => setShowLinkedInDialog(true)}>
                <Linkedin className="h-5 w-5 text-blue-600" />
                <span>LinkedIn</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <Button variant="outline" className="flex flex-col h-24 items-center justify-center space-y-1" onClick={handleNewTaskClick}>
                <CalendarPlus className="h-5 w-5" />
                <span>{settings?.language === "en" ? "New Task" : "Neue Aufgabe"}</span>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="other" className="space-y-0">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              <Button variant="outline" className="flex flex-col h-24 items-center justify-center space-y-1" onClick={handleNewNoteClick}>
                <FileText className="h-5 w-5" />
                <span>{settings?.language === "en" ? "New Note" : "Neue Notiz"}</span>
              </Button>
              <Button variant="outline" className="flex flex-col h-24 items-center justify-center space-y-1" onClick={handleNewLinkClick}>
                <Link2 className="h-5 w-5" />
                <span>{settings?.language === "en" ? "New Link" : "Neuer Link"}</span>
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Dialogs */}
      <CreateInstagramContactDialog 
        isOpen={showInstagramDialog} 
        onClose={() => setShowInstagramDialog(false)} 
        onSuccess={handleContactCreated}
      />
      
      <CreateLinkedInContactDialog 
        isOpen={showLinkedInDialog} 
        onClose={() => setShowLinkedInDialog(false)} 
        onSuccess={handleContactCreated}
      />
      
      {showShortcutDialog && (
        <ShortcutDialog 
          isOpen={showShortcutDialog}
          onClose={() => setShowShortcutDialog(false)}
        />
      )}
    </Card>
  );
};
