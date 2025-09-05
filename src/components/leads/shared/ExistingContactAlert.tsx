
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { LeadWithRelations } from "@/types/leads";
import { LeadAvatar } from "../detail/card/LeadAvatar";

interface ExistingContactAlertProps {
  contact: LeadWithRelations;
  onClose: () => void;
}

export function ExistingContactAlert({ contact, onClose }: ExistingContactAlertProps) {
  const navigate = useNavigate();

  const handleContactClick = () => {
    onClose();
    navigate(`/contacts/${contact.id}`);
  };

  return (
    <Alert className="bg-white border-blue-100">
      <AlertDescription className="space-y-4">
        <div className="flex items-start space-x-4">
          <LeadAvatar
            imageUrl={contact.social_media_profile_image_url}
            name={contact.name}
            platform={contact.platform}
            avatarSize="lg"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">
              Dieser Kontakt existiert bereits
            </p>
            <div className="mt-1 text-sm text-gray-600 space-y-1">
              <p>Name: {contact.name}</p>
              <p>Angelegt am: {format(new Date(contact.created_at), 'dd.MM.yyyy')}</p>
              <p>Pipeline: {contact.pipeline?.name}</p>
              <p>Phase: {contact.phase?.name}</p>
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
