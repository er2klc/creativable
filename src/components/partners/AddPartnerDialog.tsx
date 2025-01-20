import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { Tables } from "@/integrations/supabase/types";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";

interface AddPartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  position?: { x: number; y: number; parentId: string } | null;
  availablePartners: Tables<'leads'>[];
}

export const AddPartnerDialog = ({ open, onOpenChange, position, availablePartners }: AddPartnerDialogProps) => {
  const [name, setName] = useState("");
  const [networkMarketingId, setNetworkMarketingId] = useState("");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);

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

      // Get the partner pipeline and phase IDs
      const { data: pipeline } = await supabase
        .from('pipelines')
        .select('id')
        .eq('user_id', user.id)
        .eq('name', 'Standard Pipeline')
        .single();

      if (!pipeline) {
        toast.error("Pipeline nicht gefunden");
        return;
      }

      const { data: phase } = await supabase
        .from('pipeline_phases')
        .select('id')
        .eq('pipeline_id', pipeline.id)
        .eq('name', 'Erstkontakt')
        .single();

      if (!phase) {
        toast.error("Phase nicht gefunden");
        return;
      }

      let partnerData;

      if (selectedPartnerId) {
        // Update existing partner with parent_id and level
        const { error } = await supabase
          .from('leads')
          .update({
            parent_id: position?.parentId,
            level: position?.y ? Math.floor(position.y / 200) : 1,
            status: 'partner'
          })
          .eq('id', selectedPartnerId);

        if (error) throw error;
      } else {
        // Create new partner
        const { error } = await supabase
          .from('leads')
          .insert({
            user_id: user.id,
            name,
            network_marketing_id: networkMarketingId || null,
            status: 'partner',
            industry: 'Network Marketing',
            platform: 'Direct',
            phase_id: phase.id,
            pipeline_id: pipeline.id,
            parent_id: position?.parentId,
            level: position?.y ? Math.floor(position.y / 200) : 1
          });

        if (error) throw error;
      }

      toast.success("Partner erfolgreich hinzugefügt");
      onOpenChange(false);
      setName("");
      setNetworkMarketingId("");
      setSelectedPartnerId(null);
    } catch (error) {
      console.error('Error adding partner:', error);
      toast.error("Fehler beim Hinzufügen des Partners");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Partner hinzufügen</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {availablePartners.length > 0 && (
            <div className="space-y-4">
              <Label>Verfügbare Partner</Label>
              <div className="grid grid-cols-2 gap-4">
                {availablePartners.map((partner) => (
                  <Card
                    key={partner.id}
                    className={`p-4 cursor-pointer transition-all ${
                      selectedPartnerId === partner.id
                        ? 'ring-2 ring-primary'
                        : 'hover:bg-accent'
                    }`}
                    onClick={() => setSelectedPartnerId(partner.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <div className="bg-primary text-primary-foreground w-full h-full rounded-full flex items-center justify-center text-lg font-semibold">
                          {partner.name.substring(0, 2).toUpperCase()}
                        </div>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium">{partner.name}</span>
                        {partner.network_marketing_id && (
                          <span className="text-sm text-muted-foreground">
                            ID: {partner.network_marketing_id}
                          </span>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {!selectedPartnerId && (
            <>
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
            </>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave}>
            {selectedPartnerId ? 'Partner zuordnen' : 'Partner erstellen'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};