import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser, useSupabaseClient } from "@supabase/auth-helpers-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const navigate = useNavigate();
  const user = useUser();
  const supabase = useSupabaseClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      navigate("/auth");
    }
  }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Erfolgreich abgemeldet",
        description: "Auf Wiedersehen!",
      });
      navigate("/");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Fehler beim Abmelden",
        description: "Bitte versuchen Sie es erneut.",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Willkommen, {user.email}
            </p>
          </div>
          <Button onClick={handleSignOut} variant="outline">
            Abmelden
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Profil</CardTitle>
              <CardDescription>Ihre persönlichen Informationen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                E-Mail: {user.email}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Mitglied seit: {new Date(user.created_at).toLocaleDateString('de-DE')}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Aktivitäten</CardTitle>
              <CardDescription>Ihre letzten Aktivitäten</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Keine Aktivitäten vorhanden
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Einstellungen</CardTitle>
              <CardDescription>Verwalten Sie Ihre Einstellungen</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Hier können Sie bald Ihre Einstellungen anpassen
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;