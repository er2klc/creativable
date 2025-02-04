import { UserPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddLeadDialog } from "../AddLeadDialog";
import { CreateInstagramContactDialog } from "../instagram/CreateInstagramContactDialog";
import { CreateLinkedInContactDialog } from "../linkedin/CreateLinkedInContactDialog";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

interface AddLeadButtonProps {
  phase: string;
  variant?: "default" | "ghost";
  pipelineId?: string | null;
}

export function AddLeadButton({ phase, pipelineId, variant = "ghost" }: AddLeadButtonProps) {
  const [showMainDialog, setShowMainDialog] = useState(false);
  const [showInstagramDialog, setShowInstagramDialog] = useState(false);
  const [showLinkedInDialog, setShowLinkedInDialog] = useState(false);

  return (
    <>
      {/* Trigger für den Hauptdialog */}
      <Button
        variant={variant}
        size="sm"
        className="w-full text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent"
        onClick={() => setShowMainDialog(true)}
      >
        <UserPlus className="h-4 w-4 mr-2" />
        Neuer Kontakt
      </Button>

      {/* Hauptdialog */}
      {showMainDialog && (
        <Dialog open={showMainDialog} onOpenChange={setShowMainDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <div className="grid grid-cols-3 gap-4 py-4">
              {/* Manuell Button */}
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => {
                  setShowMainDialog(false);
                  setShowMainDialog(true);
                }}
              >
                <div className="relative">
                  <UserPlus className="h-6 w-6" />
                  <Plus className="h-3 w-3 absolute -right-1 -top-1" />
                </div>
                <span className="text-sm">Manuell</span>
              </Button>

              {/* Instagram Button */}
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => {
                  setShowMainDialog(false);
                  setShowInstagramDialog(true);
                }}
              >
                <div className="relative text-pink-500">
                  <Plus className="h-3 w-3 absolute -right-1 -top-1" />
                </div>
                <span className="text-sm">Instagram</span>
              </Button>

              {/* LinkedIn Button */}
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-4"
                onClick={() => {
                  setShowMainDialog(false);
                  setShowLinkedInDialog(true);
                }}
              >
                <div className="relative text-[#0A66C2]">
                  <Plus className="h-3 w-3 absolute -right-1 -top-1" />
                </div>
                <span className="text-sm">LinkedIn</span>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialoge für Instagram und LinkedIn */}
      <CreateInstagramContactDialog
        open={showInstagramDialog}
        onOpenChange={setShowInstagramDialog}
        pipelineId={pipelineId}
      />
      <CreateLinkedInContactDialog
        open={showLinkedInDialog}
        onOpenChange={setShowLinkedInDialog}
        pipelineId={pipelineId}
      />
    </>
  );
}
