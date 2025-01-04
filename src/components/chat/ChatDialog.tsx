import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export function ChatDialog({ open, onOpenChange }) {
  const [sessionToken, setSessionToken] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${process.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sessionToken}`,
          "X-OpenAI-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error("Chat request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        result += chunk;
        setMessages((prev) => [...prev, { role: "assistant", content: chunk }]);
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Fehler beim Abrufen der Antwort.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    fetchMessages();
  };

  useEffect(() => {
    const setupChat = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Bitte melden Sie sich an.");
        return;
      }

      setSessionToken(session.access_token);
      const { data: chatbotSettings } = await supabase
        .from("chatbot_settings")
        .select("openai_api_key")
        .eq("user_id", session.user.id)
        .single();

      setApiKey(chatbotSettings?.openai_api_key);
    };

    if (open) setupChat();
  }, [open]);

  return (
    <div>
      {/* Chat UI */}
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          Senden
        </button>
      </form>
    </div>
  );
}
