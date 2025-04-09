
import { FormEvent, ChangeEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: FormEvent) => void;
}

export const ChatInput = ({ value, onChange, onSubmit }: ChatInputProps) => {
  return (
    <form onSubmit={onSubmit} className="p-3 border-t flex gap-2">
      <Input
        placeholder="Type a message..."
        value={value}
        onChange={onChange}
        className="flex-1"
      />
      <Button type="submit" size="icon" disabled={!value.trim()}>
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};
