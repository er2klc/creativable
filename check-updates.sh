#!/bin/bash

# Farbe für die Ausgabe
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Aktuelles Verzeichnis speichern
CURRENT_DIR=$(pwd)

# Zum Projektverzeichnis wechseln
cd /Users/kreativewebdesign/Library/CloudStorage/Dropbox/Creativable/creativable

# Prüfen ob neue Änderungen verfügbar sind
if git fetch origin main | cat; then
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})
    
    if [ $LOCAL = $REMOTE ]; then
        echo -e "${GREEN}✓ Ihr lokales Repository ist auf dem neuesten Stand${NC}"
    else
        echo -e "${YELLOW}! Neue Änderungen verfügbar! Führen Sie 'git pull' aus, um zu aktualisieren${NC}"
        echo -e "${YELLOW}  Anzahl der Commits hinter dem Remote: $(git rev-list --count HEAD..origin/main)${NC}"
    fi
else
    echo -e "${YELLOW}! Fehler beim Abrufen der Änderungen${NC}"
fi

# Zurück zum ursprünglichen Verzeichnis
cd "$CURRENT_DIR" 