import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export const ChatButton = () => {
  const [open, setOpen] = useState(false);
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false);
  const { settings, updateSettings } = useSettings();
  const [apiKey, setApiKey] = useState("");

  const handleClick = () => {
    if (!settings?.openai_api_key) {
      console.warn("⚠️ OpenAI API Key fehlt");
      setShowApiKeyDialog(true);
      return;
    }
    console.info("✅ OpenAI API Key ist vorhanden");
    setOpen(true);
  };

  const handleSaveApiKey = async () => {
    if (!apiKey) {
      toast.error("Bitte geben Sie einen API Key ein");
      return;
    }

    try {
      await updateSettings.mutateAsync({ openai_api_key: apiKey });
      setShowApiKeyDialog(false);
      setOpen(true);
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