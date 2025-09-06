
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { EmailViewer } from './EmailViewer';
import { EmailList } from './EmailList';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';

interface EmailLayoutProps {
  userEmail?: string;
}

export function EmailLayout({ userEmail }: EmailLayoutProps) {
  const { user } = useAuth();
  const [selectedEmailId, setSelectedEmailId] = useState<string | null>(null);
  const [currentFolder, setCurrentFolder] = useState('inbox');
  
  // Query for API email settings
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
    enabled: !!user,
  });
  
  const handleEmailListRefresh = () => {
    // If the currently selected email was moved (archived/deleted)
    // clear the selection to avoid showing a deleted email
    if (selectedEmailId) {
      supabase
        .from('emails')
        .select('id')
        .eq('id', selectedEmailId)
        .eq('archived', false)
        .maybeSingle()
        .then(({ data }) => {
          if (!data) {
            setSelectedEmailId(null);
          }
        });
    }
  };
  
  const goToSettings = () => {
    window.location.href = '/settings?tab=email';
  };
  
  if (!apiSettings) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-4">
        <Settings className="h-12 w-12 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Email Not Configured</h2>
        <p className="text-center text-muted-foreground mb-4">
          Please configure your email settings to start syncing emails.
        </p>
        <Button onClick={goToSettings}>
          Configure Email
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-12 h-full">
      <div className="md:col-span-1 lg:col-span-3 border-r">
        <Tabs defaultValue="inbox" value={currentFolder} onValueChange={setCurrentFolder}>
          <div className="p-2 border-b">
            <TabsList className="w-full">
              <TabsTrigger value="inbox" className="flex-1">Inbox</TabsTrigger>
              <TabsTrigger value="archive" className="flex-1">Archive</TabsTrigger>
              <TabsTrigger value="trash" className="flex-1">Trash</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="inbox" className="h-[calc(100vh-8rem)] border-0 m-0 p-0">
            <EmailList 
              onSelectEmail={setSelectedEmailId} 
              selectedEmailId={selectedEmailId}
              currentFolder="INBOX"
              apiSettings={apiSettings}
            />
          </TabsContent>
          
          <TabsContent value="archive" className="h-[calc(100vh-8rem)] border-0 m-0 p-0">
            <EmailList 
              onSelectEmail={setSelectedEmailId} 
              selectedEmailId={selectedEmailId}
              currentFolder="archive"
              apiSettings={apiSettings}
            />
          </TabsContent>
          
          <TabsContent value="trash" className="h-[calc(100vh-8rem)] border-0 m-0 p-0">
            <EmailList 
              onSelectEmail={setSelectedEmailId} 
              selectedEmailId={selectedEmailId}
              currentFolder="trash"
              apiSettings={apiSettings}
            />
          </TabsContent>
        </Tabs>
      </div>
      
      <Separator orientation="vertical" className="md:hidden" />
      
      <div className="md:col-span-2 lg:col-span-9 h-[calc(100vh-4rem)]">
        <EmailViewer 
          emailId={selectedEmailId} 
          userEmail={userEmail}
          onRefresh={handleEmailListRefresh}
        />
      </div>
    </div>
  );
}
