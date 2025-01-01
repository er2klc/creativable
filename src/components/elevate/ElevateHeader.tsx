import { useState, useEffect } from "react";
import { Building2, LogIn } from "lucide-react";
import { CreatePlatformDialog } from "./CreatePlatformDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@supabase/auth-helpers-react";
import { useNavigate } from "react-router-dom";

interface ElevateHeaderProps {
  onPlatformCreated?: () => Promise<void>;
}

export const ElevateHeader = ({ onPlatformCreated }: ElevateHeaderProps) => {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const user = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.warn("[Debug] Kein Benutzer vorhanden, umleiten zur Login-Seite");
      navigate("/auth");
    } else {
      console.log("[Debug] Benutzer gefunden:", user);
    }
  }, [user, navigate]);

  const handleJoinPlatform = async () => {
    if (!user) {
      toast.error("Sie müssen eingeloggt sein, um einem Modul beizutreten");
      console.error("[Debug] Kein Benutzer eingeloggt");
      return;
    }

    if (!inviteCode.trim()) {
      toast.error("Bitte geben Sie einen Einladungscode ein");
      console.error("[Debug] Kein Einladungscode eingegeben");
      return;
    }

    setIsJoining(true);

    try {
      console.log("[Debug] Invitation Code:", inviteCode);

      const { data: platform, error: platformError } = await supabase
        .from("elevate_platforms")
        .select("id, name")
        .eq("invite_code", inviteCode.trim())
        .maybeSingle();

      if (platformError) {
        console.error("[Debug] Fehler bei der Plattform-Abfrage:", platformError);
        throw platformError;
      }

      if (!platform) {
        toast.error("Ungültiger Einladungscode");
        console.error("[Debug] Einladungscode ungültig oder Plattform nicht gefunden");
        return;
      }

      console.log("[Debug] Plattform gefunden:", platform);

      const { error: accessError } = await supabase
        .from("elevate_user_access")
        .insert({
          platform_id: platform.id,
          user_id: user.id,
          granted_by: user.id,
        });

      if (accessError) {
        console.error("[Debug] Fehler beim Einfügen in elevate_user_access:", accessError);
        throw accessError;
      }

      toast.success(`Sie sind dem Modul "${platform.name}" erfolgreich beigetreten`);
      console.log("[Debug] Benutzer erfolgreich in elevate_user_access eingefügt");

      setIsJoinOpen(false);
      setInviteCode("");
      await onPlatformCreated?.();
      console.log("[Debug] onPlatformCreated wurde erfolgreich aufgerufen");
    } catch (error: any) {
      console.error("[Debug] Fehler beim Beitreten des Moduls:", error);
      toast.error("Fehler beim Beitreten des Moduls");
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Elevate
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <LogIn className="h-4 w-4 mr-2" />
              Modul beitreten
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Einem Modul beitreten</DialogTitle>
              <DialogDescription>
                Geben Sie den Einladungscode ein, um einem bestehenden Ausbildungsmodul beizutreten.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  placeholder="Einladungscode eingeben"
                  value={inviteCode}
                  onChange={(e) => setInviteCode(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleJoinPlatform}
                disabled={isJoining || !inviteCode.trim()}
              >
                {isJoining ? "Trete bei..." : "Beitreten"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <CreatePlatformDialog onPlatformCreated={onPlatformCreated} />
      </div>
    </div>
  );
};