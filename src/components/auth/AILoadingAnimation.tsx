import { Bot } from "lucide-react";

export const AILoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative">
        <div className="absolute inset-0 animate-ping">
          <Bot className="h-16 w-16 text-primary/30" />
        </div>
        <Bot className="h-16 w-16 text-primary" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">KI analysiert Ihre Firmendaten</h3>
        <p className="text-sm text-muted-foreground">
          Bitte warten Sie während wir relevante Informationen für Ihr Profil sammeln...
        </p>
      </div>
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
      </div>
    </div>
  );
};