
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useSession } from '@supabase/auth-helpers-react';
import { Linkedin } from 'lucide-react';

interface CreateLinkedInContactDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (leadId: string) => void;
}

export function CreateLinkedInContactDialog({ isOpen, onClose, onSuccess }: CreateLinkedInContactDialogProps) {
  const [profileUrl, setProfileUrl] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const session = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('Bitte geben Sie einen Namen ein');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get current user's pipeline
      const { data: pipelineData, error: pipelineError } = await supabase
        .from('pipelines')
        .select('id')
        .eq('user_id', session?.user?.id)
        .eq('is_default', true)
        .single();
        
      if (pipelineError) throw pipelineError;
      
      const pipelineId = pipelineData?.id;
      
      // Get first phase of pipeline
      const { data: phaseData, error: phaseError } = await supabase
        .from('pipeline_phases')
        .select('id')
        .eq('pipeline_id', pipelineId)
        .order('order_index', { ascending: true })
        .limit(1)
        .single();
        
      if (phaseError) throw phaseError;
      
      // Create lead
      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: name,
          platform: 'LinkedIn',
          linkedin_profile_name: name,
          user_id: session?.user?.id,
          pipeline_id: pipelineId,
          phase_id: phaseData.id,
          industry: 'Business'
        })
        .select('id, name, platform')
        .single();
        
      if (error) throw error;
      
      toast.success(`LinkedIn-Kontakt ${name} erfolgreich erstellt`);
      
      if (onSuccess && data) {
        onSuccess(data.id);
      }
      
      onClose();
    } catch (error) {
      console.error('Error creating LinkedIn contact:', error);
      toast.error('Fehler beim Erstellen des LinkedIn-Kontakts');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Linkedin className="mr-2 h-5 w-5 text-blue-600" />
            LinkedIn-Kontakt erstellen
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="linkedin-name">Name</Label>
            <Input
              id="linkedin-name"
              placeholder="z.B. Max Mustermann"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="linkedin-url">LinkedIn-Profil URL (optional)</Label>
            <Input
              id="linkedin-url"
              placeholder="z.B. https://www.linkedin.com/in/username"
              value={profileUrl}
              onChange={(e) => setProfileUrl(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} type="button">
              Abbrechen
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Wird erstellt...' : 'Erstellen'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
