import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

interface AddPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: { x: number; y: number } | null;
  trigger?: React.ReactNode;
}

export const AddPartnerDialog = ({ open, onOpenChange, position, trigger }: AddPartnerDialogProps) => {
  const [name, setName] = useState("");
  const [networkMarketingId, setNetworkMarketingId] = useState("");

  // Fetch current user's network marketing ID from settings
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { data: settings, error } = await supabase
        .from('settings')
        .select('network_marketing_id')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return settings;
    },
  });

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('leads')
        .insert({
          user_id: user.id,
          name,
          network_marketing_id: networkMarketingId || null,
          status: 'partner',
          industry: 'Network Marketing',
          platform: 'Direct',
          phase_id: 'partner',
          pipeline_id: 'partner'
        });

      if (error) throw error;

      toast.success("Partner erfolgreich hinzugefügt");
      onOpenChange(false);
    } catch (error) {
      console.error('Error adding partner:', error);
      toast.error("Fehler beim Hinzufügen des Partners");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Partner hinzufügen</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name des Partners"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="networkMarketingId">Network Marketing ID (optional)</Label>
            <Input
              id="networkMarketingId"
              value={networkMarketingId}
              onChange={(e) => setNetworkMarketingId(e.target.value)}
              placeholder={settings?.network_marketing_id || "Network Marketing ID"}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>
            Speichern
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};