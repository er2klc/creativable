import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface DashboardHeaderProps {
  userEmail: string | undefined;
}

export const DashboardHeader = ({ userEmail }: DashboardHeaderProps) => {
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Willkommen, {userEmail}
        </h1>
        <p className="text-muted-foreground mt-1">
          Hier ist Ihr aktueller Überblick
        </p>
      </div>
      <div className="flex items-center gap-4">
        <SidebarTrigger>
          <Button variant="outline" size="icon">
            <Menu className="h-4 w-4" />
          </Button>
        </SidebarTrigger>
        <Button onClick={handleSignOut} variant="outline">
          Abmelden
        </Button>
      </div>
    </div>
  );
};