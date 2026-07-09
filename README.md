# QM-Assistent – Lebenshilfe Braunschweig

Ein interner, datenschutzkonformer Chatbot für Prozessmanagement, Qualitätsmanagement und Balanced Scorecard. Entwickelt für den On-Premise-Betrieb auf LSB-Servern.

## Funktionen

- **🤖 Chatbot**: Beantwortet Fragen zu QM, Prozessen, BSC, Pflege und Inklusion
- **🧠 Dual-Mode**: Wähle zwischen **lokalem NLP** (kein Server nötig) oder **Ollama-KI** (für echte KI-Antworten)
- **📋 Prozessmanagement**: PDCA-Zyklus, Prozesslandkarten, Verfahrensanweisungen
- **📊 Balanced Scorecard**: Vier Perspektiven mit Kennzahlen und Diagrammen
- **❓ FAQ-Bereich**: Durchsuchbare Wissensdatenbank mit Kategoriefiltern
- **⚙️ Admin-Panel**: Fragen/Antworten verwalten + **KI-Playground** für Ollama-Setup
- **🔒 On-Premise**: Läuft komplett ohne externe Cloud-Dienste – 100% datenschutzkonform

## Zwei Betriebsmodi

### Mode 1: Lokal (NLP) – Kein Server nötig
- Reine HTML/CSS/JS – läuft auf jedem Webserver / GitHub Pages
- Eingebaute "leichte KI" mit deutschem Stemming, Synonym-Erkennung, TF-IDF-Suche
- Ideal für schnelle Tests und statisches Hosting

### Mode 2: KI (Ollama) – Backend erforderlich
- Nutzt **Ollama** (z.B. `llama3.2:3b`, `mistral`) für echte KI-Antworten
- RAG (Retrieval-Augmented Generation): durchsucht die Wissensdatenbank und nutzt sie als Kontext
- Aufwändigere Infrastruktur (Backend-Server nötig)

## Setup

### Mode 1 – Statisch (für GitHub Pages / LSB-Webserver)
Einfach die Dateien auf einen Webserver kopieren und `index.html` öffnen.

```bash
python3 -m http.server 8080
# → http://localhost:8080
```

### Mode 2 – Mit Ollama-KI

**1. Voraussetzungen**
```bash
# Python 3.10+ & Ollama installieren
curl -fsSL https://ollama.com/install.sh | sh
ollama pull llama3.2:3b
```

**2. Backend starten**
```bash
# Linux/macOS
source venv/bin/activate
python backend/main.py

# Windows
call venv\Scripts\activate.bat
python backend/main.py
```

**3. Oder mit Docker**
```bash
docker compose -f backend/docker-compose.yml up
```

**4. Frontend öffnen**
```
http://localhost:8000
```

Der Chatbot erkennt automatisch, ob das Backend läuft, und schaltet in den KI-Modus.

## Admin-Panel

Den "⚙️ Admin"-Button unten rechts klicken.

**Standard-Passwort**: `lebenshilfe2024`

### Tab "Wissensdatenbank"
- Neue Fragen/Antworten hinzufügen
- Bestehende Einträge bearbeiten/löschen
- Daten als JSON exportieren
- Auf Standardwerte zurücksetzen

### Tab "KI-Playground"
- Status des Backends prüfen
- Zwischen lokalem NLP und Ollama-KI umschalten
- Backend-URL und Modell konfigurieren
- Verbindung testen
- Setup-Anleitung

## Technik

- **Frontend**: Reines HTML/CSS/JS – keine Frameworks
- **Backend** (optional): Python/FastAPI + Ollama
- **Lokale KI**: Eigenentwicklung mit deutschem Stemming, TF-IDF, Synonym-Matching
- **KI-Modus**: RAG (Kontext + Ollama LLM)
- **Speicher**: localStorage (Frontend) / JSON (Backend)
- **Barrierefrei**: ARIA-Labels, semantisches HTML, Tastatursteuerung
- **Responsive**: Desktop, Tablet, Mobile
