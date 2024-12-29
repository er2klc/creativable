import { AuthCard } from "@/components/auth/AuthCard";

const InstagramDataDeletion = () => {
  return (
    <AuthCard
      title="Instagram Datenlöschung"
      description="Informationen zur Datenlöschung bei Instagram"
    >
      <div className="prose prose-sm">
        <p>
          Um Ihre Instagram-Daten vollständig zu löschen, folgen Sie bitte diesen Schritten:
        </p>
        <ol>
          <li>Melden Sie sich in Ihrem Instagram-Konto an</li>
          <li>Gehen Sie zu den Einstellungen</li>
          <li>Wählen Sie "Datenschutz und Sicherheit"</li>
          <li>Klicken Sie auf "Datenherunterladen"</li>
          <li>Folgen Sie den Anweisungen zur Datenlöschung</li>
        </ol>
        <p>
          Für weitere Informationen besuchen Sie bitte die{" "}
          <a
            href="https://help.instagram.com/contact/505535973176353"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Instagram Hilfeseite
          </a>
          .
        </p>
      </div>
    </AuthCard>
  );
};

export default InstagramDataDeletion;