"""
QM-Assistent Backend – FastAPI + Ollama
========================================
Ermöglicht KI-gestützte Antworten via Ollama (Mode 2).
Läuft als Ergänzung zum statischen Frontend.
Betriebssystemunabhängig (Linux, Windows, macOS).
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
import json
import os
import re
import math
import logging
from pathlib import Path
from typing import Optional

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("qm-backend")

BACKEND_DIR = Path(__file__).parent
ROOT_DIR = BACKEND_DIR.parent
DEFAULT_KB_PATH = ROOT_DIR / "data" / "knowledge-base.json"
CONFIG_PATH = BACKEND_DIR / "config.json"

DEFAULT_CONFIG = {
    "ollama_host": "http://localhost:11434",
    "ollama_model": "llama3.2:3b",
    "system_prompt": (
        "Du bist ein hilfreicher, freundlicher QM-Assistent für die "
        "Lebenshilfe Braunschweig. Du antwortest stets auf Deutsch, "
        "verwendest eine wertschätzende und inklusive Sprache, die für "
        "den Pflegebereich und die Arbeit mit Menschen mit Beeinträchtigung "
        "geeignet ist. Antworte kurz, präzise und verständlich. "
        "Nutze den bereitgestellten Kontext, um Fragen zu beantworten. "
        "Wenn der Kontext keine Antwort enthält, sage es ehrlich."
    ),
    "temperature": 0.7,
    "max_tokens": 512,
}

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------

def load_config():
    if CONFIG_PATH.exists():
        with open(CONFIG_PATH) as f:
            cfg = json.load(f)
            for k, v in DEFAULT_CONFIG.items():
                cfg.setdefault(k, v)
            return cfg
    save_config(DEFAULT_CONFIG)
    return dict(DEFAULT_CONFIG)


def save_config(cfg):
    with open(CONFIG_PATH, "w") as f:
        json.dump(cfg, f, indent=2, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Knowledge Base + RAG Search
# ---------------------------------------------------------------------------

class SimpleAI:
    """Leichte KI für RAG: vereinfachtes Stemming + TF-IDF-Suche"""

    STOPWORDS = set("""
        der die das den dem des ein eine einen einem eines einer und oder aber
        auf für mit von an aus bei bis durch gegen in nach neben um unter vor
        zwischen über zu zum zur nicht auch noch schon immer wie so dass wenn
        als nachdem weil denn da dann dort hier hin her alle beide kein keine
        keinen keinem mein dein sein ihr unser euer ihre meine deine seine unsere
        eure diese dieser dieses diesem diesen jene jener jenes solche solcher
        solches einige einiger einiges etwas nichts jemand niemand jeder jedes
        jedem jeden wer was welche welcher welches wem wen wessen wann warum
        wieso weshalb wieviel wo wohin woher sich mir mich dir dich uns euch
        ihnen sie es ihm ihn bin bist ist sind seid war warst waren wart gewesen
        werde wirst wird werden werdet wurde wurden worden habe hast hat haben
        habt hatte hatten gehabt sein geworden würde würden würdet kann kannst
        können könnt konnte konnten konntest muss musst müssen müsst musste
        mussten soll sollst sollen sollt sollte sollten will willst wollen wollt
        wollte wollten darf darfst dürfen dürft durfte durften mag magst mögen
        mögt mochte mochten möchte möchtest möchtet bin bitte danke vielleicht
        eigentlich einfach mal ja nein okay ok sehr etwa ungefähr fast kaum erst
        schon bereits gerade eben sogar allerdings jedoch trotzdem zwar nämlich
        übrigens außerdem sonst deshalb darum deswegen trotz wegen während
        innerhalb außerhalb oberhalb unterhalb entlang gegenüber ab außer ohne
        seit bis
    """.split())

    STEM_SUFFIXES = [
        'lichkeit', 'lerinnen', 'erinnen', 'igkeiten', 'erischen',
        'nisation', 'ination', 'graphie', 'logie',
        'lierung', 'ierung', 'heiten',
        'innen', 'isch', 'ische', 'ischen', 'ischer',
        'liche', 'licher', 'liches', 'lich',
        'ungen', 'ung', 'ling', 'nisse', 'niss',
        'tern', 'sten', 'stel', 'lein', 'chen',
        'ten', 'tet', 'tes', 'te', 'em', 'en', 'el', 'er', 'es',
        'e', 'n', 't',
    ]

    SYNONYMS = {
        'prozess': 'prozessmanagement', 'ablauf': 'prozess', 'vorgang': 'prozess',
        'verfahren': 'prozess', 'qualität': 'qualitätsmanagement', 'qm': 'qualitätsmanagement',
        'qualitaet': 'qualitätsmanagement', 'audit': 'internes audit', 'prüfung': 'audit',
        'bsc': 'balanced scorecard', 'kennzahl': 'kpi', 'kennzahlen': 'kpi', 'kpi': 'kpi',
        'dokument': 'dokument', 'dokumentation': 'dokument', 'pflege': 'pflege',
        'betreuen': 'betreuung', 'begleitung': 'betreuung',
        'inklusion': 'inklusion', 'teilhabe': 'inklusion',
        'selbstbestimmung': 'selbstbestimmung', 'beschwerde': 'beschwerdemanagement',
        'lebenshilfe': 'lebenshilfe', 'braunschweig': 'lebenshilfe',
        'mitarbeiter': 'mitarbeiter', 'zuständig': 'zuständigkeit',
    }

    def __init__(self, kb_path=None):
        path = kb_path or DEFAULT_KB_PATH
        if path.exists():
            with open(path) as f:
                self.kb = json.load(f)
        else:
            self.kb = []
        log.info(f"Knowledge Base geladen: {len(self.kb)} Einträge")

    def _normalize(self, s):
        s = s.lower().replace('ß', 'ss').replace('ä', 'ae').replace('ö', 'oe').replace('ü', 'ue')
        return re.sub(r'[^a-z0-9\s]', '', s)

    def _stem(self, word):
        w = self._normalize(word)
        if len(w) < 4:
            return w
        for suf in self.STEM_SUFFIXES:
            if w.endswith(suf) and len(w) - len(suf) >= 3:
                w = w[:-len(suf)]
                break
        w = re.sub(r'([bcdfghklmnpqrstvwxyz])\1', r'\1', w)
        return w

    def _tokenize(self, text):
        if not text:
            return []
        tokens = re.split(r'\s+', self._normalize(text))
        result = []
        for t in tokens:
            if len(t) > 1 and t not in self.STOPWORDS:
                t = self.SYNONYMS.get(t, t)
                result.append(self._stem(t))
        return result

    def search(self, query, top_k=5):
        qt = self._tokenize(query)
        if not qt:
            return []

        all_tokens = [self._tokenize(item['question'] + ' ' + item['answer']) for item in self.kb]

        # TF-IDF
        n = len(all_tokens)
        df = {}
        for doc in all_tokens:
            for t in set(doc):
                df[t] = df.get(t, 0) + 1

        scores = []
        for i, (item, doc) in enumerate(zip(self.kb, all_tokens)):
            tfidf = 0
            for qtok in qt:
                if qtok in doc:
                    tf = doc.count(qtok) / max(len(doc), 1)
                    idf = math.log((n + 1) / (df.get(qtok, 1) + 1)) + 1
                    tfidf += tf * idf

            # Jaccard
            s1, s2 = set(qt), set(doc)
            jaccard = len(s1 & s2) / max(len(s1 | s2), 1) if (s1 | s2) else 0

            # Exact match bonus
            q_lower = query.lower()
            q_match = item['question'].lower()
            exact = 2.0 if q_match == q_lower else (1.0 if q_lower in q_match or q_match in q_lower else 0)

            score = tfidf * 1.5 + jaccard * 2.0 + exact * 3.0
            scores.append((score, item))

        scores.sort(key=lambda x: -x[0])
        return [item for score, item in scores[:top_k] if score > 0.1]

    def build_context(self, query, max_chars=2000):
        results = self.search(query, top_k=4)
        if not results:
            return ""
        parts = []
        for r in results:
            parts.append(f"Kategorie: {r['category']}\nFrage: {r['question']}\nAntwort: {r['answer']}")
        ctx = "\n\n---\n\n".join(parts)
        if len(ctx) > max_chars:
            ctx = ctx[:max_chars] + "\n... (gekürzt)"
        return ctx


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = FastAPI(
    title="QM-Assistent Backend",
    description="Backend für KI-gestützte Antworten via Ollama (Mode 2)",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai = SimpleAI()
config = load_config()


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------

class ChatRequest(BaseModel):
    question: str
    history: Optional[list] = []


class ConfigUpdate(BaseModel):
    ollama_host: Optional[str] = None
    ollama_model: Optional[str] = None
    system_prompt: Optional[str] = None
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
async def health():
    """Gesundheits-Check des Backends"""
    return {
        "status": "ok",
        "mode": "ollama",
        "ollama_configured": bool(config.get("ollama_host")),
        "ollama_model": config.get("ollama_model"),
        "kb_entries": len(ai.kb),
    }


@app.get("/api/config")
async def get_config():
    """Aktuelle Konfiguration abrufen"""
    safe = {k: v for k, v in config.items() if k != "system_prompt"}
    safe["system_prompt_prefix"] = config.get("system_prompt", "")[:80] + "..."
    return safe


@app.post("/api/config")
async def update_config(update: ConfigUpdate):
    """Konfiguration aktualisieren"""
    global config
    for k, v in update.model_dump(exclude_none=True).items():
        config[k] = v
    save_config(config)
    log.info(f"Config updated: {update.model_dump(exclude_none=True)}")
    return {"status": "ok"}


@app.get("/api/models")
async def list_models():
    """Verfügbare Ollama-Modelle abrufen"""
    try:
        import httpx
        host = config.get("ollama_host", "http://localhost:11434")
        r = httpx.get(f"{host}/api/tags", timeout=5)
        if r.status_code == 200:
            models = [m["name"] for m in r.json().get("models", [])]
            return {"models": models}
        return {"models": [], "error": f"Ollama antwortet mit Status {r.status_code}"}
    except Exception as e:
        log.warning(f"Ollama model list failed: {e}")
        return {"models": [], "error": str(e)}


@app.post("/api/test")
async def test_connection():
    """Ollama-Verbindung testen"""
    try:
        import httpx
        host = config.get("ollama_host", "http://localhost:11434")
        r = httpx.get(f"{host}/api/tags", timeout=5)
        if r.status_code != 200:
            return {"success": False, "error": f"HTTP {r.status_code}"}
        return {"success": True, "message": f"Verbindung zu Ollama unter {host} erfolgreich"}
    except Exception as e:
        return {"success": False, "error": str(e)}


@app.post("/api/chat")
async def chat(request: ChatRequest):
    """Chat-Anfrage mit RAG + Ollama"""
    question = request.question.strip()
    if not question:
        raise HTTPException(400, "Frage darf nicht leer sein")

    # 1. Relevante Kontexte aus der Wissensdatenbank holen
    context = ai.build_context(question)
    log.info(f"RAG context ({len(context)} chars) for: {question[:60]}...")

    # 2. Prompt bauen
    sys_prompt = config.get("system_prompt", DEFAULT_CONFIG["system_prompt"])
    if context:
        full_prompt = (
            f"{sys_prompt}\n\n"
            f"Hier sind relevante Informationen aus der Wissensdatenbank:\n{context}\n\n"
            f"Frage: {question}\n\n"
            f"Antworte verständlich und präzise auf Deutsch."
        )
    else:
        full_prompt = (
            f"{sys_prompt}\n\n"
            f"Frage: {question}\n\n"
            f"Falls du die Antwort nicht weißt, sage es ehrlich."
        )

    # 3. Ollama aufrufen
    try:
        import ollama as ollama_client
        host = config.get("ollama_host", "http://localhost:11434")
        model = config.get("ollama_model", "llama3.2:3b")

        ollama_client.Client(host=host)

        response = ollama_client.chat(
            model=model,
            messages=[{"role": "user", "content": full_prompt}],
            options={
                "temperature": config.get("temperature", 0.7),
                "num_predict": config.get("max_tokens", 512),
            },
        )

        answer = response.get("message", {}).get("content", "").strip()
        if not answer:
            answer = "Entschuldigung, ich konnte keine Antwort generieren."

        # Quellen aus dem RAG-Kontext extrahieren
        sources = []
        if context:
            for entry in ai.search(question, top_k=3):
                cat = entry.get("category", "")
                if cat and cat not in sources:
                    sources.append(cat)

        log.info(f"Ollama response ({len(answer)} chars)")
        return {
            "answer": answer,
            "sources": sources,
            "model": model,
            "used_rag": bool(context),
        }

    except Exception as e:
        log.error(f"Ollama call failed: {e}")
        raise HTTPException(503, f"Ollama-Fehler: {str(e)}")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", "8000"))
    log.info(f"Starte QM-Assistent Backend auf Port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
