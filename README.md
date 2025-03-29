# IHK Prüfungs-Trainer

Ein interaktives Lern-App für die Vorbereitung auf die IHK-Prüfung für Fachinformatiker Anwendungsentwicklung.

## Features

- **Quiz-Modus**: Multiple-Choice-Fragen zur Selbstüberprüfung
- **Karteikarten-Modus**: Spaced-Repetition-Lernen mit Karteikarten
- **Statistik**: Umfassende Analyse deines Lernfortschritts
- **Erfolge**: Gamification-Elemente zur Motivation

## Technologien

- Frontend: React, TypeScript, TailwindCSS, ShadcnUI
- Backend: Express.js, TypeScript
- Datenbank: In-Memory-Speicher (erweiterbar für persistente Speicherung)

## Quickstart

```bash
# Abhängigkeiten installieren
npm install

# Entwicklungsserver starten
npm run dev
```

## Projektstruktur

- `/client` - Frontend-Code
  - `/src/components` - React-Komponenten
  - `/src/pages` - Hauptseiten der Anwendung
  - `/src/lib` - Utilities und gemeinsam genutzte Funktionen
- `/server` - Backend-Code
  - `routes.ts` - API-Endpunkte
  - `storage.ts` - Datenspeicherung
- `/shared` - Von Client und Server gemeinsam genutzte Typen und Schemas

## Roadmap

- Zeitliche Herausforderungen
- Detaillierte Analysen
- Spaced-Repetition-Algorithmus optimieren
- Community-Features