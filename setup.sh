#!/usr/bin/env bash
set -e

echo "=============================="
echo " QM-Assistent – Setup (Linux/macOS)"
echo "=============================="
echo ""

# Prüfe Python
if ! command -v python3 &>/dev/null; then
  echo "❌ Python 3 wird benötigt. Installiere es via:"
  echo "   Linux:  sudo apt install python3 python3-pip python3-venv"
  echo "   macOS:  brew install python3"
  exit 1
fi

echo "✅ Python 3 gefunden: $(python3 --version)"

# Venv erstellen
if [ ! -d "venv" ]; then
  echo "📦 Erstelle virtual environment..."
  python3 -m venv venv
fi

source venv/bin/activate

# Abhängigkeiten installieren
echo "📦 Installiere Python-Abhängigkeiten..."
pip install -q --upgrade pip
pip install -q -r backend/requirements.txt

# Prüfe optional Ollama
if command -v ollama &>/dev/null; then
  echo "✅ Ollama gefunden: $(ollama --version 2>/dev/null || echo 'installiert')"
else
  echo ""
  echo "⚠️  Ollama ist nicht installiert."
  echo "   Installiere es für Mode 2 (KI):"
  echo "   Linux: curl -fsSL https://ollama.com/install.sh | sh"
  echo "   macOS: brew install ollama"
  echo ""
fi

echo ""
echo "=============================="
echo " ✅ Setup abgeschlossen!"
echo "=============================="
echo ""
echo "Starte das Backend:"
echo "  source venv/bin/activate"
echo "  python3 backend/main.py"
echo ""
echo "Dann im Browser öffnen:"
echo "  http://localhost:8000"
echo ""
echo "Für Mode 2 (Ollama):"
echo "  1. ollama pull llama3.2:3b"
echo "  2. python3 backend/main.py"
echo ""
echo "Für Mode 1 (statisch, ohne Backend):"
echo "  Einfach index.html im Browser öffnen"
echo "  oder: python3 -m http.server 8080"
