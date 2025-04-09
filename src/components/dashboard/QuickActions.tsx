import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Instagram, Linkedin } from "lucide-react";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/components/ui/use-toast";
import { AddLeadDialog } from "@/components/leads/AddLeadDialog";
import { CreateInstagramContactDialog } from "@/components/leads/detail/social/CreateInstagramContactDialog";
import { CreateLinkedInContactDialog } from "@/components/leads/detail/social/CreateLinkedInContactDialog";
import { ShortcutDialog } from "./ShortcutDialog";

export const QuickActions = () => {
  const { settings } = useSettings();
  const { toast } = useToast();
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  const [isInstagramDialogOpen, setIsInstagramDialogOpen] = useState(false);
  const [isLinkedInDialogOpen, setIsLinkedInDialogOpen] = useState(false);
  const [isShortcutDialogOpen, setIsShortcutDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-6">
      <Card className="bg-black/40 border-none shadow-lg backdrop-blur-md">
        <CardHeader>
          <CardTitle className="text-white">
            {settings?.language === "en" ? "Quick Actions" : "Schnellaktionen"}
          </CardTitle>
          <CardDescription className="text-gray-300">
            {settings?.language === "en"
              ? "Quickly create new leads and contacts"
              : "Erstellen Sie schnell neue Leads und Kontakte"}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <Button
            onClick={() => setIsAddLeadDialogOpen(true)}
            className="w-full justify-start text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {settings?.language === "en" ? "Add Lead" : "Lead hinzufügen"}
          </Button>
          <Button
            onClick={() => {
              toast({
                title: "Coming Soon!",
                description: "This feature is under development.",
              });
            }}
            className="w-full justify-start text-white"
            disabled
          >
            <Users className="w-4 h-4 mr-2" />
            {settings?.language === "en" ? "Add Contact" : "Kontakt hinzufügen"}
          </Button>
          <Button
            onClick={() => setIsInstagramDialogOpen(true)}
            className="w-full justify-start text-white"
          >
            <Instagram className="w-4 h-4 mr-2" />
            {settings?.language === "en"
              ? "Add Instagram Contact"
              : "Instagram-Kontakt hinzufügen"}
          </Button>
          <Button
            onClick={() => setIsLinkedInDialogOpen(true)}
            className="w-full justify-start text-white"
          >
            <Linkedin className="w-4 h-4 mr-2" />
            {settings?.language === "en"
              ? "Add LinkedIn Contact"
              : "LinkedIn-Kontakt hinzufügen"}
          </Button>
          <Button
            onClick={() => setIsShortcutDialogOpen(true)}
            className="w-full justify-start text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            {settings?.language === "en"
              ? "Add Shortcut"
              : "Shortcut hinzufügen"}
          </Button>
        </CardContent>
      </Card>

      <AddLeadDialog
        open={isAddLeadDialogOpen}
        onOpenChange={setIsAddLeadDialogOpen}
      />

      <CreateInstagramContactDialog
        open={isInstagramDialogOpen}
        onOpenChange={setIsInstagramDialogOpen}
        pipelineId={null}
      />

      <CreateLinkedInContactDialog
        open={isLinkedInDialogOpen}
        onOpenChange={setIsLinkedInDialogOpen}
        pipelineId={null}
      />

      <ShortcutDialog
        open={isShortcutDialogOpen}
        onOpenChange={setIsShortcutDialogOpen}
      />
    </div>
  );
};
