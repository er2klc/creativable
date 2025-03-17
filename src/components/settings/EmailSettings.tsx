
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImapSettings } from "./ImapSettings";
import { SmtpSettings } from "./SmtpSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { Mail, Info, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function EmailSettings() {
  const { settings } = useSettings();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("imap");
  const [hasImapConfig, setHasImapConfig] = useState(false);
  
  // Check if IMAP is configured
  useEffect(() => {
    const checkImapConfig = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('imap_settings')
          .select('id, host')
          .eq('user_id', user.id)
          .single();
          
        setHasImapConfig(!!data?.host);
      } catch (error) {
        console.error('Error checking IMAP config:', error);
      }
    };
    
    checkImapConfig();
  }, [user]);
  
  const handleTabChange = (value: string) => {
    if (value === "smtp" && !hasImapConfig) {
      toast.warning("Bitte konfigurieren Sie zuerst Ihre IMAP-Einstellungen");
    }
    setActiveTab(value);
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md mb-6">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <div>
            <h3 className="text-sm font-medium text-blue-800">E-Mail-Konfiguration</h3>
            <p className="text-sm text-blue-700 mt-1">
              Konfigurieren Sie Ihre E-Mail-Einstellungen für den E-Mail-Empfang (IMAP) und -Versand (SMTP).
              Um E-Mails senden zu können, müssen zuerst die IMAP-Einstellungen konfiguriert werden.
            </p>
          </div>
        </div>
      </div>
      
      <Card className="w-full overflow-hidden border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>E-Mail-Integration</CardTitle>
          </div>
          <CardDescription>
            Verbinden Sie Ihr E-Mail-Konto für nahtlose Kommunikation mit Ihren Kontakten
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs 
            defaultValue="imap" 
            value={activeTab} 
            onValueChange={handleTabChange}
            className="w-full"
          >
            <div className="border-b bg-muted/30">
              <TabsList className="w-full h-14 justify-start gap-2 px-6 rounded-none bg-transparent">
                <TabsTrigger 
                  value="imap" 
                  className="h-12 px-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none flex gap-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>IMAP-Einstellungen</span>
                  {hasImapConfig && (
                    <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Konfiguriert
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger 
                  value="smtp" 
                  className="h-12 px-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none flex gap-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>SMTP-Einstellungen</span>
                  {settings?.smtp_configured && (
                    <span className="ml-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Konfiguriert
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="imap" className="m-0">
                <ImapSettings onSettingsSaved={() => setHasImapConfig(true)} />
              </TabsContent>
              <TabsContent value="smtp" className="m-0">
                {!hasImapConfig && (
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded-md mb-6">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-amber-500 mr-2 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-amber-800">IMAP-Einstellungen erforderlich</h3>
                        <p className="text-sm text-amber-700 mt-0.5">
                          Bitte konfigurieren Sie zuerst Ihre IMAP-Einstellungen, bevor Sie die SMTP-Einstellungen festlegen.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                <SmtpSettings />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
