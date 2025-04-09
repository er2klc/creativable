
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
import { checkEmailConfigStatus } from '@/utils/debug-helper';
import { EmailLayout } from '@/features/email/components/layout/EmailLayout';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isConfigured, setIsConfigured] = useState(false);
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const configCheckCompletedRef = useRef(false);

  // Fetch user profile for header
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
    enabled: !!user
  });

  // Check email configuration only once
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
        const configStatus = await checkEmailConfigStatus();
        
        if (isMounted) {
          setIsConfigured(configStatus.isConfigured);
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

  // Query for settings if configured
  const { data: imapSettings } = useQuery({
    queryKey: ['imap-settings'],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('imap_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user && isConfigured && !isCheckingConfig,
  });

  if (!user) {
    return (
      <div className="container mx-auto p-4 overflow-x-hidden">
        <Card className="w-full">
          <CardHeader>
            <CardTitle className="text-xl">Messages</CardTitle>
            <CardDescription>Connect to your email to view your messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg text-center">
                Please log in to access your messages
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
              <CardTitle className="text-xl">Messages</CardTitle>
              <CardDescription>Checking your email configuration...</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4" />
                <p className="text-lg text-center">
                  Verifying your email settings...
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
              <CardTitle className="text-xl">Messages</CardTitle>
              <CardDescription>Connect to your email to view your messages</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12">
                <Settings className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-lg text-center mb-4">
                  Please configure your IMAP settings to sync your emails
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = '/settings?tab=email'}
                >
                  Go to Email Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid p-0 h-[calc(100vh-4rem)] overflow-hidden">
      <Card className="w-full h-full rounded-none border-0 shadow-none">
        <CardContent className="p-0 h-full">
          <EmailLayout 
            userEmail={imapSettings?.username || user?.email}
          />
        </CardContent>
      </Card>
    </div>
  );
}
