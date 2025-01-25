import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Instagram, Linkedin } from "lucide-react";
import { CreateSocialContactDialog } from "../instagram/CreateInstagramContactDialog";

interface LeadDetailHeaderProps {
  pipelineId: string | null;
  defaultPhase?: string;
}

export function LeadDetailHeader({ pipelineId, defaultPhase }: LeadDetailHeaderProps) {
  const [showInstagramDialog, setShowInstagramDialog] = useState(false);
  const [showLinkedInDialog, setShowLinkedInDialog] = useState(false);

  return (
    <div className="flex items-center justify-between pb-4 border-b">
      <h2 className="text-2xl font-semibold">Kontakte</h2>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowInstagramDialog(true)}
          className="flex items-center gap-2"
        >
          <Instagram className="w-4 h-4" />
          Instagram Kontakt
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLinkedInDialog(true)}
          className="flex items-center gap-2"
        >
          <Linkedin className="w-4 h-4" />
          LinkedIn Kontakt
        </Button>
      </div>

      <CreateSocialContactDialog
        open={showInstagramDialog}
        onOpenChange={setShowInstagramDialog}
        pipelineId={pipelineId}
        defaultPhase={defaultPhase}
        platform="Instagram"
      />

      <CreateSocialContactDialog
        open={showLinkedInDialog}
        onOpenChange={setShowLinkedInDialog}
        pipelineId={pipelineId}
        defaultPhase={defaultPhase}
        platform="LinkedIn"
      />
    </div>
  );
}