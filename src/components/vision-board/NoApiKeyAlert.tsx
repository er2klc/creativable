import { Link } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export const NoApiKeyAlert = () => {
  return (
    <div className="container mx-auto p-6">
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>OpenAI API-Schlüssel fehlt</AlertTitle>
        <AlertDescription>
          Um das Inspirationsboard nutzen zu können, benötigst du einen OpenAI API-Schlüssel. 
          Du kannst deinen API-Schlüssel in den{" "}
          <Link to="/settings" className="font-medium underline underline-offset-4">
            Einstellungen
          </Link>{" "}
          hinterlegen.
          <div className="mt-2">
            <p>So findest du deinen API-Schlüssel:</p>
            <ol className="list-decimal list-inside mt-2">
              <li>Gehe zu <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI API Keys</a></li>
              <li>Melde dich an oder erstelle ein Konto</li>
              <li>Klicke auf "Create new secret key"</li>
              <li>Kopiere den generierten Schlüssel (beginnt mit "sk-")</li>
              <li>Füge den Schlüssel in den Einstellungen ein</li>
            </ol>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};