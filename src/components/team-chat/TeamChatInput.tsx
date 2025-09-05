
import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

interface TeamChatInputProps {
  onSendMessage: (content: string) => void;
  autoFocus?: boolean;
}

export const TeamChatInput = ({ onSendMessage, autoFocus = false }: TeamChatInputProps) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    onSendMessage(message);
    setMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-background">
      <div className="flex items-center gap-2">
        <Input
          ref={inputRef}
          placeholder="Schreibe eine Nachricht..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={!message.trim()}>
          <SendHorizontal className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
