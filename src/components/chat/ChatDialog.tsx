import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChatContext } from "@/hooks/use-chat-context";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { searchSimilarContent } from "@/utils/embeddings";
import type { Message } from "ai";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [currentTeamId, setCurrentTeamId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { systemMessage } = useChatContext();

  const chatConfig = {
    api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'X-OpenAI-Key': apiKey || '',
    },
    initialMessages: [
      {
        id: "system-1",
        role: "system" as const,
        content: systemMessage,
      }
    ] as Message[],
    body: {
      teamId: currentTeamId,
      platformId: null,
      currentTeamId: currentTeamId,
      userId: userId
    },
    onResponse: (response: Response) => {
      if (!response.ok) {
        console.error('Chat response error:', response.status, response.statusText)
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    },
    onFinish: async (message: Message) => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
      
      try {
        if (message.role === 'assistant') {
          const userMessage = messages[messages.length - 2];
          if (userMessage?.role === 'user') {
            const similarContent = await searchSimilarContent(userMessage.content, 'personal');
            console.log('Similar content found:', similarContent);
          }
        }
      } catch (error) {
        console.error('Error searching similar content:', error);
      }
    },
    onError: (error: Error) => {
      console.error("Chat error:", error);
      toast.error("Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.");
    },
  };

  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat(
    isReady ? chatConfig : { api: '' }
  );

  useEffect(() => {
    const setupChat = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Bitte melde dich an.");
          return;
        }
        setSessionToken(session.access_token);
        setUserId(session.user.id);

        // Lade das aktuelle Team des Users
        const { data: teamMembers, error: teamError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', session.user.id)
          .limit(1)
          .single();

        if (teamError) {
          console.error("Error fetching team:", teamError);
        } else if (teamMembers) {
          setCurrentTeamId(teamMembers.team_id);
          console.log("Set current team ID:", teamMembers.team_id);
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profile?.display_name) {
          setUserName(profile.display_name.split(" ")[0]);
        }

        const { data: settings, error: settingsError } = await supabase
          .from("settings")
          .select("openai_api_key")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (settingsError) {
          console.error("Error fetching settings:", settingsError);
          toast.error("Fehler beim Laden der Chat-Einstellungen.");
          return;
        }

        if (settings?.openai_api_key) {
          setApiKey(settings.openai_api_key);
          console.log("OpenAI API key loaded successfully");
        } else {
          toast.error("Kein OpenAI API-Key gefunden. Bitte hinterlege ihn in den Einstellungen.");
          return;
        }

        setIsReady(true);
      } catch (error) {
        console.error("Error in setupChat:", error);
        toast.error("Fehler beim Einrichten des Chats.");
      }
    };

    if (open) {
      setupChat();
      if (messages.length <= 1) {
        setMessages([
          {
            id: "system-1",
            role: "system" as const,
            content: systemMessage,
          } as Message,
          {
            id: "welcome-1",
            role: "assistant" as const,
            content: userName 
              ? `Hallo ${userName}! Ich bin Nexus, dein persönlicher KI-Assistent. Ich unterstütze dich gerne bei allen Fragen rund um dein Network Marketing Business. Wie kann ich dir heute helfen?` 
              : "Hallo! Ich bin Nexus, dein persönlicher KI-Assistent. Wie kann ich dir heute helfen?"
          } as Message
        ]);
      }
    }
  }, [open, setMessages, systemMessage, userName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleDialogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleClose = () => {
    onOpenChange(false);
    setMessages([
      {
        id: "system",
        role: "system" as const,
        content: systemMessage,
      } as Message
    ]);
    setIsReady(false);
  };

  if (!isReady) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <ChatHeader onMinimize={onOpenChange} onClose={handleClose} />
          <div className="flex items-center justify-center h-[600px]">
            <p className="text-muted-foreground">Initialisiere Chat...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" onClick={handleDialogClick} hideClose>
        <ChatHeader onMinimize={onOpenChange} onClose={handleClose} />
        <div className="flex flex-col h-[600px]">
          <ChatMessages messages={messages} scrollRef={scrollRef} />
          <ChatInput 
            input={input}
            handleInputChange={handleInputChange}
            handleSubmit={handleSubmit}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}