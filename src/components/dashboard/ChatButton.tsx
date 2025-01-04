import { useState, useEffect } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables } from "@/integrations/supabase/types/tables";

export const ChatButton = () => {
  const [open, setOpen] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('chatbot_settings')
        .select('openai_api_key')
        .eq('user_id', session.user.id)
        .maybeSingle();

      if (error) throw error;
      setHasApiKey(!!data?.openai_api_key);
      
      if (data?.openai_api_key) {
        console.info("✅ OpenAI API Key ist vorhanden");
      } else {
        console.warn("⚠️ OpenAI API Key fehlt");
      }
    } catch (error) {
      console.error("Error checking API key:", error);
    }
  };

  const handleClick = () => {
    if (!hasApiKey) {
      setShowApiKeyDialog(true);
      return;
    }
    setOpen(true);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      toast.error("Bitte geben Sie einen API Key ein");
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("No session");

      const { error } = await supabase
        .from('chatbot_settings')
        .upsert({ 
          user_id: session.user.id,
          openai_api_key: apiKey
        });

      if (error) throw error;

      setShowApiKeyDialog(false);
      setOpen(true);
      setHasApiKey(true);
      toast.success("API Key wurde gespeichert");
      console.info("✅ OpenAI API Key wurde erfolgreich gespeichert");
    } catch (error) {
      console.error("Error saving API key:", error);
      toast.error("Fehler beim Speichern des API Keys");
    }
  };

  return (
    <>
      <div className="fixed bottom-4 right-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full"
          onClick={handleClick}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>

      <Dialog open={showApiKeyDialog} onOpenChange={setShowApiKeyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>OpenAI API Key eingeben</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <Button onClick={handleSaveApiKey} className="w-full">
              Speichern & Chat öffnen
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ChatDialog open={open} onOpenChange={setOpen} />
    </>
  );
};