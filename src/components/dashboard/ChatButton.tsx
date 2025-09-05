import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatDialog } from "@/components/chat/ChatDialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { Badge } from "@/components/ui/badge";

export const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <>
      <div className={`fixed ${isMobile ? "bottom-20 right-4" : "bottom-4 right-4"} z-50`}>
        <div className="relative">
          <Button 
            onClick={() => setIsOpen(true)}
            variant="outline" 
            size="icon" 
            className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all p-0 overflow-hidden bg-white dark:bg-gray-800"
          >
            <img 
              src="/lovable-uploads/cccafff6-9621-43ff-a997-1c2d8d3e744d.png" 
              alt="Nexus Chat" 
              className="w-full h-full object-cover"
            />
          </Button>
          {/* Keep the badge UI for potential future notification indicators */}
        </div>
      </div>

      {/* Use the correct Nexus AI ChatDialog component */}
      <ChatDialog open={isOpen} onOpenChange={setIsOpen} />
    </>
  );
};
