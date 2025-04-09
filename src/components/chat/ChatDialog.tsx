
import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChatHeader } from "./ChatHeader";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { useChatMessages } from "./hooks/useChatMessages";
import { ChatContactList } from "./contact-selection/ChatContactList";
import { useLeadStore } from "@/store/useLeadStore";
import { useSettings } from "@/hooks/use-settings";
import { useSession } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { MessageTemplateSelector } from "./template-selection/MessageTemplateSelector";
import { MessagePreview } from "./message-preview/MessagePreview";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLeadSubscription } from "../leads/detail/hooks/useLeadSubscription";

interface ChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ChatDialog = ({ open, onOpenChange }: ChatDialogProps) => {
  const { settings } = useSettings();
  const session = useSession();
  const isMobile = useIsMobile();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [flowState, setFlowState] = useState("initial");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [previewMessage, setPreviewMessage] = useState("");
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const { leads } = useLeadStore();

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    setMessages,
    resetMessages
  } = useChatMessages({
    sessionToken: session?.access_token || null,
    apiKey: settings?.openai_api_key || null,
    userId: session?.user?.id || null,
    currentTeamId: null,
    systemMessage: "You are a helpful assistant."
  });

  useLeadSubscription(selectedContact?.id);

  const { data: templates } = useQuery({
    queryKey: ["message-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("message_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!session,
  });

  useEffect(() => {
    if (!open) {
      // Reset state when dialog closes
      setFlowState("initial");
      setSelectedContact(null);
      setSelectedTemplate(null);
      setPreviewMessage("");
      setIsPreviewReady(false);
    }
  }, [open]);

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
    setFlowState("templateSelection");
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
    setFlowState("preview");
    generatePreview(template, selectedContact);
  };

  const generatePreview = async (template: any, contact: any) => {
    setIsPreviewLoading(true);
    try {
      // Generate preview using AI or template variables
      const preview = template.content
        .replace("{{name}}", contact.name || "")
        .replace("{{company}}", contact.company_name || "");
      
      setPreviewMessage(preview);
      setIsPreviewReady(true);
    } catch (error) {
      console.error("Error generating preview:", error);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleSendMessage = () => {
    // Logic to send the message
    setMessages([
      ...messages,
      {
        id: Date.now().toString(),
        role: "user",
        content: previewMessage
      }
    ]);
    
    // Reset flow
    setFlowState("chat");
  };

  const handleBackToSelection = () => {
    setFlowState("contactSelection");
  };

  const renderContent = () => {
    switch (flowState) {
      case "initial":
      case "contactSelection":
        return (
          <ChatContactList
            contacts={leads}
            onSelect={handleContactSelect}
            selectedId={selectedContact?.id}
          />
        );
      case "templateSelection":
        return (
          <MessageTemplateSelector
            templateList={templates || []}
            onSelect={handleTemplateSelect}
            onBack={() => setFlowState("contactSelection")}
          />
        );
      case "preview":
        return (
          <MessagePreview
            message={previewMessage}
            isLoading={isPreviewLoading}
            onSend={handleSendMessage}
            onBack={() => setFlowState("templateSelection")}
            onEdit={setPreviewMessage}
          />
        );
      case "chat":
        return (
          <>
            <ChatMessages
              messages={messages}
              scrollRef={scrollRef}
            />
            <ChatInput
              value={input}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
            />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col h-[80vh] max-w-md p-0 gap-0 overflow-hidden">
        <ChatHeader
          title={selectedContact?.name || "Chat"}
          onBack={
            flowState !== "initial" && flowState !== "contactSelection"
              ? handleBackToSelection
              : undefined
          }
          onClose={() => onOpenChange(false)}
        />
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
};
