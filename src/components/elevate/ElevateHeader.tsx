import { useState } from "react";
import { Building2, LogIn } from "lucide-react";
import { CreatePlatformDialog } from "./CreatePlatformDialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@supabase/auth-helpers-react";

interface ElevateHeaderProps {
  onPlatformCreated?: () => Promise<void>;
}

export const ElevateHeader = ({ onPlatformCreated }: ElevateHeaderProps) => {
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const user = useUser();

  const handleJoinPlatform = async () => {
    if (!user) {
      toast.error("Sie müssen eingeloggt sein, um einem Modul beizutreten");
      return;
    }

    if (!inviteCode.trim()) {
      toast.error("Bitte geben Sie einen Einladungscode ein");
      return;
    }

    setIsJoining(true);

    try {
      const { data: platform, error: platformError } = await supabase
        .from('elevate_platforms')
        .select('id, name')
        .eq('invite_code', inviteCode.trim())
        .maybeSingle();

      if (platformError) throw platformError;
      if (!platform) {
        toast.error("Ungültiger Einladungscode");
        return;
      }

      const { error: accessError } = await supabase
        .from('elevate_user_access')
        .insert({
          platform_id: platform.id,
          user_id: user.id,
          granted_by: user.id
        });

      if (accessError) throw accessError;

      toast.success(`Sie sind dem Modul "${platform.name}" erfolgreich beigetreten`);
      setIsJoinOpen(false);
      setInviteCode("");
      await onPlatformCreated?.();
    } catch (error: any) {
      console.error('Error joining platform:', error);
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
        <p className="text-muted-foreground">
          Verwalten Sie Ihre Ausbildungsmodule
        </p>
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