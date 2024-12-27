import { Check, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const RegistrationSuccess = () => {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6 px-8 pb-8 text-center space-y-6">
        <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
          <Check className="h-6 w-6 text-green-600" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Registrierung erfolgreich!</h2>
          <p className="text-muted-foreground">
            Wir haben Ihnen eine Bestätigungs-E-Mail gesendet.
            Bitte überprüfen Sie Ihren Posteingang und klicken Sie auf den Bestätigungslink.
          </p>
        </div>

        <div className="p-4 bg-muted/50 rounded-lg flex items-center gap-3">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-left">
            Nach der Bestätigung Ihrer E-Mail-Adresse können Sie sich anmelden und Ihr Profil vervollständigen.
          </p>
        </div>

        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => window.location.reload()}
        >
          Zurück zur Anmeldung
        </Button>
      </CardContent>
    </Card>
  );
};