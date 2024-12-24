import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function InstagramDataDeletion() {
  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Instagram Datenlöschung</CardTitle>
        </CardHeader>
        <CardContent className="prose max-w-none">
          <h2>Datenlöschungsanfrage für Instagram-Daten</h2>
          
          <p>
            Wenn Sie eine Löschung Ihrer Instagram-bezogenen Daten aus unserer Anwendung wünschen,
            werden folgende Schritte ausgeführt:
          </p>

          <ol>
            <li>Löschung aller gespeicherten Instagram-Profilinformationen</li>
            <li>Entfernung aller Verbindungen zu Ihrem Instagram-Konto</li>
            <li>Löschung aller zwischengespeicherten Nachrichten und Interaktionen</li>
            <li>Widerruf aller erteilten Berechtigungen</li>
          </ol>

          <p>
            Die Löschung wird innerhalb von 24 Stunden durchgeführt. Sie erhalten eine Bestätigung,
            sobald der Prozess abgeschlossen ist.
          </p>

          <h3>Automatische Verarbeitung</h3>
          <p>
            Diese URL dient der automatischen Verarbeitung von Datenlöschungsanfragen durch die
            Instagram-API. Wenn Sie diese Seite direkt aufrufen, werden keine Aktionen ausgeführt.
            Bitte nutzen Sie stattdessen die Löschfunktion in den Einstellungen der App.
          </p>

          <h3>Kontakt</h3>
          <p>
            Bei Fragen zur Datenlöschung oder wenn Sie eine manuelle Löschung wünschen,
            kontaktieren Sie uns bitte direkt.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}