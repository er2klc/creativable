import React from "react";
import { useSettings } from "@/hooks/use-settings";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle, XCircle, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function WhatsAppIntegration() {
  const { settings, updateSettings } = useSettings();
  const { toast } = useToast();
  const isConnected = settings?.whatsapp_verified || false;

  const connectWhatsApp = async () => {
    try {
      toast({
        title: "WhatsApp Integration",
        description: "WhatsApp Integration wird bald verfügbar sein.",
      });
    } catch (error) {
      console.error("Error connecting to WhatsApp:", error);
      toast({
        title: "Fehler bei der WhatsApp-Verbindung",
        description: "Bitte versuchen Sie es später erneut",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-green-500" />
          <h3 className="text-lg font-medium">WhatsApp Integration</h3>
          {isConnected ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-red-500" />
          )}
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant={isConnected ? "outline" : "default"}>
              {isConnected ? "Einstellungen" : "Verbinden"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>WhatsApp Integration Einrichten</DialogTitle>
              <DialogDescription>
                Folgen Sie diesen Schritten um WhatsApp zu verbinden:
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">1. WhatsApp Business API</h4>
                <p className="text-sm text-muted-foreground">
                  Erstellen Sie einen WhatsApp Business Account.
                </p>
              </div>
              <Button onClick={connectWhatsApp} className="w-full">
                Mit WhatsApp verbinden
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <p className="text-sm text-muted-foreground">
        Verbinden Sie Ihr WhatsApp-Konto um Leads automatisch zu kontaktieren und
        Nachrichten zu versenden.
      </p>
    </Card>
  );
}