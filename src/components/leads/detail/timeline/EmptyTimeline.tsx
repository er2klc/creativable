
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

interface EmptyTimelineProps {
  leadId: string;
}

export const EmptyTimeline: React.FC<EmptyTimelineProps> = ({ leadId }) => {
  const { settings } = useSettings();
  
  return (
    <div className="text-center py-12 px-4 border border-dashed rounded-lg bg-gray-50">
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {settings?.language === "en" ? "No activities yet" : "Noch keine Aktivitäten"}
      </h3>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">
        {settings?.language === "en"
          ? "Start tracking your interactions with this contact by adding notes, tasks, or messages."
          : "Beginnen Sie, Ihre Interaktionen mit diesem Kontakt zu verfolgen, indem Sie Notizen, Aufgaben oder Nachrichten hinzufügen."}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          {settings?.language === "en" ? "Add Note" : "Notiz hinzufügen"}
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          {settings?.language === "en" ? "Add Task" : "Aufgabe hinzufügen"}
        </Button>
      </div>
    </div>
  );
};
