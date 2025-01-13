import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SendHorizontal } from "lucide-react";

interface ChatInputProps {
  input: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
}

export const ChatInput = ({ input, handleInputChange, handleSubmit }: ChatInputProps) => {
  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-2 mt-4">
      <Input
        placeholder="Schreibe eine Nachricht..."
        value={input}
        onChange={handleInputChange}
        className="flex-1"
      />
      <Button type="submit" size="icon" disabled={!input.trim()}>
        <SendHorizontal className="h-4 w-4" />
      </Button>
    </form>
  );
};