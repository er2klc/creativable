import { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const ChatButton = () => {
  const [open, setOpen] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [hasApiKey, setHasApiKey] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);

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
    setIsMinimized(false);
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

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setIsMinimized(true);
    }
    setOpen(newOpen);
  };

  const handleClose = () => {
    setOpen(false);
    setIsMinimized(false);
    setMessages([]); // Only clear messages when actually closing
  };

  return (
    <>
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 items-end z-50">
        {isMinimized && (
          <Button 
            variant="outline" 
            size="icon"
            className="h-6 w-6 rounded-full bg-destructive hover:bg-destructive/90"
            onClick={handleClose}
          >
            <X className="h-3 w-3 text-destructive-foreground" />
          </Button>
        )}
        <Button 
          variant="outline" 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
          onClick={handleClick}
        >
          <MessageCircle className="h-7 w-7" />
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

      <ChatDialog 
        open={open} 
        onOpenChange={handleOpenChange}
        messages={messages}
        setMessages={setMessages}
      />
    </>
  );
};