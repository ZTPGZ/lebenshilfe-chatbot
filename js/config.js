/*
 * Konfiguration & Backend-Erkennung für Dual-Mode
 * Mode 1: Lokal (Browser-NLP) – kein Server nötig
 * Mode 2: Ollama (KI via Backend) – Backend muss laufen
 */

const AppConfig = {
  mode: 'local',       // 'local' | 'ollama'
  backendUrl: '',
  ollamaModel: 'llama3.2:3b',
  ollamaConnected: false,
  ollamaModels: [],
  systemPrompt: '',
  _listeners: [],

  STORAGE_KEY: 'lh_app_config',

  async init() {
    // Gespeicherte Konfig laden
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        const cfg = JSON.parse(stored);
        Object.assign(this, cfg);
      } catch (e) {}
    }

    // Prüfen ob Backend erreichbar ist
    await this.detectBackend();

    // Config-Änderungen speichern
    window.addEventListener('beforeunload', () => this.persist());
  },

  async detectBackend() {
    // Versuche lokales Backend zu finden (verschiedene Ports)
    const candidates = [
      window.location.origin,
      'http://localhost:8000',
      'http://127.0.0.1:8000',
    ];

    // Wenn eigenes Backend-URL konfiguriert
    if (this.backendUrl && !candidates.includes(this.backendUrl)) {
      candidates.unshift(this.backendUrl);
    }

    for (const url of candidates) {
      try {
        const r = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(2000) });
        if (r.ok) {
          const data = await r.json();
          this.backendUrl = url;
          this.mode = 'ollama';
          this.ollamaConnected = true;
          this.ollamaModel = data.ollama_model || this.ollamaModel;
          console.log(`✅ Backend gefunden: ${url} (Modell: ${this.ollamaModel})`);

          // Verfügbare Modelle laden
          this.loadModels();
          this.notify();
          return true;
        }
      } catch (e) {}
    }

    // Kein Backend gefunden
    this.mode = 'local';
    this.ollamaConnected = false;
    this.backendUrl = '';
    console.log('ℹ️ Kein Backend gefunden – laufe im lokalen Modus (NLP)');
    this.notify();
    return false;
  },

  async loadModels() {
    if (!this.backendUrl) return;
    try {
      const r = await fetch(`${this.backendUrl}/api/models`, { signal: AbortSignal.timeout(3000) });
      if (r.ok) {
        const data = await r.json();
        this.ollamaModels = data.models || [];
      }
    } catch (e) {}
  },

  async testConnection(url) {
    try {
      const r = await fetch(`${url}/api/health`, { signal: AbortSignal.timeout(3000) });
      if (r.ok) {
        const data = await r.json();
        return { success: true, data };
      }
      return { success: false, error: `HTTP ${r.status}` };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  async sendToBackend(question, history) {
    if (!this.backendUrl) return null;
    try {
      const r = await fetch(`${this.backendUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history: history || [] }),
        signal: AbortSignal.timeout(30000),
      });
      if (r.ok) return await r.json();
      return null;
    } catch (e) {
      console.warn('Backend nicht erreichbar, fallback zu lokal:', e.message);
      return null;
    }
  },

  async updateConfig(updates) {
    if (!this.backendUrl) return false;
    try {
      const r = await fetch(`${this.backendUrl}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (r.ok) {
        Object.assign(this, updates);
        this.persist();
        this.notify();
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  },

  setMode(mode) {
    this.mode = mode;
    this.persist();
    this.notify();
  },

  onChange(fn) {
    this._listeners.push(fn);
  },

  notify() {
    this._listeners.forEach(fn => fn(this));
  },

  persist() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify({
      mode: this.mode,
      backendUrl: this.backendUrl,
      ollamaModel: this.ollamaModel,
      ollamaConnected: this.ollamaConnected,
    }));
  },
};
