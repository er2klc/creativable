import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { useSettings } from "@/hooks/use-settings";
import { toast } from "sonner";

export const ChatButton = () => {
  const [open, setOpen] = useState(false);
  const { settings } = useSettings();

  console.log("Settings in ChatButton:", settings); // Debug log

  const handleClick = () => {
    console.log("OpenAI API Key:", settings?.openai_api_key); // Debug log
    if (!settings?.openai_api_key) {
      toast.error("OpenAI API Key fehlt");
      return;
    }
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