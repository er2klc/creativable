import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/chat/ChatDialog";

export const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.chat-dialog')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all p-0 overflow-hidden bg-white"
          onClick={handleClick}
        >
          <img 
            src="/lovable-uploads/5dc8cb23-526f-4de9-bf3c-08e8627ccd65.png" 
            alt="Chat" 
            className="w-full h-full object-cover"
          />
        </Button>
      </div>

      <ChatDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};