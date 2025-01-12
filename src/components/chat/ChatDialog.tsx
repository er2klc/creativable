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
        id: "system",
        role: "system" as const,
        content: systemMessage,
      }
    ] as Message[],
    body: {
      teamId: null as string | null,
      platformId: null as string | null
    },
    onResponse: () => {
      console.log("Chat response started");
    },
    onFinish: () => {
      console.log("Chat response finished");
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    },
    onError: (error: any) => {
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

        // Fetch user profile information
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profile?.display_name) {
          setUserName(profile.display_name.split(" ")[0]); // Get first name
        }

        // Fetch chatbot settings
        const { data: chatbotSettings, error } = await supabase
          .from("chatbot_settings")
          .select("openai_api_key")
          .eq("user_id", session.user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching chatbot settings:", error);
          toast.error("Fehler beim Laden der Chat-Einstellungen.");
          return;
        }

        if (chatbotSettings?.openai_api_key) {
          setApiKey(chatbotSettings.openai_api_key);
          console.log("OpenAI API key loaded successfully");
        } else {
          toast.error("Kein OpenAI API-Key gefunden. Bitte hinterlege ihn in den Einstellungen.");
          return;
        }

        // Get team memberships
        const { data: teamMemberships } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', session.user.id);

        const teamIds = teamMemberships?.map(tm => tm.team_id) || [];

        // Update chat config with context
        chatConfig.body = {
          ...chatConfig.body,
          teamIds,
          userId: session.user.id
        };

        setIsReady(true);
      } catch (error) {
        console.error("Error in setupChat:", error);
        toast.error("Fehler beim Einrichten des Chats.");
      }
    };

    if (open) {
      setupChat();
      if (messages.length <= 1) { // Only system message or empty
        setMessages([
          {
            id: "system",
            role: "system" as const,
            content: systemMessage,
          } as Message,
          {
            id: "welcome",
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