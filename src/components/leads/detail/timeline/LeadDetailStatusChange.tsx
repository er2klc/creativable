
import { FC, useState } from 'react';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Trash, RotateCcw } from 'lucide-react';
import { LeadWithRelations } from '@/types/leads';
import { Badge } from '@/components/ui/badge';
import { 
  AlertDialog, 
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '@/components/ui/alert-dialog';

interface LeadDetailStatusChangeProps {
  note: any;
  lead: LeadWithRelations;
  onUpdateLead: (updates: Partial<LeadWithRelations>) => void;
  onDeleteClick: (noteId: string) => void;
}

export const LeadDetailStatusChange: FC<LeadDetailStatusChangeProps> = ({ 
  note, 
  lead, 
  onUpdateLead,
  onDeleteClick 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleRevertStatus = () => {
    onUpdateLead({ 
      status: 'lead'
    });
    
    // Close the dialog
    setIsDialogOpen(false);
  };
  
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'partner': return 'pink';
      case 'customer': return 'sky';
      case 'not_for_now': return 'stone';
      case 'no_interest': return 'rose';
      default: return 'gray';
    }
  };
  
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'partner': return 'Partner';
      case 'customer': return 'Kunde';
      case 'not_for_now': return 'Nicht jetzt';
      case 'no_interest': return 'Kein Interesse';
      case 'lead': return 'Lead';
      default: return status;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 relative">
      <div className="flex items-center space-x-2 mb-2">
        <Badge variant={getStatusBadgeVariant(lead.status || 'lead') as any}>
          {getStatusLabel(lead.status || 'lead')}
        </Badge>
      </div>
      
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: note.content }} />
      
      <div className="absolute top-2 right-2 flex space-x-1">
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-400 hover:text-blue-500"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Status zurücksetzen?</AlertDialogTitle>
              <AlertDialogDescription>
                Der Status wird auf "Lead" zurückgesetzt. Diese Aktion kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleRevertStatus}
                className="bg-blue-500 hover:bg-blue-600"
              >
                Zurücksetzen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-400 hover:text-red-500" 
          onClick={() => onDeleteClick(note.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
