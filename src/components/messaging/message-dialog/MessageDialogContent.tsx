import { Settings } from "@/integrations/supabase/types/settings";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface MessageDialogContentProps {
  platform: string;
  message: string;
  onMessageChange: (message: string) => void;
  isGenerating: boolean;
  isSending: boolean;
  onGenerate: () => void;
  onSend: () => void;
  settings?: Settings;
}

export function MessageDialogContent({
  platform,
  message,
  onMessageChange,
  isGenerating,
  isSending,
  onGenerate,
  onSend,
  settings,
}: MessageDialogContentProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="platform">
          {settings?.language === "en" ? "Platform" : "Plattform"}
        </Label>
        <div className="flex items-center gap-2 p-2 border rounded-md bg-muted">
          {platform}
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="message">
          {settings?.language === "en" ? "Message" : "Nachricht"}
        </Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          rows={4}
        />
        <Button 
          variant="outline" 
          onClick={onGenerate}
          disabled={isGenerating || isSending}
        >
          {isGenerating 
            ? (settings?.language === "en" ? "Generating..." : "Wird generiert...") 
            : (settings?.language === "en" ? "Generate Message" : "Nachricht generieren")}
        </Button>
      </div>
      <Button 
        onClick={onSend} 
        disabled={isGenerating || isSending || !message}
      >
        {isSending 
          ? (settings?.language === "en" ? "Sending..." : "Wird gesendet...") 
          : (settings?.language === "en" ? "Send" : "Senden")}
      </Button>
    </div>
  );
}