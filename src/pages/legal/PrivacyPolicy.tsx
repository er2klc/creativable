import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Datenschutzerklärung</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <h2>1. Datenschutz auf einen Blick</h2>
          <h3>Allgemeine Hinweise</h3>
          <p>
            Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
          </p>

          <h3>Datenerfassung auf dieser Website</h3>
          <p>
            Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
          </p>

          <h2>2. Instagram Integration</h2>
          <p>
            Wenn Sie die Instagram-Integration nutzen, werden folgende Daten verarbeitet:
          </p>
          <ul>
            <li>Instagram Profildaten</li>
            <li>Nachrichten und Interaktionen</li>
            <li>Kontaktinformationen</li>
          </ul>
          <p>
            Diese Daten werden ausschließlich für die Funktionalität der App verwendet und nicht an Dritte weitergegeben.
          </p>

          <h2>3. Datenlöschung</h2>
          <p>
            Sie haben jederzeit das Recht, Ihre bei uns gespeicherten Daten löschen zu lassen. Dazu können Sie:
          </p>
          <ul>
            <li>Die Löschfunktion in den Einstellungen verwenden</li>
            <li>Uns direkt kontaktieren</li>
            <li>Den automatischen Datenlöschungsprozess nutzen</li>
          </ul>

          <h2>4. Ihre Rechte</h2>
          <p>
            Sie haben jederzeit das Recht:
          </p>
          <ul>
            <li>Auskunft über Ihre gespeicherten Daten zu erhalten</li>
            <li>Diese berichtigen oder löschen zu lassen</li>
            <li>Die Verarbeitung einzuschränken</li>
            <li>Der Verarbeitung zu widersprechen</li>
            <li>Die Datenübertragbarkeit zu verlangen</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}