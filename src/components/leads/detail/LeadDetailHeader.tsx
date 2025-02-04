import { DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useSettings } from "@/hooks/use-settings";
import { useState } from "react";
import { CompactPhaseSelector } from "./CompactPhaseSelector";
import { LeadWithRelations } from "@/types/leads";
import { StatusButtons } from "./header/StatusButtons";
import { DeleteLeadDialog } from "./header/DeleteLeadDialog";
import { LeadName } from "./header/LeadName";
import { Platform } from "@/config/platforms";
import { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";

export interface LeadDetailHeaderProps {
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<Tables<"leads">>) => void;
  onDeleteLead: () => void;
}

export function LeadDetailHeader({ lead, onUpdateLead, onDeleteLead }: LeadDetailHeaderProps) {
  const { settings } = useSettings();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  /**
   * Statusänderung für einen Lead verwalten.
   * - Speichert den Status direkt in der `leads`-Tabelle.
   * - Keine Speicherung mehr in `notes` oder `timeline`.
   * - Timeline zeigt den aktuellen `status` aus `leads`.
   */
  const handleStatusChange = async (newStatus: string) => {
    try {
      // Falls derselbe Status gewählt wurde, wird er zurück auf 'lead' gesetzt
      const status = lead.status === newStatus ? "lead" : newStatus;

      // Aktualisierung des Status direkt in der `leads`-Tabelle
      const updates: Partial<Tables<"leads">> = {
        status,
      };

      await onUpdateLead(updates);

      // Erfolgreiche Statusänderung bestätigen
      toast.success(
        settings?.language === "en"
          ? "Status erfolgreich aktualisiert"
          : "Status erfolgreich aktualisiert"
      );
    } catch (error) {
      console.error("Fehler beim Aktualisieren des Status:", error);
      toast.error(
        settings?.language === "en"
          ? "Fehler beim Aktualisieren des Status"
          : "Fehler beim Aktualisieren des Status"
      );
    }
  };

  /**
   * Öffnet den Bestätigungsdialog für das Löschen eines Leads.
   */
  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  /**
   * Bestätigt das Löschen eines Leads und schließt den Dialog.
   */
  const handleDeleteConfirm = () => {
    setShowDeleteDialog(false);
    onDeleteLead();
  };

  return (
    <>
      {/* DialogHeader für die Lead-Details */}
      <DialogHeader className="p-6 bg-card border-b">
        <div className="flex flex-col space-y-4">
          <div className="flex justify-between items-start border-b">
            {/* Lead-Name und Plattform anzeigen */}
            <LeadName name={lead.name} platform={lead.platform as Platform} />

            {/* StatusButtons für die Statusänderung + Lösch-Button */}
            <div className="flex gap-2">
              <StatusButtons status={lead.status || "lead"} onStatusChange={handleStatusChange} />

              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Löschen
              </Button>
            </div>
          </div>

          {/* Kompakte Phasen-Auswahl */}
          <CompactPhaseSelector lead={lead} onUpdateLead={onUpdateLead} />
        </div>
      </DialogHeader>

      {/* Bestätigungsdialog für das Löschen eines Leads */}
      <DeleteLeadDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
