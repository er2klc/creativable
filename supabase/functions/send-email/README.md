
# SMTP-basierte E-Mail-Versand Edge Function

Diese Edge Function sendet E-Mails über einen SMTP-Server basierend auf den Einstellungen des Benutzers.

## Benötigte Umgebungsvariablen:
- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY

## Einrichtung:
1. Edge Function deployen
2. Umgebungsvariablen in den Supabase-Einstellungen setzen
3. SMTP-Einstellungen in der Benutzeroberfläche konfigurieren

## Verwendung:
Senden Sie eine POST-Anfrage an den Funktionsendpunkt mit:
```json
{
  "to": "empfaenger@beispiel.de",
  "subject": "E-Mail-Betreff",
  "html": "<p>E-Mail-Inhalt</p>",
  "lead_id": "optionale-lead-uuid",
  "attachments": [
    {
      "filename": "datei.pdf",
      "content": "base64-codierter-inhalt",
      "contentType": "application/pdf"
    }
  ]
}
```

## Fehlerbehandlung:
Die Funktion gibt einen detaillierten Fehlercode zurück, wenn während des Versands ein Problem auftritt.

## SMTP-Einstellungen:
Die Funktion verwendet die in der Datenbank gespeicherten SMTP-Einstellungen des Benutzers.
