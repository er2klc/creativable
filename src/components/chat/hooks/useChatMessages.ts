
import { useState, useCallback, FormEvent, ChangeEvent } from "react";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface UseChatMessagesProps {
  sessionToken: string | null;
  apiKey: string | null;
  userId: string | null;
  currentTeamId: string | null;
  systemMessage: string;
}

export const useChatMessages = ({
  sessionToken,
  apiKey,
  userId,
  currentTeamId,
  systemMessage,
}: UseChatMessagesProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "system",
      role: "system",
      content: systemMessage,
    }
  ]);
  const [input, setInput] = useState("");

  const resetMessages = useCallback(() => {
    setMessages([
      {
        id: "system",
        role: "system",
        content: systemMessage,
      }
    ]);
  }, [systemMessage]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>, overrideMessage?: string) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    
    if (isProcessing) return;
    
    const currentInput = overrideMessage || input.trim();
    if (!currentInput) return;
    
    setIsProcessing(true);
    
    try {
      // Add user message to chat
      const newMessages = [
        ...messages,
        { 
          id: Date.now().toString(), 
          role: 'user' as const, 
          content: currentInput 
        }
      ];
      
      setMessages(newMessages);
      
      // Clear input field
      if (!overrideMessage) {
        setInput('');
      }
      
      // Eventually here would be the code to get a response from API
      // For now we'll simulate a response after a delay
      setTimeout(() => {
        setMessages([
          ...newMessages,
          {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: `This is a simulated response to: "${currentInput}"`
          }
        ]);
        setIsProcessing(false);
      }, 1000);
      
      return true;
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setIsProcessing(false);
      return false;
    }
  };

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    resetMessages,
    isLoading: isProcessing
  };
};
