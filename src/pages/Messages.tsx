
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, Settings, AlertCircle, Clock, Calendar } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from '@/components/ui/progress';
import { DatePicker } from '@/components/ui/date-picker';
import { Switch } from '@/components/ui/switch';
import { useSettings } from '@/hooks/use-settings';
import { ScrollArea } from '@/components/ui/scroll-area';
import { EmailLayout } from '@/features/email/components/layout/EmailLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function Messages() {
  // ---- React hooks must be called at the top level and in same order every time ----
  
  // Auth and state hooks
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfigured, setIsConfigured] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const configCheckCompletedRef = useRef(false);

  // Fetch user profile for header - called unconditionally
  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user // This ensures the query only runs when user exists
  });

  // Query for API email settings - called unconditionally
  const { data: apiSettings } = useQuery({
    queryKey: ['api-email-settings'],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('api_email_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.log("No email settings found");
          return null;
        }
        throw error;
      }
      
      return data;
    },
    enabled: !!user, // This ensures the query only runs when user exists
  });

  // Check email configuration only once - simplified for external API
  useEffect(() => {
    let isMounted = true;
    
    const checkConfig = async () => {
      if (!user || configCheckCompletedRef.current) {
        if (isMounted) {
          setIsCheckingConfig(false);
        }
        return;
      }
      
      try {
        setIsCheckingConfig(true);
        
        // Check for API email settings
        const { data, error } = await supabase
          .from('api_email_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (isMounted) {
          setIsConfigured(!!data && !!data.host);
          configCheckCompletedRef.current = true;
        }
      } catch (error) {
        console.error("Error checking email config:", error);
        if (isMounted) {
          setIsConfigured(false);
          configCheckCompletedRef.current = true;
        }
      } finally {
        if (isMounted) {
          setIsCheckingConfig(false);
        }
      }
    };
    
    if (user && !configCheckCompletedRef.current) {
      checkConfig();
    } else {
      setIsCheckingConfig(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [user]);

  // Reset config check when authentication changes
  useEffect(() => {
    if (!user) {
      configCheckCompletedRef.current = false;
    }
  }, [user]);

  // ---- All hooks have been called by this point, now we can have conditional renders ----

  // Render states based on authentication and configuration
  if (!user) {
    return (
      <div className="container mx-auto p-4 overflow-x-hidden">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Nachrichten</CardTitle>
            <CardDescription>Verbinden Sie sich mit Ihrer E-Mail, um Ihre Nachrichten anzuzeigen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg text-center">
                Bitte melden Sie sich an, um auf Ihre Nachrichten zuzugreifen
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isCheckingConfig) {
    return (
      <div className="container mx-auto p-4 overflow-x-hidden">
        <DashboardHeader userEmail={user?.email} />
        <div className="pt-[132px] md:pt-[84px]">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl">Nachrichten</CardTitle>
              <CardDescription>Überprüfe Ihre E-Mail-Konfiguration...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4" />
                <p className="text-lg text-center">
                  Überprüfe Ihre E-Mail-Einstellungen...
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="container mx-auto p-4 overflow-x-hidden">
        <DashboardHeader userEmail={user?.email} />
        <div className="pt-[132px] md:pt-[84px]">
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-xl">Nachrichten</CardTitle>
              <CardDescription>Verbinden Sie sich mit Ihrer E-Mail, um Ihre Nachrichten anzuzeigen</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-center mb-4">
                  Bitte konfigurieren Sie Ihre E-Mail-Einstellungen, um Ihre E-Mails zu synchronisieren
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/settings?tab=email'}
                >
                  Zu den E-Mail-Einstellungen
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main component render when everything is set up
  return (
    <div className="container-fluid p-0 h-[calc(100vh-4rem)] overflow-hidden">
      <Card className="w-full h-full rounded-none border-0 shadow-none">
        <CardContent className="p-0 h-full">
          <EmailLayout 
            userEmail={apiSettings?.username || user?.email}
          />
        </CardContent>
      </Card>
    </div>
  );
}
