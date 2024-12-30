import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Plus, Calendar as CalendarIcon, FolderOpen as FolderOpenIcon, MessageSquare, Bell, Settings, BarChart, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamHeader } from "@/components/teams/TeamHeader";
import { CreateNewsDialog } from "@/components/teams/news/CreateNewsDialog";
import { NewsList } from "@/components/teams/news/NewsList";
import { useUser } from "@supabase/auth-helpers-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

const TeamDetail = () => {
  const { teamSlug } = useParams();
  const user = useUser();
  const [isManaging, setIsManaging] = useState(false);
  const [hiddenSnaps, setHiddenSnaps] = useState<string[]>([]);

  const { data: team, isLoading: isTeamLoading } = useQuery({
    queryKey: ["team", teamSlug],
    queryFn: async () => {
      if (!user?.id || !teamSlug) return null;

      const { data: userTeams, error: userTeamsError } = await supabase.rpc("get_user_teams", { uid: user.id });

      if (userTeamsError) {
        console.error("Error fetching user teams:", userTeamsError);
        return null;
      }

      const team = userTeams?.find((t) => t.slug === teamSlug);
      return team || null;
    },
    enabled: !!teamSlug && !!user?.id,
  });

  const { data: teamMember } = useQuery({
    queryKey: ["team-member", team?.id],
    queryFn: async () => {
      if (!user?.id || !team?.id) return null;

      const { data, error } = await supabase
        .from("team_members")
        .select("role")
        .eq("team_id", team.id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) return null;
      return data;
    },
    enabled: !!user?.id && !!team?.id,
  });

  const isAdmin = teamMember?.role === "admin" || teamMember?.role === "owner";

  const regularSnaps = [
    {
      id: "posts",
      icon: <MessageSquare className="h-8 w-8" />,
      label: "Diskussionen & Beiträge",
      description: "Teilen Sie Ideen und Diskussionen mit Ihrem Team",
      gradient: "from-blue-500 to-blue-600",
    },
    {
      id: "news",
      icon: <Bell className="h-8 w-8" />,
      label: "News & Updates",
      description: "Bleiben Sie über wichtige Updates informiert",
      gradient: "from-purple-500 to-purple-600",
    },
    {
      id: "calendar",
      icon: <CalendarIcon className="h-8 w-8" />,
      label: "Kalender",
      description: "Planen Sie Termine und Events",
      gradient: "from-green-500 to-green-600",
    },
    {
      id: "files",
      icon: <FolderOpen className="h-8 w-8" />,
      label: "Dateien",
      description: "Verwalten Sie gemeinsame Dokumente",
      gradient: "from-yellow-500 to-yellow-600",
    },
  ];

  const adminSnaps = [
    {
      id: "members",
      icon: <Users className="h-8 w-8" />,
      label: "Mitglieder",
      description: "Verwalten Sie Teammitglieder",
      gradient: "from-pink-500 to-pink-600",
    },
    {
      id: "analytics",
      icon: <BarChart className="h-8 w-8" />,
      label: "Statistiken",
      description: "Analysieren Sie Team-Aktivitäten",
      gradient: "from-indigo-500 to-indigo-600",
    },
    {
      id: "settings",
      icon: <Settings className="h-8 w-8" />,
      label: "Einstellungen",
      description: "Konfigurieren Sie Team-Einstellungen",
      gradient: "from-gray-500 to-gray-600",
    },
  ];

  if (isTeamLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!team) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Team nicht gefunden</div>
        </CardContent>
      </Card>
    );
  }

  const visibleRegularSnaps = regularSnaps.filter(snap => !hiddenSnaps.includes(snap.id));
  const visibleAdminSnaps = isAdmin ? adminSnaps.filter(snap => !hiddenSnaps.includes(snap.id)) : [];
  const hiddenRegularSnaps = regularSnaps.filter(snap => hiddenSnaps.includes(snap.id));
  const hiddenAdminSnaps = isAdmin ? adminSnaps.filter(snap => hiddenSnaps.includes(snap.id)) : [];

  return (
    <div className="space-y-6">
      <div className="bg-background border-b">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <TeamHeader team={team} />
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsManaging(!isManaging)}
              >
                {isManaging ? "Fertig" : "Snaps verwalten"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container">
        <Tabs defaultValue="posts">
          <div className="space-y-8">
            {visibleRegularSnaps.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Snaps</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {visibleRegularSnaps.map((snap) => (
                    <Card
                      key={snap.id}
                      className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
                    >
                      {isManaging && (
                        <button
                          onClick={() => setHiddenSnaps([...hiddenSnaps, snap.id])}
                          className="absolute top-2 right-2 z-10 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                      <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${snap.gradient}`} />
                      <div className="relative p-6 space-y-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg ${snap.gradient}`}>
                          <div className="text-white">
                            {snap.icon}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{snap.label}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {snap.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && visibleAdminSnaps.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Admin Snaps</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {visibleAdminSnaps.map((snap) => (
                    <Card
                      key={snap.id}
                      className={`relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group`}
                    >
                      <Badge 
                        variant="secondary" 
                        className="absolute top-2 right-2 z-10"
                      >
                        Admin
                      </Badge>
                      {isManaging && (
                        <button
                          onClick={() => setHiddenSnaps([...hiddenSnaps, snap.id])}
                          className="absolute top-2 right-16 z-10 p-1 rounded-full bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4 text-muted-foreground" />
                        </button>
                      )}
                      <div className={`absolute inset-0 opacity-10 bg-gradient-to-br ${snap.gradient}`} />
                      <div className="relative p-6 space-y-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg ${snap.gradient}`}>
                          <div className="text-white">
                            {snap.icon}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{snap.label}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {snap.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {isManaging && (hiddenRegularSnaps.length > 0 || hiddenAdminSnaps.length > 0) && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Ausgeblendete Snaps</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {hiddenRegularSnaps.map((snap) => (
                    <Card
                      key={snap.id}
                      className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                      onClick={() => setHiddenSnaps(hiddenSnaps.filter(id => id !== snap.id))}
                    >
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${snap.gradient}`} />
                      <div className="relative p-6 space-y-4 opacity-50">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg ${snap.gradient}`}>
                          <div className="text-white">
                            {snap.icon}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{snap.label}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {snap.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {isAdmin && hiddenAdminSnaps.map((snap) => (
                    <Card
                      key={snap.id}
                      className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg group"
                      onClick={() => setHiddenSnaps(hiddenSnaps.filter(id => id !== snap.id))}
                    >
                      <Badge 
                        variant="secondary" 
                        className="absolute top-2 right-2 z-10"
                      >
                        Admin
                      </Badge>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Plus className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <div className={`absolute inset-0 opacity-5 bg-gradient-to-br ${snap.gradient}`} />
                      <div className="relative p-6 space-y-4 opacity-50">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br shadow-lg ${snap.gradient}`}>
                          <div className="text-white">
                            {snap.icon}
                          </div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{snap.label}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {snap.description}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>

          <TabsContent value="news" className="mt-6">
            <div className="space-y-6">
              {isAdmin && (
                <div className="flex justify-end">
                  <CreateNewsDialog teamId={team.id} />
                </div>
              )}
              <NewsList teamId={team.id} />
            </div>
          </TabsContent>

          <TabsContent value="calendar" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {isAdmin ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <CalendarIcon className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold">Keine Termine vorhanden</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Erstellen Sie einen Termin, um Ihr Team über anstehende Events zu informieren.
                      </p>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Termin erstellen
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Keine Termine vorhanden
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="files" className="mt-6">
            <Card>
              <CardContent className="p-6">
                {isAdmin ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-4">
                    <FolderOpenIcon className="h-12 w-12 text-muted-foreground" />
                    <div className="text-center space-y-2">
                      <h3 className="font-semibold">Keine Dateien vorhanden</h3>
                      <p className="text-sm text-muted-foreground max-w-sm">
                        Laden Sie Dateien hoch, um sie mit Ihrem Team zu teilen.
                      </p>
                    </div>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Dateien hochladen
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground">
                    Keine Dateien vorhanden
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamDetail;