import { Crown, Image, Users, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TeamMemberList } from "./TeamMemberList";
import { TeamAdminList } from "./TeamAdminList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

interface TeamHeaderTitleProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
  };
  isAdmin: boolean;
  membersCount: number;
  adminsCount: number;
  members: any[];
  adminMembers: any[];
}

interface OnlineMember {
  user_id: string;
  online_at: string;
}

export function TeamHeaderTitle({ 
  team, 
  isAdmin, 
  membersCount, 
  adminsCount,
  members,
  adminMembers 
}: TeamHeaderTitleProps) {
  const [onlineMembers, setOnlineMembers] = useState<OnlineMember[]>([]);
  const [showOnlineMembers, setShowOnlineMembers] = useState(false);

  useEffect(() => {
    // Subscribe to presence updates for this team
    const channel = supabase.channel(`team_${team.id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online: OnlineMember[] = [];
        
        // Convert presence state to array of online members
        Object.values(state).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            online.push(presence);
          });
        });
        
        setOnlineMembers(online);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user's presence
          await channel.track({
            user_id: supabase.auth.user()?.id,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [team.id]);

  return (
    <div className="flex items-center gap-6">
      <Sheet>
        <SheetTrigger asChild>
          <button className="relative group">
            {team.logo_url ? (
              <Avatar className="h-32 w-32 cursor-pointer border-2 border-primary/20">
                <AvatarImage src={team.logo_url} alt={team.name} className="object-cover" />
                <AvatarFallback className="text-2xl">{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-32 w-32 cursor-pointer border-2 border-primary/20">
                <AvatarFallback className="text-2xl">{team.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            )}
            {isAdmin && (
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Image className="h-8 w-8 text-white" />
              </div>
            )}
          </button>
        </SheetTrigger>
        {isAdmin && (
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Team Logo ändern</SheetTitle>
              <SheetDescription>
                Laden Sie ein neues Logo für Ihr Team hoch
              </SheetDescription>
            </SheetHeader>
            <div className="mt-6">
              <TeamLogoUpload currentLogoUrl={team.logo_url} />
            </div>
          </SheetContent>
        )}
      </Sheet>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-4xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {team.name}
          </h1>
        </div>
        <div className="flex items-center gap-4 mt-2 text-muted-foreground">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{membersCount} Mitglieder</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Team Mitglieder</SheetTitle>
                <SheetDescription>
                  Übersicht aller Mitglieder in diesem Team
                </SheetDescription>
              </SheetHeader>
              <TeamMemberList members={members} isAdmin={isAdmin} />
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Crown className="h-4 w-4" />
                <span>{adminsCount} Admins</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Team Administratoren</SheetTitle>
                <SheetDescription>
                  Übersicht aller Administratoren in diesem Team
                </SheetDescription>
              </SheetHeader>
              <TeamAdminList admins={adminMembers} />
            </SheetContent>
          </Sheet>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Radio className="h-4 w-4 text-green-500 animate-pulse" />
                <span>{onlineMembers.length} LIVE</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Online Mitglieder</SheetTitle>
                <SheetDescription>
                  Aktuell aktive Mitglieder in diesem Team
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 space-y-4">
                {members.filter(member => 
                  onlineMembers.some(online => online.user_id === member.user_id)
                ).map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.profiles?.avatar_url} alt={member.profiles?.display_name || 'Avatar'} />
                        <AvatarFallback>
                          {member.profiles?.display_name?.substring(0, 2).toUpperCase() || '??'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {member.profiles?.display_name || 'Kein Name angegeben'}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="mt-1">
                            {member.role === 'owner' ? 'Owner' : member.role === 'admin' ? 'Admin' : 'Mitglied'}
                          </Badge>
                          <Badge variant="default" className="bg-green-500 mt-1">LIVE</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}