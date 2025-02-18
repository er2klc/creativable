
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Check, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time?: string;
  description?: string;
  color: string;
  is_team_event: boolean;
}

interface EventSelectorProps {
  teamId: string;
  onSelect: (events: Event[]) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventSelector({ teamId, onSelect, open, onOpenChange }: EventSelectorProps) {
  const [selectedEvents, setSelectedEvents] = useState<Event[]>([]);

  const { data: events = [] } = useQuery({
    queryKey: ['team-calendar-events', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('team_calendar_events')
        .select('*')
        .eq('team_id', teamId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true });

      if (error) throw error;
      return data as Event[];
    },
  });

  const handleEventSelect = (event: Event) => {
    setSelectedEvents(prev => {
      const isSelected = prev.some(e => e.id === event.id);
      if (isSelected) {
        return prev.filter(e => e.id !== event.id);
      }
      return [...prev, event];
    });
  };

  const handleConfirm = () => {
    onSelect(selectedEvents);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Termine auswählen</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid gap-2">
            {events.map(event => (
              <div
                key={event.id}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-colors",
                  "hover:bg-accent",
                  selectedEvents.some(e => e.id === event.id) && "border-primary",
                  event.is_team_event && "border-blue-200"
                )}
                style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                onClick={() => handleEventSelect(event)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.start_time), 'EEEE, d. MMMM yyyy - HH:mm', { locale: de })}
                    </p>
                  </div>
                  {selectedEvents.some(e => e.id === event.id) && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleConfirm} disabled={selectedEvents.length === 0}>
              {selectedEvents.length} Termine einfügen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
