import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Tables } from "@/integrations/supabase/types";
import { useSettings } from "@/hooks/use-settings";
import { BasicInformationFields } from "./contact-info/BasicInformationFields";
import { LeadCardHeader } from "./card/LeadCardHeader";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import { DeleteLeadDialog } from "./components/DeleteLeadDialog";

interface LeadInfoCardProps {
  lead: Tables<"leads">;
  onUpdate: (updates: Partial<Tables<"leads">>) => void;
  onDelete?: () => void;
}

export function LeadInfoCard({ lead, onUpdate, onDelete }: LeadInfoCardProps) {
  const { settings } = useSettings();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <Card className="shadow-sm relative pb-16">
      <CardHeader className="pb-2 border-b border-gray-200/30 shadow-sm">
        <LeadCardHeader lead={lead} />
      </CardHeader>
      <CardContent className="space-y-6">
        <BasicInformationFields lead={lead} onUpdate={onUpdate} />
        
        {/* Delete Button */}
        <div className="absolute bottom-4 left-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-red-600"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <DeleteLeadDialog
          showDialog={showDeleteDialog}
          setShowDialog={setShowDeleteDialog}
          onDelete={onDelete}
        />
      </CardContent>
    </Card>
  );
}