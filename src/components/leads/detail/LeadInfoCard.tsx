import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { BasicInformationFields } from "./contact-info/BasicInformationFields";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { LeadCardHeader } from "./card/LeadCardHeader";

interface LeadInfoCardProps {
  lead: Tables<"leads">;
  onDelete: (id: string) => void;
}

export function LeadInfoCard({ lead, onUpdate }: LeadInfoCardProps) {
  const { settings } = useSettings();

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2 border-b border-gray-200/30 shadow-sm">
        <LeadCardHeader lead={lead} />
      </CardHeader>
      <CardContent className="space-y-6">
        <BasicInformationFields lead={lead} onUpdate={onUpdate} />
        <div className="h-px bg-gray-200/80" />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="text-destructive hover:text-destructive hover:bg-destructive/10 flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              {settings?.language === "en" ? "Delete Contact" : "Kontakt löschen"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {settings?.language === "en" ? "Delete Contact" : "Kontakt löschen"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {settings?.language === "en" 
                  ? "This will permanently delete the contact and all related data. This action cannot be undone."
                  : "Dies wird den Kontakt und alle zugehörigen Daten dauerhaft löschen. Diese Aktion kann nicht rückgängig gemacht werden."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {settings?.language === "en" ? "Cancel" : "Abbrechen"}
              </AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => onDelete(lead.id)}
                className="bg-destructive hover:bg-destructive/90"
              >
                {settings?.language === "en" ? "Delete" : "Löschen"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}