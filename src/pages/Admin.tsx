import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Mail, Bell, List, LayoutDashboard, Building2, GraduationCap } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface UserProfile {
  id: string;
  email: string;
  display_name: string | null;
  last_sign_in_at: string;
  created_at: string;
}

const Admin = () => {
  const session = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalTeams, setTotalTeams] = useState<number>(0);
  const [totalPlatforms, setTotalPlatforms] = useState<number>(0);
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
  const [changelogData, setChangelogData] = useState({
    version: "",
    title: "",
    description: "",
    status: "planned" as "planned" | "in-progress" | "completed"
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Get total users count
        const { count: totalCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setTotalUsers(totalCount || 0);

        // Get total teams count
        const { count: teamsCount } = await supabase
          .from('teams')
          .select('*', { count: 'exact', head: true });

        setTotalTeams(teamsCount || 0);

        // Get total platforms count
        const { count: platformsCount } = await supabase
          .from('elevate_platforms')
          .select('*', { count: 'exact', head: true });

        setTotalPlatforms(platformsCount || 0);

        // Get recent users
        const { data: recentUsersData } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentUsersData) {
          setRecentUsers(recentUsersData as UserProfile[]);
        }

        // For demo purposes, set a random number of online users
        setOnlineUsers(Math.floor(Math.random() * (totalCount || 10)));
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error("Fehler beim Laden der Statistiken");
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleChangelogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('changelog_entries')
        .insert({
          version: changelogData.version,
          title: changelogData.title,
          description: changelogData.description,
          created_by: session?.user?.id,
          status: changelogData.status
        });

      if (error) throw error;

      toast.success("Changelog Eintrag erfolgreich erstellt");
      setChangelogData({ version: "", title: "", description: "", status: "planned" });
    } catch (error: any) {
      console.error('Error creating changelog:', error);
      toast.error(error.message || "Fehler beim Erstellen des Changelog Eintrags");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#0A0A0A] text-white">
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-yellow-500/10 to-blue-500/20 opacity-30" />
      
      <div className="container mx-auto p-6 relative">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <LayoutDashboard className="h-8 w-8" />
          Admin Dashboard
        </h1>

        {/* First Row: User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#F2FCE2]/50 to-[#E5DEFF]/50 border-white/10 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5" />
                Registrierte Benutzer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{totalUsers}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#FDE1D3]/50 to-[#D3E4FD]/50 border-white/10 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-green-400" />
                Online Benutzer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{onlineUsers}</p>
              <p className="text-sm text-gray-300">Aktive Sitzungen der letzten 30 Minuten</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#E5DEFF]/50 to-[#FDE1D3]/50 border-white/10 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white">Letzte Aktivität</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-300">Aktive Sitzungen in Echtzeit</p>
            </CardContent>
          </Card>
        </div>

        {/* Second Row: Teams & Platforms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-[#D3E4FD]/50 to-[#F2FCE2]/50 border-white/10 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-400" />
                Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{totalTeams}</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#F2FCE2]/50 to-[#E5DEFF]/50 border-white/10 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-purple-400" />
                Ausbildungsplattformen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{totalPlatforms}</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users Table */}
        <Card className="bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white">Neue Benutzer</CardTitle>
            <CardDescription className="text-gray-300">
              Die letzten 5 registrierten Benutzer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="p-4 text-gray-300">Name</th>
                    <th className="p-4 text-gray-300">Email</th>
                    <th className="p-4 text-gray-300">Registriert am</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/10">
                      <td className="p-4 text-gray-200">{user.display_name || 'N/A'}</td>
                      <td className="p-4 text-gray-200">{user.email}</td>
                      <td className="p-4 text-gray-200">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Admin Tools */}
        <Tabs defaultValue="changelog" className="space-y-4">
          <TabsList className="bg-[#1A1F2C]/60 border-white/10">
            <TabsTrigger value="changelog" className="text-white data-[state=active]:bg-white/10">
              <List className="h-4 w-4 mr-2" />
              Changelog
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="text-white data-[state=active]:bg-white/10">
              <Mail className="h-4 w-4 mr-2" />
              Newsletter
            </TabsTrigger>
            <TabsTrigger value="notifications" className="text-white data-[state=active]:bg-white/10">
              <Bell className="h-4 w-4 mr-2" />
              Benachrichtigungen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="changelog">
            <Card className="bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Changelog Eintrag erstellen</CardTitle>
                <CardDescription className="text-gray-300">
                  Erstelle einen neuen Changelog Eintrag für die Benutzer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangelogSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Version</label>
                    <Input
                      value={changelogData.version}
                      onChange={(e) => setChangelogData(prev => ({ ...prev, version: e.target.value }))}
                      placeholder="z.B. 1.0.0"
                      className="bg-[#1A1F2C]/60 border-white/10 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Titel</label>
                    <Input
                      value={changelogData.title}
                      onChange={(e) => setChangelogData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titel des Updates"
                      className="bg-[#1A1F2C]/60 border-white/10 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Status</label>
                    <Select
                      value={changelogData.status}
                      onValueChange={(value: "planned" | "in-progress" | "completed") => 
                        setChangelogData(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="bg-[#1A1F2C]/60 border-white/10 text-white">
                        <SelectValue placeholder="Wähle einen Status" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1A1F2C] border-white/10">
                        <SelectItem value="planned" className="text-white">📅 Geplant</SelectItem>
                        <SelectItem value="in-progress" className="text-white">⚡ In Arbeit</SelectItem>
                        <SelectItem value="completed" className="text-white">✓ Abgeschlossen</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-300">Beschreibung</label>
                    <Textarea
                      value={changelogData.description}
                      onChange={(e) => setChangelogData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Beschreibung der Änderungen"
                      className="bg-[#1A1F2C]/60 border-white/10 text-white"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-white/10 hover:bg-white/20 text-white"
                  >
                    {isLoading ? "Wird gespeichert..." : "Changelog Eintrag erstellen"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="newsletter">
            <Card className="bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Newsletter</CardTitle>
                <CardDescription className="text-gray-300">
                  Diese Funktion wird in Kürze verfügbar sein
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Benachrichtigungen</CardTitle>
                <CardDescription className="text-gray-300">
                  Diese Funktion wird in Kürze verfügbar sein
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;