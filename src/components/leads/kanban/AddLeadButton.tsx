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
  const [isMainDialogOpen, setIsMainDialogOpen] = useState(false);
  const [isInstagramDialogOpen, setIsInstagramDialogOpen] = useState(false);
  const [isLinkedInDialogOpen, setIsLinkedInDialogOpen] = useState(false);
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);

  return (
    <>
      <Dialog open={isMainDialogOpen} onOpenChange={setIsMainDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-muted-foreground hover:text-foreground bg-transparent hover:bg-transparent"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Neuer Kontakt
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <div className="grid grid-cols-3 gap-4 py-4">
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => {
                setIsMainDialogOpen(false);
                setIsManualDialogOpen(true);
              }}
            >
              <div className="relative">
                <UserPlus className="h-6 w-6" />
                <Plus className="h-3 w-3 absolute -right-1 -top-1" />
              </div>
              <span className="text-sm">Manuell</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => {
                setIsMainDialogOpen(false);
                setIsInstagramDialogOpen(true);
              }}
            >
              <div className="relative text-pink-500">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M7.8,2H16.2C19.4,2 22,4.6 22,7.8V16.2A5.8,5.8 0 0,1 16.2,22H7.8C4.6,22 2,19.4 2,16.2V7.8A5.8,5.8 0 0,1 7.8,2M7.6,4A3.6,3.6 0 0,0 4,7.6V16.4C4,18.39 5.61,20 7.6,20H16.4A3.6,3.6 0 0,0 20,16.4V7.6C20,5.61 18.39,4 16.4,4H7.6M17.25,5.5A1.25,1.25 0 0,1 18.5,6.75A1.25,1.25 0 0,1 17.25,8A1.25,1.25 0 0,1 16,6.75A1.25,1.25 0 0,1 17.25,5.5M12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9Z"
                  />
                </svg>
                <Plus className="h-3 w-3 absolute -right-1 -top-1" />
              </div>
              <span className="text-sm">Instagram</span>
            </Button>

            <Button
              variant="outline"
              className="flex flex-col items-center gap-2 h-auto py-4"
              onClick={() => {
                setIsMainDialogOpen(false);
                setIsLinkedInDialogOpen(true);
              }}
            >
              <div className="relative text-[#0A66C2]">
                <svg className="h-6 w-6" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M19 3A2 2 0 0 1 21 5V19A2 2 0 0 1 19 21H5A2 2 0 0 1 3 19V5A2 2 0 0 1 5 3H19M18.5 18.5V13.2A3.26 3.26 0 0 0 15.24 9.94C14.39 9.94 13.4 10.46 12.92 11.24V10.13H10.13V18.5H12.92V13.57C12.92 12.8 13.54 12.17 14.31 12.17A1.4 1.4 0 0 1 15.71 13.57V18.5H18.5M6.88 8.56A1.68 1.68 0 0 0 8.56 6.88C8.56 5.95 7.81 5.19 6.88 5.19A1.69 1.69 0 0 0 5.19 6.88C5.19 7.81 5.95 8.56 6.88 8.56M8.27 18.5V10.13H5.5V18.5H8.27Z"
                  />
                </svg>
                <Plus className="h-3 w-3 absolute -right-1 -top-1" />
              </div>
              <span className="text-sm">LinkedIn</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AddLeadDialog
        open={isManualDialogOpen}
        onOpenChange={setIsManualDialogOpen}
        defaultPhase={phase}
        pipelineId={pipelineId}
      />

      <CreateInstagramContactDialog
        open={isInstagramDialogOpen}
        onOpenChange={setIsInstagramDialogOpen}
        pipelineId={pipelineId}
        defaultPhase={phase}
      />

      <CreateLinkedInContactDialog
        open={isLinkedInDialogOpen}
        onOpenChange={setIsLinkedInDialogOpen}
        pipelineId={pipelineId}
        defaultPhase={phase}
      />
    </>
  );
}