import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUser } from "@supabase/auth-helpers-react";
import { LogIn } from "lucide-react";

interface JoinPlatformDialogProps {
  onPlatformJoined?: () => Promise<void>;
}

export const JoinPlatformDialog = ({ onPlatformJoined }: JoinPlatformDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const user = useUser();

  const handleJoin = async () => {
    if (!user) {
      toast.error("Sie müssen eingeloggt sein, um einem Modul beizutreten");
      return;
    }

    if (!inviteCode.trim()) {
      toast.error("Bitte geben Sie einen Eintrittscode ein");
      return;
    }

    setIsLoading(true);

    try {
      // Find platform by invite code
      const { data: platform, error: platformError } = await supabase
        .from('elevate_platforms')
        .select('id')
        .eq('invite_code', inviteCode.trim())
        .single();

      if (platformError || !platform) {
        throw new Error('Ungültiger Eintrittscode');
      }

      // Check if user already has access
      const { data: existingAccess } = await supabase
        .from('elevate_user_access')
        .select('id')
        .eq('platform_id', platform.id)
        .eq('user_id', user.id)
        .single();

      if (existingAccess) {
        throw new Error('Sie haben bereits Zugriff auf dieses Modul');
      }

      // Grant access to the user
      const { error: accessError } = await supabase
        .from('elevate_user_access')
        .insert({
          platform_id: platform.id,
          user_id: user.id,
          access_type: 'member',
          granted_by: user.id
        });

      if (accessError) throw accessError;

      toast.success("Erfolgreich dem Modul beigetreten");
      setIsOpen(false);
      setInviteCode("");
      
      if (onPlatformJoined) {
        await onPlatformJoined();
      }
    } catch (error: any) {
      console.error('Error joining platform:', error);
      toast.error(error.message || 'Fehler beim Beitreten des Moduls');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <LogIn className="h-4 w-4 mr-2" />
          Modul beitreten
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modul beitreten</DialogTitle>
          <DialogDescription>
            Geben Sie den Eintrittscode ein, um dem Modul beizutreten.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Eintrittscode eingeben"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            onClick={handleJoin}
            disabled={!inviteCode.trim() || isLoading}
          >
            {isLoading ? "Trete bei..." : "Beitreten"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};