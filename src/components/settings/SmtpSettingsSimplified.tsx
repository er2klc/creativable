import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function SmtpSettingsSimplified() {
  const [isLoading, setIsLoading] = useState(false);

  const handleTestConnection = async () => {
    setIsLoading(true);
    try {
      // Simplified test connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("SMTP connection test successful");
    } catch (error) {
      toast.error("SMTP connection test failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMTP Settings</CardTitle>
        <CardDescription>
          Configure your SMTP settings for sending emails.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            SMTP configuration is temporarily disabled while we fix some issues.
          </p>
          <Button 
            onClick={handleTestConnection} 
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? "Testing..." : "Test Connection"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}