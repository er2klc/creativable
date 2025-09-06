
import { useState, useEffect } from "react";
import { Bot, Copy, Loader2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useSettings } from "@/hooks/use-settings";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Platform } from "@/config/platforms";

interface MessageGeneratorProps {
  leadId: string;
  leadName: string;
  platform: Platform;
  existingAnalysis?: string;
}

interface PlatformConfig {
  name: string;
  maxLength: number;
  emoji: boolean;
  styling: string;
}

// Platform-specific configurations
const platformConfigs: Record<string, PlatformConfig> = {
  Instagram: {
    name: "Instagram",
    maxLength: 1000,
    emoji: true,
    styling: "casual"
  },
  LinkedIn: {
    name: "LinkedIn",
    maxLength: 1900,
    emoji: false,
    styling: "professional"
  },
  Facebook: {
    name: "Facebook",
    maxLength: 2000,
    emoji: true,
    styling: "casual"
  },
  Email: {
    name: "Email",
    maxLength: 5000,
    emoji: false,
    styling: "formal"
  },
  WhatsApp: {
    name: "WhatsApp",
    maxLength: 1000,
    emoji: true,
    styling: "casual"
  },
  TikTok: {
    name: "TikTok",
    maxLength: 150,
    emoji: true,
    styling: "very_casual"
  },
  "Not Specified": {
    name: "Generic",
    maxLength: 2000,
    emoji: true,
    styling: "neutral"
  }
};

export function MessageGenerator({
  leadId,
  leadName,
  platform,
  existingAnalysis = ""
}: MessageGeneratorProps) {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedMessage, setGeneratedMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"introduction" | "follow_up" | "response">("introduction");
  const [characterCount, setCharacterCount] = useState(0);
  
  const platformConfig = platformConfigs[platform] || platformConfigs["Not Specified"];
  
  useEffect(() => {
    if (generatedMessage) {
      setCharacterCount(generatedMessage.length);
    } else {
      setCharacterCount(0);
    }
  }, [generatedMessage]);

  const generateMessage = async () => {
    if (!user) {
      toast.error(
        settings?.language === "en"
          ? "You must be logged in"
          : "Sie müssen angemeldet sein"
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Get user's display name to include in message
      const { data: profileData } = await supabase
        .from('profiles')
        .select('display_name')
        .eq('id', user.id)
        .single();
        
      const userName = profileData?.display_name || 'Sie';

      // Get lead data
      const { data: leadData } = await supabase
        .from('leads')
        .select(`
          *,
          social_media_posts:social_media_posts(content, platform, posted_at, likes_count, comments_count),
          notes:notes(content, created_at)
        `)
        .eq('id', leadId)
        .single();

      const result = await supabase.functions.invoke('generate-message', {
        body: {
          leadId,
          userName,
          messageType,
          platform,
          platformConfig,
          leadData,
          existingAnalysis,
          settings
        }
      }).catch(err => {
        console.error("Error calling function:", err);
        
        // Fallback to direct generation
        return generateMessageFallback(platform, leadName, userName);
      });

      if ('error' in result && result.error) {
        console.error('Error generating message:', result.error);
        toast.error('Fehler beim Generieren der Nachricht');
        return;  
      }

      const messageContent = result.data?.message || "Could not generate message";
      setGeneratedMessage(messageContent);

      // Save the message to the database
      await supabase
        .from('notes')
        .insert({
          lead_id: leadId,
          user_id: user.id,
          content: messageContent,
          metadata: { 
            type: 'message_template',
            message_type: messageType,
            platform: platform,
            generated_at: new Date().toISOString()
          }
        });

      toast.success(
        settings?.language === "en"
          ? "Message generated successfully"
          : "Nachricht erfolgreich erstellt"
      );
    } catch (error: any) {
      console.error("Error generating message:", error);
      toast.error(
        settings?.language === "en"
          ? `Error generating message: ${error.message || "Please try again"}`
          : `Fehler bei der Erstellung der Nachricht: ${error.message || "Bitte versuchen Sie es erneut"}`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMessageFallback = async (platform: string, leadName: string, userName: string) => {
    // This is just a placeholder
    const config = platformConfigs[platform] || platformConfigs["Not Specified"];
    let message = "";
    
    if (config.emoji) {
      message = `👋 Hallo ${leadName}! Mein Name ist ${userName}.`;
    } else {
      message = `Guten Tag ${leadName}, mein Name ist ${userName}.`;
    }
    
    return {
      data: {
        message
      }
    };
  };

  const copyToClipboard = async () => {
    if (!generatedMessage) return;
    
    try {
      await navigator.clipboard.writeText(generatedMessage);
      toast.success(
        settings?.language === "en"
          ? "Message copied to clipboard"
          : "Nachricht in die Zwischenablage kopiert"
      );
    } catch (err) {
      toast.error(
        settings?.language === "en"
          ? "Error copying message"
          : "Fehler beim Kopieren der Nachricht"
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {settings?.language === "en" ? "Message Generator" : "Nachrichtengenerator"}
          </CardTitle>
          <Badge variant="outline" className="px-2 py-1">
            {platform}
          </Badge>
        </div>
        <CardDescription>
          {settings?.language === "en"
            ? `Create a personalized ${platform} message optimized for engagement`
            : `Erstellen Sie eine personalisierte ${platform}-Nachricht für optimales Engagement`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={messageType} onValueChange={(v) => setMessageType(v as any)} className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="introduction" className="flex-1">
              {settings?.language === "en" ? "Introduction" : "Erstansprache"}
            </TabsTrigger>
            <TabsTrigger value="follow_up" className="flex-1">
              {settings?.language === "en" ? "Follow-up" : "Nachfassen"}
            </TabsTrigger>
            <TabsTrigger value="response" className="flex-1">
              {settings?.language === "en" ? "Response" : "Antwort"}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {!generatedMessage ? (
          <Button
            onClick={generateMessage}
            disabled={isGenerating}
            className="w-full bg-[#9b87f5] hover:bg-[#7E69AB] text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {settings?.language === "en" ? "Generating..." : "Generiere..."}
              </>
            ) : (
              <>
                <Bot className="h-4 w-4 mr-2" />
                {settings?.language === "en" ? "Generate Message" : "Nachricht erstellen"}
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg whitespace-pre-wrap">
              {generatedMessage}
            </div>
            <div className="flex gap-3">
              <Button onClick={copyToClipboard} className="flex-1 bg-[#F1F0FB] text-foreground hover:bg-[#E5E4F3]">
                <Copy className="h-4 w-4 mr-2" />
                {settings?.language === "en" ? "Copy to Clipboard" : "In Zwischenablage kopieren"}
              </Button>
              <Button 
                onClick={() => {
                  setGeneratedMessage(null);
                  generateMessage();
                }} 
                variant="outline"
                disabled={isGenerating}
                className="bg-white hover:bg-[#F1F0FB]"
              >
                <Bot className="h-4 w-4 mr-2" />
                {settings?.language === "en" ? "Regenerate" : "Neu erstellen"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <div className="text-xs text-muted-foreground">
          {settings?.language === "en" 
            ? `Optimized for ${platformConfig.name}: ${platformConfig.emoji ? 'With emojis' : 'No emojis'}, ${platformConfig.styling} style` 
            : `Optimiert für ${platformConfig.name}: ${platformConfig.emoji ? 'Mit Emojis' : 'Ohne Emojis'}, ${platformConfig.styling === 'professional' ? 'Professioneller' : platformConfig.styling === 'formal' ? 'Formeller' : platformConfig.styling === 'casual' ? 'Lockerer' : 'Neutraler'} Stil`}
        </div>
        <div className={`text-xs ${characterCount > platformConfig.maxLength ? 'text-red-500 font-bold' : 'text-muted-foreground'}`}>
          {characterCount}/{platformConfig.maxLength}
        </div>
      </CardFooter>
    </Card>
  );
}
