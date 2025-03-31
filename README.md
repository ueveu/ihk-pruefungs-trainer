
# IHK Prüfungs-Trainer

Eine interaktive Lernanwendung zur Vorbereitung auf die IHK-Prüfung für Fachinformatiker Anwendungsentwicklung.

## Features

- **Quiz-System**: Multiple-Choice und offene Fragen mit KI-gestützter Bewertung
- **Karteikarten**: Spaced-Repetition-Lernsystem
- **Fortschrittsverfolgung**: Detaillierte Statistiken und Lernanalysen
- **KI-Integration**: Intelligente Lernhilfen und Feedback
- **Level-System**: Gamifiziertes Lernen mit Erfolgen

## Technologie-Stack

- Frontend: React, TypeScript, TailwindCSS, ShadcnUI
- Backend: Express.js, TypeScript
- KI: Google Gemini API
- Datenbank: In-Memory (erweiterbar)

## Installation & Start

```bash
# Installation der Abhängigkeiten
npm install

# Entwicklungsserver starten
npm run dev
```

## Projektstruktur

```
├── client/          # Frontend-Code
├── server/          # Backend-API
├── shared/          # Gemeinsame Typen/Schemas
└── attached_assets/ # Prüfungsbeispiele
```

## Nächste Entwicklungsschritte

1. Persistente Datenspeicherung implementieren
2. Benutzerauthentifizierung hinzufügen
3. Prüfungssimulator erweitern
4. Mobile Optimierung verbessern
5. Offline-Modus entwickeln

## Lizenz

MIT
