
import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Mail } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { ExternalApiEmailForm } from "./ExternalApiEmailForm";
import { EmailDiagnosticsPanel } from "./EmailDiagnosticsPanel";

export function NewEmailSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("config");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [apiSettings, setApiSettings] = useState<any>(null);
  const [emailConfigured, setEmailConfigured] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const loadSettings = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Load API email settings
        const { data: apiData, error: apiError } = await supabase
          .from('api_email_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
          
        if (apiError && apiError.code !== 'PGRST116') {
          throw new Error(`Fehler beim Laden der E-Mail-Einstellungen: ${apiError.message}`);
        }
        
        setApiSettings(apiData || null);
        setEmailConfigured(!!(apiData && apiData.host));
        
      } catch (error: any) {
        console.error('Error loading email settings:', error);
        setError(error.message);
        toast.error(`Fehler beim Laden der E-Mail-Einstellungen: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSettings();
  }, [user]);
  
  const handleSettingsSaved = () => {
    // After saving settings, reload them to get the latest data
    if (user) {
      setIsLoading(true);
      
      supabase
        .from('api_email_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) setApiSettings(data);
          setEmailConfigured(!!(data && data.host));
        })
        .catch(error => {
          console.error('Error reloading settings after save:', error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-6" />
        
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-2/3 mt-2" />
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Fehler</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2"
          onClick={() => window.location.reload()}
        >
          Neu laden
        </Button>
      </Alert>
    );
  }

  const ConfigView = () => (
    <div className="space-y-6">
      {emailConfigured ? (
        <Alert className="bg-green-50 border-green-200 text-green-800">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>E-Mail konfiguriert</AlertTitle>
          <AlertDescription>
            Ihre E-Mail-Einstellungen sind konfiguriert. Sie können sie jederzeit bearbeiten.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert className="bg-blue-50 border-blue-200 text-blue-800">
          <Mail className="h-4 w-4" />
          <AlertTitle>E-Mail einrichten</AlertTitle>
          <AlertDescription>
            Konfigurieren Sie Ihre E-Mail-Zugangsdaten für den Empfang von E-Mails.
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 gap-6">
        <ExternalApiEmailForm 
          existingSettings={apiSettings}
          onSettingsSaved={handleSettingsSaved}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-md">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <CardTitle>E-Mail-Einstellungen</CardTitle>
            </div>
            {emailConfigured && (
              <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-200">
                Konfiguriert
              </Badge>
            )}
          </div>
          <CardDescription>
            Verwalten Sie Ihre E-Mail-Verbindung für den E-Mail-Empfang
          </CardDescription>
        </CardHeader>
        
        <div className="p-0">
          <Tabs defaultValue="config" onValueChange={setActiveTab}>
            <div className="border-b bg-muted/30">
              <TabsList className="w-full h-14 justify-start gap-2 px-6 rounded-none bg-transparent">
                <TabsTrigger 
                  value="config" 
                  className="h-12 px-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none flex gap-2"
                >
                  <Mail className="h-4 w-4" />
                  <span>Konfiguration</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="diagnostics" 
                  className="h-12 px-4 data-[state=active]:bg-white data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none flex gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  <span>Diagnose & Wartung</span>
                </TabsTrigger>
              </TabsList>
            </div>
            
            <div className="p-6">
              <TabsContent value="config" className="m-0 p-0">
                <ConfigView />
              </TabsContent>
              
              <TabsContent value="diagnostics" className="m-0 p-0">
                <EmailDiagnosticsPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}
