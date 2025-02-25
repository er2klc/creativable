import { Crown, Image, Users, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamLogoUpload } from "@/components/teams/TeamLogoUpload";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { TeamMemberList } from "./TeamMemberList";
import { TeamAdminList } from "./TeamAdminList";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getAvatarUrl } from "@/lib/supabase-utils";
import { useTeamStats } from "@/hooks/useTeamStats";
import { ErrorBoundary } from "react-error-boundary";
import { useState, useEffect } from "react";

interface TeamHeaderTitleProps {
  team: {
    id: string;
    name: string;
    logo_url?: string;
  };
  isAdmin: boolean;
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="text-sm text-muted-foreground">
      <Button variant="ghost" onClick={resetErrorBoundary}>Neu laden</Button>
    </div>
  );
}

export function TeamHeaderTitle({ team, isAdmin }: TeamHeaderTitleProps) {
  const [isRefetching, setIsRefetching] = useState(false);
  
  const { 
    stats, 
    members, 
    adminMembers, 
    onlineMembers,
    refetch,
    error 
  } = useTeamStats(team.id);

  useEffect(() => {
    const interval = setInterval(async () => {
      setIsRefetching(true);
      await refetch();
      setIsRefetching(false);
    }, 30000);

    return () => clearInterval(interval);
  }, [refetch]);

  const onlineMembersList = members.filter(member => 
    onlineMembers.some(online => online.user_id === member.user_id)
  );

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => refetch()}
    >
      <div className="flex items-center gap-6 justify-center w-full">
        <Sheet>
          <SheetTrigger asChild>
            <button className="relative group">
              <Avatar className="h-32 w-32 cursor-pointer border-2 border-primary/20">
                <AvatarImage 
                  src={team.logo_url ? getAvatarUrl(team.logo_url) : undefined} 
                  alt={team.name} 
                  className="object-cover" 
                />
                <AvatarFallback className="text-2xl bg-primary/5">
                  {team.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
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
            <h1 className="text-4xl font-semibold">{team.name}</h1>
            {isRefetching && (
              <Badge variant="secondary" className="animate-pulse">
                Aktualisiere...
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-4 mt-2 text-muted-foreground">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{stats.totalMembers} Mitglieder</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Team Mitglieder</SheetTitle>
                  <SheetDescription>Übersicht aller Mitglieder in diesem Team</SheetDescription>
                </SheetHeader>
                <TeamMemberList members={members} isAdmin={isAdmin} />
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Crown className="h-4 w-4" />
                  <span>{stats.admins} Admins</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Team Administratoren</SheetTitle>
                  <SheetDescription>Übersicht aller Administratoren in diesem Team</SheetDescription>
                </SheetHeader>
                <TeamAdminList admins={adminMembers} />
              </SheetContent>
            </Sheet>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Radio className="h-4 w-4 text-green-500 animate-pulse" />
                  <span>{stats.onlineCount} LIVE</span>
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Online Mitglieder</SheetTitle>
                  <SheetDescription>Aktuell aktive Mitglieder in diesem Team</SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  {onlineMembersList.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={member.profile?.avatar_url ? getAvatarUrl(member.profile.avatar_url) : undefined} 
                            alt={member.profile?.display_name || 'Avatar'} 
                          />
                          <AvatarFallback>
                            {member.profile?.display_name?.substring(0, 2).toUpperCase() || '??'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {member.profile?.display_name || 'Unbekannt'}
                          </span>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="mt-1">
                              {member.role === 'owner' ? 'Owner' : member.role === 'admin' ? 'Admin' : 'Mitglied'}
                            </Badge>
                            <Badge variant="default" className="bg-green-500 mt-1">
                              Level {member.points?.level || 0}
                            </Badge>
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
    </ErrorBoundary>
  );
}
