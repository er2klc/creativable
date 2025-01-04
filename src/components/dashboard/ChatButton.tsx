import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/chat/ChatDialog";

export const ChatButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-4 right-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full"
          onClick={() => setOpen(true)}
        >
          <MessageCircle className="h-4 w-4" />
        </Button>
      </div>
      <ChatDialog open={open} onOpenChange={setOpen} />
    </>
  );
};