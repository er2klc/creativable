import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Users, Mail, Bell, List, LayoutDashboard } from "lucide-react";

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
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
  const [changelogData, setChangelogData] = useState({
    version: "",
    title: "",
    description: "",
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      try {
        // Get total users count
        const { count: totalCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        setTotalUsers(totalCount || 0);

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
        // In production, this should be implemented with Supabase Realtime
        setOnlineUsers(Math.floor(Math.random() * (totalCount || 10)));
      } catch (error) {
        console.error('Error fetching user stats:', error);
        toast.error("Fehler beim Laden der Benutzerstatistiken");
      }
    };

    fetchUserStats();
    const interval = setInterval(fetchUserStats, 30000); // Update every 30 seconds

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
          status: 'published'
        });

      if (error) throw error;

      toast.success("Changelog Eintrag erfolgreich erstellt");
      setChangelogData({ version: "", title: "", description: "" });
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm">
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

          <Card className="bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-green-400" />
                Online Benutzer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold text-white">{onlineUsers}</p>
            </CardContent>
          </Card>

          <Card className="bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-white">Letzte Aktivität</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-400">Aktive Sitzungen in Echtzeit</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Users Table */}
        <Card className="bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-white">Neue Benutzer</CardTitle>
            <CardDescription className="text-gray-400">
              Die letzten 5 registrierten Benutzer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left border-b border-white/10">
                    <th className="p-4 text-gray-400">Name</th>
                    <th className="p-4 text-gray-400">Email</th>
                    <th className="p-4 text-gray-400">Registriert am</th>
                  </tr>
                </thead>
                <tbody>
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="border-b border-white/10">
                      <td className="p-4">{user.display_name || 'N/A'}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
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
            <TabsTrigger value="changelog" className="data-[state=active]:bg-white/10">
              <List className="h-4 w-4 mr-2" />
              Changelog
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="data-[state=active]:bg-white/10">
              <Mail className="h-4 w-4 mr-2" />
              Newsletter
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white/10">
              <Bell className="h-4 w-4 mr-2" />
              Benachrichtigungen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="changelog">
            <Card className="bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Changelog Eintrag erstellen</CardTitle>
                <CardDescription className="text-gray-400">
                  Erstelle einen neuen Changelog Eintrag für die Benutzer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangelogSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-400">Version</label>
                    <Input
                      value={changelogData.version}
                      onChange={(e) => setChangelogData(prev => ({ ...prev, version: e.target.value }))}
                      placeholder="z.B. 1.0.0"
                      className="bg-[#1A1F2C]/60 border-white/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-400">Titel</label>
                    <Input
                      value={changelogData.title}
                      onChange={(e) => setChangelogData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titel des Updates"
                      className="bg-[#1A1F2C]/60 border-white/10"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1 text-gray-400">Beschreibung</label>
                    <Textarea
                      value={changelogData.description}
                      onChange={(e) => setChangelogData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Beschreibung der Änderungen"
                      className="bg-[#1A1F2C]/60 border-white/10"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-white/10 hover:bg-white/20"
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
                <CardDescription className="text-gray-400">
                  Diese Funktion wird in Kürze verfügbar sein
                </CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card className="bg-[#1A1F2C]/60 border-white/10 shadow-lg backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Benachrichtigungen</CardTitle>
                <CardDescription className="text-gray-400">
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