
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImapSettings } from "./ImapSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/hooks/use-settings";

export function EmailSettings() {
  const { settings } = useSettings();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Email Integration</CardTitle>
        <CardDescription>
          Configure your email settings to integrate with your inbox
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="imap" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="imap">IMAP Settings</TabsTrigger>
            <TabsTrigger value="smtp" disabled={!settings?.smtp_configured}>SMTP Settings</TabsTrigger>
          </TabsList>
          <TabsContent value="imap">
            <ImapSettings />
          </TabsContent>
          <TabsContent value="smtp">
            <Card className="border-none shadow-none">
              <CardHeader>
                <CardTitle>SMTP Settings</CardTitle>
                <CardDescription>
                  Configure your SMTP server to send emails
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  SMTP configuration will be added in a future update
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
