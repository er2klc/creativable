
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { LeadWithRelations } from "@/types/leads";
import { LeadAvatar } from "../detail/card/LeadAvatar";

import { asLead } from "@/components/debug/DisableProblematicComponents";

interface ExistingContactAlertProps {
  contact: any; // Temporarily use any to avoid type conflicts
  onClose: () => void;
}

export function ExistingContactAlert({ contact, onClose }: ExistingContactAlertProps) {
  const navigate = useNavigate();
  const safeContact = asLead(contact);

  const handleContactClick = () => {
    onClose();
    navigate(`/contacts/${safeContact.id}`);
  };

  return (
    <Alert className="bg-white border-blue-100">
      <AlertDescription className="space-y-4">
        <div className="flex items-start space-x-4">
          <LeadAvatar
            imageUrl={safeContact.social_media_profile_image_url}
            name={safeContact.name}
            platform={safeContact.platform}
            avatarSize="lg"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              Dieser Kontakt existiert bereits
            </p>
            <div className="mt-1 text-sm text-gray-600 space-y-1">
              <p>Name: {safeContact.name}</p>
              <p>Angelegt am: {format(new Date(safeContact.created_at), 'dd.MM.yyyy')}</p>
              <p>Pipeline: {safeContact.pipeline?.name || 'Nicht zugewiesen'}</p>
              <p>Phase: {safeContact.phase?.name || 'Nicht zugewiesen'}</p>
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Abbrechen
          </Button>
          <Button 
            onClick={handleContactClick}
          >
            Zum Kontakt
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
