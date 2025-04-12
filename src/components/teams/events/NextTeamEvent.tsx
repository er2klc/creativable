
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@supabase/auth-helpers-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { parseISO, addDays, format, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';
import { MapPin, Users, Calendar, Clock, ChevronRight, Ban } from 'lucide-react';
import { TeamEvent } from '@/components/calendar/types/calendar';
import { Button as UIButton } from '@/components/ui/button';

export function NextTeamEvent() {
  const user = useUser();
  const [isExpanded, setIsExpanded] = useState(false);
  
  const { data: userTeams = [] } = useQuery({
    queryKey: ['user-teams'],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('team_members')
        .select('team_id, teams(id, name)')
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      return data.map((item) => ({
        id: item.teams.id,
        name: item.teams.name
      }));
    },
    enabled: !!user,
  });
  
  const teamIds = userTeams.map((team) => team.id);
  
  const { data: nextEvent, isLoading } = useQuery({
    queryKey: ['next-team-event', teamIds],
    queryFn: async () => {
      if (!teamIds.length) return null;
      
      const today = new Date();
      
      const { data, error } = await supabase
        .from('team_calendar_events')
        .select('*')
        .in('team_id', teamIds)
        .gte('start_time', today.toISOString())
        .order('start_time', { ascending: true })
        .limit(1);
        
      if (error) throw error;
      
      if (!data || data.length === 0) return null;
      
      return data[0] as TeamEvent;
    },
    enabled: teamIds.length > 0,
  });
  
  const formatEventTime = (event?: TeamEvent) => {
    if (!event) return '';
    
    const startTime = parseISO(event.start_time);
    const endTime = event.end_time ? parseISO(event.end_time) : addDays(startTime, 1);
    
    return `${format(startTime, 'HH:mm')} - ${format(endTime, 'HH:mm')}`;
  };
  
  const getEventDateString = (event?: TeamEvent) => {
    if (!event) return '';
    
    const startDate = parseISO(event.start_time);
    const now = new Date();
    
    if (
      startDate.getDate() === now.getDate() &&
      startDate.getMonth() === now.getMonth() &&
      startDate.getFullYear() === now.getFullYear()
    ) {
      return 'Heute';
    }
    
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    if (
      startDate.getDate() === tomorrow.getDate() &&
      startDate.getMonth() === tomorrow.getMonth() &&
      startDate.getFullYear() === tomorrow.getFullYear()
    ) {
      return 'Morgen';
    }
    
    return format(startDate, 'EEEE, d. MMMM', { locale: de });
  };
  
  const handleParticipate = async (event: TeamEvent) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('team_event_participants')
        .insert({
          event_id: event.id,
          user_id: user.id,
          status: 'confirmed'
        });
        
      if (error) throw error;
      
      // Success message or notification here
    } catch (error) {
      console.error('Error participating in event:', error);
      // Error message here
    }
  };
  
  const handleDecline = async (event: TeamEvent) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('team_event_participants')
        .insert({
          event_id: event.id,
          user_id: user.id,
          status: 'declined'
        });
        
      if (error) throw error;
      
      // Success message or notification here
    } catch (error) {
      console.error('Error declining event:', error);
      // Error message here
    }
  };
  
  if (isLoading) {
    return (
      <Card className="bg-white border rounded-lg shadow">
        <CardContent className="py-6">
          <div className="flex justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!nextEvent) {
    return (
      <Card className="bg-white border rounded-lg shadow">
        <CardContent className="py-6">
          <div className="text-center text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
            <p>Keine anstehenden Team-Events</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="bg-white border rounded-lg shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Nächstes Event</CardTitle>
        <CardDescription>
          {getEventDateString(nextEvent)}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-base">{nextEvent.title}</h3>
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: nextEvent.color || '#3B82F6' }}
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{formatEventTime(nextEvent)}</span>
          </div>
          
          {nextEvent.location && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{nextEvent.location}</span>
            </div>
          )}
          
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="h-4 w-4" />
            <span>Team Event</span>
          </div>
          
          {isExpanded && nextEvent.description && (
            <div className="text-sm mt-2 text-gray-700">
              {nextEvent.description}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex gap-2">
          <UIButton
            size="sm"
            variant="default"
            onClick={() => handleParticipate(nextEvent)}
          >
            Teilnehmen
          </UIButton>
          <UIButton
            size="sm"
            variant="outline"
            onClick={() => handleDecline(nextEvent)}
          >
            Ablehnen
          </UIButton>
        </div>
        <UIButton
          size="sm"
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Weniger' : 'Mehr'} <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
        </UIButton>
      </CardFooter>
    </Card>
  );
}

export default NextTeamEvent;
