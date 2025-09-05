import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ExternalLink } from "lucide-react";

interface InstagramSetupInstructionsProps {
  redirectUri: string;
}

export function InstagramSetupInstructions({ redirectUri }: InstagramSetupInstructionsProps) {
  const privacyPolicyUrl = `${window.location.origin}/privacy-policy`;
  const dataDeleteUrl = `${window.location.origin}/auth/data-deletion/instagram`;

  return (
    <Alert>
      <AlertTitle>Einrichtungsanleitung</AlertTitle>
      <AlertDescription>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="step1">
            <AccordionTrigger>1. Meta Business Account einrichten</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Gehen Sie zu <a href="https://business.facebook.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">business.facebook.com</a></li>
                <li>Erstellen Sie einen Business Account falls noch nicht vorhanden</li>
                <li>Fügen Sie Ihre Instagram Professional Account hinzu</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="step2">
            <AccordionTrigger>2. Meta Developer App erstellen</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Gehen Sie zu <a href="https://developers.facebook.com/apps/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">developers.facebook.com/apps</a></li>
                <li>Klicken Sie auf "App erstellen"</li>
                <li>Wählen Sie "Business" als App-Typ</li>
                <li>Füllen Sie die erforderlichen Details aus</li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="step3">
            <AccordionTrigger>3. App konfigurieren</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Fügen Sie das Produkt "Facebook Login" hinzu</li>
                <li>Unter "Facebook Login" {'->'} "Einstellungen":</li>
                <li className="ml-4">Aktivieren Sie "Client OAuth Login"</li>
                <li className="ml-4">Aktivieren Sie "Web OAuth Login"</li>
                <li className="ml-4">Fügen Sie diese URIs hinzu:</li>
                <div className="bg-muted p-3 rounded-md space-y-2 text-sm mt-2">
                  <div>
                    <p className="font-medium">OAuth Redirect URI:</p>
                    <code className="block mt-1">{redirectUri}</code>
                  </div>
                  <div>
                    <p className="font-medium">Deauthorize Callback URL:</p>
                    <code className="block mt-1">{`${window.location.origin}/auth/deauthorize/instagram`}</code>
                  </div>
                  <div>
                    <p className="font-medium">Data Deletion Request URL:</p>
                    <code className="block mt-1">{dataDeleteUrl}</code>
                  </div>
                </div>
                <li>Unter "App-Einstellungen" {'->'} "Grundlegendes":</li>
                <li className="ml-4">App-ID und App-Geheimnis kopieren</li>
                <li className="ml-4">App-Domäne hinzufügen: <code>{window.location.host}</code></li>
                <li className="ml-4">Website-URL hinzufügen: <code>{window.location.origin}</code></li>
                <li className="ml-4">Datenschutzrichtlinie URL hinzufügen: <code>{privacyPolicyUrl}</code></li>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="step4">
            <AccordionTrigger>4. Berechtigungen konfigurieren</AccordionTrigger>
            <AccordionContent>
              <ol className="list-decimal pl-4 space-y-2">
                <li>Unter "App-Überprüfung" {'->'} "Berechtigungen und Funktionen":</li>
                <li>Folgende Berechtigungen hinzufügen:</li>
                <ul className="list-disc ml-4 mt-2">
                  <li>instagram_basic</li>
                  <li>instagram_content_publish</li>
                  <li>instagram_manage_comments</li>
                  <li>instagram_manage_insights</li>
                  <li>pages_show_list</li>
                  <li>pages_read_engagement</li>
                  <li>business_management</li>
                </ul>
              </ol>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="step5">
            <AccordionTrigger>5. Wichtige URLs für die App-Überprüfung</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Datenschutzrichtlinie URL:</h4>
                  <code className="block p-2 bg-muted rounded-md text-sm mt-1">
                    {privacyPolicyUrl}
                  </code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Diese URL muss in den App-Einstellungen unter "Datenschutzrichtlinie URL" eingetragen werden.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium">Datenlöschungs-Callback URL:</h4>
                  <code className="block p-2 bg-muted rounded-md text-sm mt-1">
                    {dataDeleteUrl}
                  </code>
                  <p className="text-sm text-muted-foreground mt-1">
                    Diese URL muss in den App-Einstellungen unter "Data Deletion Request URL" eingetragen werden.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-4">
          <a 
            href="https://developers.facebook.com/apps/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-primary flex items-center hover:underline"
          >
            Zur Meta Developers Console
            <ExternalLink className="ml-1 h-4 w-4" />
          </a>
        </div>
      </AlertDescription>
    </Alert>
  );
}