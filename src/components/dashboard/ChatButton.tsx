import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ChatButton = () => {
  return (
    <div className="fixed bottom-4 right-4">
      <Button variant="outline" size="icon" className="rounded-full">
        <MessageCircle className="h-4 w-4" />
      </Button>
    </div>
  );
};