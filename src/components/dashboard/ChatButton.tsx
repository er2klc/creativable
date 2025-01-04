import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

export const ChatButton = () => {
  const [open, setOpen] = useState(false);
  const { settings } = useSettings();

  const handleClick = () => {
    if (!settings?.openai_api_key) {
      console.warn("⚠️ OpenAI API Key fehlt");
      toast.error("OpenAI API Key fehlt");
      return;
    }
    console.info("✅ OpenAI API Key ist vorhanden");
    setOpen(true);
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
      <ChatDialog open={open} onOpenChange={setOpen} />
    </>
  );
};