import { DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tables } from "@/integrations/supabase/types";
import { Star, XCircle, Instagram, Linkedin, Facebook, Video, Users, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Platform } from "@/config/platforms";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import confetti from 'canvas-confetti';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useState } from "react";

interface LeadDetailHeaderProps {
  lead: Tables<"leads">;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
}

export function LeadDetailHeader({ lead, onUpdateLead }: LeadDetailHeaderProps) {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const triggerPartnerAnimation = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#4CAF50', '#8BC34A', '#CDDC39']
    });
  };

  const triggerCustomerAnimation = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#2196F3', '#03A9F4', '#00BCD4']
    });
  };

  const handleNameChange = async (name: string) => {
    await onUpdateLead({ name });
  };

  const handleStatusChange = async (status: string) => {
    try {
      await onUpdateLead({ 
        status,
        ...(status === 'partner' ? {
          onboarding_progress: {
            message_sent: false,
            team_invited: false,
            training_provided: false,
            intro_meeting_scheduled: false
          }
        } : {})
      });

      // Create timeline entry
      const { error: noteError } = await supabase
        .from("notes")
        .insert({
          lead_id: lead.id,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          content: `Status geändert zu ${status}`,
          color: status === 'partner' ? '#4CAF50' : 
                 status === 'customer' ? '#2196F3' : 
                 status === 'not_for_now' ? '#FFC107' : '#F44336',
          metadata: {
            type: 'status_change',
            oldStatus: lead.status,
            newStatus: status
          }
        });

      if (noteError) throw noteError;
      
      // Trigger animation for partner/customer
      if (status === 'partner') {
        triggerPartnerAnimation();
      } else if (status === 'customer') {
        triggerCustomerAnimation();
      }

      toast.success(
        settings?.language === "en"
          ? "Status updated successfully"
          : "Status erfolgreich aktualisiert"
      );

      // Navigate to pool page
      navigate('/pool');
      
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error(
        settings?.language === "en"
          ? "Error updating status"
          : "Fehler beim Aktualisieren des Status"
      );
    }
  };

  const handleDelete = async () => {
    try {
      const relatedTables = [
        'contact_group_states',
        'instagram_scan_history',
        'lead_files',
        'lead_subscriptions',
        'messages',
        'notes',
        'tasks'
      ];

      // Delete related records first
      for (const table of relatedTables) {
        const { error } = await supabase
          .from(table)
          .delete()
          .eq('lead_id', lead.id);
        
        if (error) throw error;
      }

      // Delete the lead
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', lead.id);

      if (error) throw error;

      toast.success(
        settings?.language === "en"
          ? "Contact deleted successfully"
          : "Kontakt erfolgreich gelöscht"
      );

      navigate('/contacts');
    } catch (error) {
      console.error('Error deleting lead:', error);
      toast.error(
        settings?.language === "en"
          ? "Error deleting contact"
          : "Fehler beim Löschen des Kontakts"
      );
    }
  };

  const getPlatformIcon = (platform: Platform) => {
    switch (platform) {
      case "Instagram":
        return <Instagram className="h-4 w-4 mr-2" />;
      case "LinkedIn":
        return <Linkedin className="h-4 w-4 mr-2" />;
      case "Facebook":
        return <Facebook className="h-4 w-4 mr-2" />;
      case "TikTok":
        return <Video className="h-4 w-4 mr-2" />;
      case "Offline":
        return <Users className="h-4 w-4 mr-2" />;
      default:
        return null;
    }
  };

  return (
    <>
      <DialogHeader className="p-6 bg-card border-b">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              {getPlatformIcon(lead.platform as Platform)}
              <input
                type="text"
                value={lead.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="text-2xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "transition-colors border-b-2",
                  lead.status === 'partner' ? 'border-b-green-500 text-green-700 hover:bg-green-50' : 'border-b-transparent'
                )}
                onClick={() => handleStatusChange('partner')}
              >
                <Star className="h-4 w-4 mr-2" />
                Partner
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "transition-colors border-b-2",
                  lead.status === 'customer' ? 'border-b-blue-500 text-blue-700 hover:bg-blue-50' : 'border-b-transparent'
                )}
                onClick={() => handleStatusChange('customer')}
              >
                <Star className="h-4 w-4 mr-2" />
                Kunde
              </Button>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "transition-colors border-b-2",
                  lead.status === 'not_for_now' ? 'border-b-yellow-500 text-yellow-700 hover:bg-yellow-50' : 'border-b-transparent'
                )}
                onClick={() => handleStatusChange('not_for_now')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Not For Now
              </Button>
              <Button 
                variant="outline"
                size="sm"
                className={cn(
                  "transition-colors border-b-2",
                  lead.status === 'no_interest' ? 'border-b-red-500 text-red-700 hover:bg-red-50' : 'border-b-transparent'
                )}
                onClick={() => handleStatusChange('no_interest')}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Kein Interesse
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </Button>
            </div>
          </div>
          <CompactPhaseSelector
            lead={lead}
            onUpdateLead={onUpdateLead}
          />
        </div>
      </DialogHeader>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {settings?.language === "en" 
                ? "Delete Contact" 
                : "Kontakt löschen"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {settings?.language === "en"
                ? "This action cannot be undone. This will permanently delete the contact and all associated data."
                : "Diese Aktion kann nicht rückgängig gemacht werden. Der Kontakt und alle zugehörigen Daten werden dauerhaft gelöscht."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {settings?.language === "en" ? "Cancel" : "Abbrechen"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {settings?.language === "en" ? "Delete" : "Löschen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}