@echo off
echo ==============================
echo  QM-Assistent - Setup (Windows)
echo ==============================
echo.

REM Prüfe Python
where python >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo [FEHLER] Python 3 wird benoetigt.
    echo Lade es herunter von: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo [OK] Python gefunden: 
python --version

REM Venv erstellen
if not exist venv (
    echo [INFO] Erstelle virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

REM Abhaengigkeiten installieren
echo [INFO] Installiere Python-Abhaengigkeiten...
pip install -q --upgrade pip
pip install -q -r backend\requirements.txt

REM Pruefe optional Ollama
where ollama >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo [OK] Ollama gefunden
) else (
    echo.
    echo [HINWEIS] Ollama ist nicht installiert.
    echo   Installiere es fuer Mode 2 (KI) von: https://ollama.com
    echo.
)

echo.
echo ==============================
echo  Setup abgeschlossen!
echo ==============================
echo.
echo Starte das Backend:
echo   call venv\Scripts\activate.bat
echo   python backend\main.py
echo.
echo Dann im Browser oeffnen: http://localhost:8000
echo.
echo Fuer Mode 2 (Ollama):
echo   1. ollama pull llama3.2:3b
echo   2. python backend\main.py
echo.
echo Fuer Mode 1 (statisch, ohne Backend):
echo   Einfach index.html im Browser oeffnen
echo.
pause
