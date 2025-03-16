
import React, { useState, useEffect } from 'react';
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

export default function Messages() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [historicalSync, setHistoricalSync] = useState(false);
  const [syncStartDate, setSyncStartDate] = useState<Date | undefined>(undefined);
  const [maxEmails, setMaxEmails] = useState(100);
  const { settings } = useSettings();
  const hasImapSettings = settings?.imap_configured || false;

  // Query for settings
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
    enabled: !!user && hasImapSettings,
  });

  // Query for emails
  const { data: emails, isLoading } = useQuery({
    queryKey: ['emails'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('emails')
        .select('*')
        .eq('user_id', user.id)
        .order('sent_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Set initial values from stored settings
  useEffect(() => {
    if (imapSettings) {
      if (imapSettings.historical_sync) {
        setHistoricalSync(true);
      }
      if (imapSettings.historical_sync_date) {
        setSyncStartDate(new Date(imapSettings.historical_sync_date));
      }
      if (imapSettings.max_emails) {
        setMaxEmails(imapSettings.max_emails);
      }
    }
  }, [imapSettings]);

  const syncEmails = async (forceRefresh = false) => {
    if (!user) return;
    
    try {
      setSyncInProgress(true);
      setSyncProgress(0);
      
      // Prepare sync options
      const syncOptions = {
        force_refresh: forceRefresh,
        historical_sync: historicalSync,
        sync_start_date: syncStartDate?.toISOString(),
        max_emails: maxEmails
      };
      
      // Call the sync-emails function
      const response = await fetch('https://agqaitxlmxztqyhpcjau.supabase.co/functions/v1/sync-emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.session?.access_token}`
        },
        body: JSON.stringify(syncOptions)
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update progress
      if (result.progress) {
        setSyncProgress(result.progress);
      }
      
      if (result.success) {
        toast({
          title: 'Sync Successful',
          description: result.message || `Successfully synced ${result.emailsCount || 0} emails`,
        });
        
        // Refresh the emails list
        await queryClient.invalidateQueries({ queryKey: ['emails'] });
      } else {
        throw new Error(result.message || 'Failed to sync emails');
      }
    } catch (error: any) {
      console.error('Email sync error:', error);
      toast({
        title: 'Sync Failed',
        description: error.message || 'An error occurred while syncing emails',
        variant: 'destructive',
      });
    } finally {
      setSyncInProgress(false);
    }
  };

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

  if (!hasImapSettings) {
    return (
      <div className="container mx-auto p-4 overflow-x-hidden">
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
                onClick={() => window.location.href = '/settings'}
              >
                Go to Settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 overflow-x-hidden">
      <Card className="w-full mb-6">
        <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl">Email Sync</CardTitle>
            <CardDescription>Sync and manage your emails</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => syncEmails(true)}
              disabled={syncInProgress}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncInProgress ? 'animate-spin' : ''}`} />
              Force Refresh
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              onClick={() => syncEmails()}
              disabled={syncInProgress}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${syncInProgress ? 'animate-spin' : ''}`} />
              Sync Now
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {syncInProgress && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Syncing emails... {syncProgress}%</p>
              <Progress value={syncProgress} className="w-full" />
            </div>
          )}
          
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="historical-sync"
                  checked={historicalSync}
                  onCheckedChange={setHistoricalSync}
                />
                <label 
                  htmlFor="historical-sync"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Historical Sync
                </label>
              </div>
              <p className="text-sm text-muted-foreground">
                Fetch emails from a specific date instead of just the most recent ones
              </p>
            </div>
            
            {historicalSync && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Date</label>
                <DatePicker date={syncStartDate} setDate={setSyncStartDate} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">Your Messages</CardTitle>
          <CardDescription>
            {emails?.length || 0} emails synced from your account
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[60vh] px-4">
            {isLoading ? (
              <div className="animate-pulse space-y-4 py-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="p-4 border rounded-md">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : emails?.length ? (
              <div className="space-y-4 py-4">
                {emails.map((email) => (
                  <Card key={email.id} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-base line-clamp-1">
                            {email.subject || '(No Subject)'}
                          </CardTitle>
                          <CardDescription className="text-xs">
                            From: {email.from_name || email.from_email}
                          </CardDescription>
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {new Date(email.sent_at).toLocaleDateString()}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-2">
                      <p className="text-sm line-clamp-2">
                        {email.text_content || 'No preview available'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-center mb-4">No emails synced yet</p>
                <Button onClick={() => syncEmails()}>Sync Emails Now</Button>
              </div>
            )}
          </ScrollArea>
        </CardContent>
        {emails?.length > 0 && (
          <CardFooter className="border-t p-4 flex justify-center">
            <Button variant="outline">Load More</Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
