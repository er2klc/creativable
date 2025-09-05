import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function IntegrationsSimplified() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Social Media Integrations</CardTitle>
          <CardDescription>
            Connect your social media accounts to manage posts and engagement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {["Instagram", "Facebook", "LinkedIn", "TikTok", "WhatsApp"].map((platform) => (
            <div key={platform} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  {platform[0]}
                </div>
                <div>
                  <h4 className="font-medium">{platform}</h4>
                  <p className="text-sm text-muted-foreground">Not connected</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">Disconnected</Badge>
                <Button size="sm" variant="outline">
                  Connect
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}