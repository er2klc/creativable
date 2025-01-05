import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useChatContext } from "@/hooks/use-chat-context";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useQueryClient } from "@tanstack/react-query";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PhaseChangeRequest {
  leadId: string;
  newPhase: string;
  leadName: string;
}

export function ChatDialog({ open, onOpenChange }: ChatDialogProps) {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [phaseChangeRequest, setPhaseChangeRequest] = useState<PhaseChangeRequest | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { systemMessage } = useChatContext();
  const queryClient = useQueryClient();

  const handlePhaseChange = async (leadId: string, newPhase: string) => {
    try {
      const { error } = await supabase
        .from("leads")
        .update({ 
          phase: newPhase,
          last_action: "Phase via Chat geändert",
          last_action_date: new Date().toISOString(),
        })
        .eq("id", leadId);

      if (error) throw error;

      // Invalidate queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["chat-context-leads"] });

      toast.success(
        "Phase erfolgreich aktualisiert"
      );

      // Add confirmation message to chat
      const confirmationMessage = {
        id: Date.now().toString(),
        role: "assistant" as const,
        content: `Ich habe die Phase des Kontakts erfolgreich auf "${newPhase}" geändert.`
      };
      setMessages([...messages, confirmationMessage]);

    } catch (error) {
      console.error("Error updating phase:", error);
      toast.error("Fehler beim Aktualisieren der Phase");
    }
  };

  const { messages, input, handleInputChange, handleSubmit, setMessages } = useChat({
    api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      'X-OpenAI-Key': apiKey || '',
    },
    initialMessages: [
      {
        id: "system",
        role: "system",
        content: systemMessage,
      }
    ],
    streamProtocol: 'text',
    onResponse: (response) => {
      console.log("Chat response started");
      
      // Check for phase change commands in the message
      const phaseChangeRegex = /ändere die phase von kontakt "([^"]+)" (?:zu|auf|in) "([^"]+)"/i;
      const match = response.match(phaseChangeRegex);
      
      if (match) {
        const [_, leadName, newPhase] = match;
        // Find the lead ID based on the name
        queryClient.getQueryData(["chat-context-leads"])?.forEach((lead: any) => {
          if (lead.name.toLowerCase() === leadName.toLowerCase()) {
            setPhaseChangeRequest({
              leadId: lead.id,
              newPhase,
              leadName
            });
          }
        });
      }
    },
    onFinish: () => {
      console.log("Chat response finished");
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    },
    onError: (error) => {
      console.error("Chat error:", error);
      toast.error("Fehler beim Senden der Nachricht. Bitte versuchen Sie es später erneut.");
    },
  });

  useEffect(() => {
    const setupChat = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast.error("Bitte melde dich an.");
          return;
        }
        setSessionToken(session.access_token);

        const { data: profile } = await supabase
          .from("profiles")
          .select("display_name")
          .eq("id", session.user.id)
          .single();

        if (profile?.display_name) {
          setUserName(profile.display_name.split(" ")[0]); // Get first name
        }

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
        }
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
            role: "system",
            content: systemMessage,
          },
          {
            id: "welcome",
            role: "assistant",
            content: userName 
              ? `Hallo ${userName}! Ich bin Nexus, dein persönlicher KI-Assistent. Ich unterstütze dich gerne bei allen Fragen rund um dein Network Marketing Business. Du kannst mich auch bitten, die Phase eines Kontakts zu ändern, z.B. "Ändere die Phase von Kontakt 'Max Mustermann' zu 'Follow-up'"` 
              : "Hallo! Ich bin Nexus, dein persönlicher KI-Assistent. Wie kann ich dir heute helfen?"
          }
        ]);
      }
    }
  }, [open, setMessages, systemMessage, userName]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <ChatHeader onMinimize={onOpenChange} />
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

      <AlertDialog open={!!phaseChangeRequest} onOpenChange={() => setPhaseChangeRequest(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Phase ändern</AlertDialogTitle>
            <AlertDialogDescription>
              Möchtest du die Phase von Kontakt "{phaseChangeRequest?.leadName}" wirklich zu "{phaseChangeRequest?.newPhase}" ändern?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (phaseChangeRequest) {
                  handlePhaseChange(phaseChangeRequest.leadId, phaseChangeRequest.newPhase);
                }
                setPhaseChangeRequest(null);
              }}
            >
              Bestätigen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}