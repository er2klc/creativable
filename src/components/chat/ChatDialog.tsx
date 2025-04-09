
import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ChatMessages } from "./ChatMessages";
import { ChatInput } from "./ChatInput";
import { ChatContactList } from "./contact-selection/ChatContactList";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { MessageTemplateSelector } from "./template-selection/MessageTemplateSelector";

type FlowState = "idle" | "contact_selection" | "chat";

export const ChatDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) => {
  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedTemplateType, setSelectedTemplateType] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleContactSelect = (contact: any) => {
    setSelectedContact(contact);
    setFlowState("chat");
  };

  const handleNewChat = () => {
    setFlowState("contact_selection");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    // Add message to chat
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: "user",
      content: input
    }]);
    
    setInput("");
  };

  const handleSelectTemplate = (type: string) => {
    setSelectedTemplateType(type);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button>Open Chat</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          {flowState === "idle" && (
            <>
              <DialogTitle>Chat</DialogTitle>
              <DialogDescription>Start a new conversation</DialogDescription>
            </>
          )}
          {flowState === "contact_selection" && (
            <>
              <DialogTitle>Select Contact</DialogTitle>
              <DialogDescription>Choose a contact to chat with</DialogDescription>
            </>
          )}
          {flowState === "chat" && (
            <>
              <DialogTitle>Chat with {selectedContact?.name}</DialogTitle>
              <DialogDescription>Send messages and interact</DialogDescription>
            </>
          )}
        </DialogHeader>

        {flowState === "idle" && (
          <div className="grid gap-4 py-4">
            <Button onClick={handleNewChat}>
              <UserPlus className="mr-2 h-4 w-4" />
              New Chat
            </Button>
          </div>
        )}

        {flowState === "contact_selection" && (
          <div className="grid gap-4 py-4">
            <ChatContactList contacts={[]} onSelect={handleContactSelect} selectedId="" />
          </div>
        )}

        {flowState === "chat" && (
          <div className="flex flex-col h-[500px]">
            <ChatMessages messages={messages} scrollRef={scrollRef} />
            <MessageTemplateSelector onSelect={handleSelectTemplate} selectedType={selectedTemplateType || ""} />
            <ChatInput 
              input={input} 
              handleInputChange={handleInputChange} 
              handleSubmit={handleSubmit} 
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
