
import { FC } from 'react';
import { Note } from '@/integrations/supabase/types/database/entities/core';
import { format } from 'date-fns';
import { de, enUS } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

interface LeadDetailNoteProps {
  note: Note;
  locale: Locale;
  onDeleteClick?: (noteId: string) => void;
}

export const LeadDetailNote: FC<LeadDetailNoteProps> = ({ note, locale, onDeleteClick }) => {
  const formattedDate = format(new Date(note.created_at || new Date()), 'PPpp', { locale });

  return (
    <div className="bg-white rounded-lg shadow p-4 relative">
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: note.content }} />
      <div className="text-sm text-gray-500 mt-2">{formattedDate}</div>

      {onDeleteClick && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-2 right-2 text-gray-400 hover:text-red-500" 
          onClick={() => onDeleteClick(note.id)}
        >
          <Trash className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
