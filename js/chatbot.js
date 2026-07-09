const ChatbotUI = {
  conversationHistory: [],

  async init() {
    this.messagesEl = document.getElementById('chat-messages');
    this.inputEl = document.getElementById('chat-input');
    this.sendBtn = document.getElementById('chat-send');
    this.suggestionsEl = document.getElementById('chat-suggestions');
    this.modeIndicator = document.getElementById('chat-mode-indicator');
    this.typingTimer = null;

    this.sendBtn.addEventListener('click', () => this.sendMessage());
    this.inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.sendMessage();
    });

    // AppConfig initialisieren (Backend-Erkennung)
    await AppConfig.init();

    // Begrüßung je nach Modus
    const modeText = AppConfig.mode === 'ollama'
      ? `🧠 Hallo! Ich bin der QM-Assistent der Lebenshilfe Braunschweig.\n\n` +
        `Ich bin mit **Ollama (${AppConfig.ollamaModel})** verbunden und kann Ihre Fragen ` +
        `frei formulieren beantworten – basierend auf der internen Wissensdatenbank.\n\n` +
        `💡 **Tipp**: Stellen Sie einfach Ihre Frage zum Prozessmanagement, QM oder BSC!`
      : `🧠 Hallo! Ich bin der QM-Assistent der Lebenshilfe Braunschweig.\n\n` +
        `Im **lokalen Modus** durchsuche ich die interne Wissensdatenbank und finde die passenden Antworten.\n\n` +
        `💡 **Tipp**: Für KI-gestützte Antworten starten Sie das Backend (siehe README).`;

    this.addBotMessage(modeText);
    this.updateModeIndicator();
    this.showSuggestions();
  },

  updateModeIndicator() {
    if (!this.modeIndicator) return;
    if (AppConfig.mode === 'ollama') {
      this.modeIndicator.innerHTML = '🟢 KI (Ollama)';
      this.modeIndicator.style.color = '#00A336';
    } else {
      this.modeIndicator.innerHTML = '🟡 Lokal (NLP)';
      this.modeIndicator.style.color = '#EB6600';
    }
  },

  sendMessage() {
    const text = this.inputEl.value.trim();
    if (!text) return;
    this.addUserMessage(text);
    this.inputEl.value = '';
    this.showTyping();
    const delay = 500 + Math.random() * 600;
    setTimeout(() => {
      this.hideTyping();
      this.findAndShowAnswer(text);
    }, delay);
  },

  addUserMessage(text) {
    const el = document.createElement('div');
    el.className = 'chat-message user';
    el.innerHTML = `
      <div class="avatar" aria-hidden="true">👤</div>
      <div class="bubble">${this.escapeHtml(text)}</div>
    `;
    this.messagesEl.appendChild(el);
    this.scrollDown();
  },

  addBotMessage(text, extras) {
    const el = document.createElement('div');
    el.className = 'chat-message bot';
    let html = `
      <div class="avatar" aria-hidden="true">🤖</div>
      <div class="bubble">${this.formatMessage(text)}`;
    if (extras) {
      if (extras.sources && extras.sources.length) {
        html += `<div class="sources">📄 ${this.escapeHtml(extras.sources.join(', '))}</div>`;
      }
    }
    html += `</div>`;

    // Quick-Reply-Vorschläge direkt in die Chat-Nachricht einfügen
    if (extras && extras.suggestions && extras.suggestions.length) {
      html += `<div class="quick-replies">`;
      extras.suggestions.forEach(s => {
        const q = this.escapeHtml(s.question || s);
        html += `<button onclick="ChatbotUI.askQuestion('${q.replace(/'/g, "\\'")}')">${q}</button>`;
      });
      html += `</div>`;
    }

    el.innerHTML = html;
    this.messagesEl.appendChild(el);
    this.scrollDown();
  },

  formatMessage(text) {
    return text.split('\n').map(line => {
      line = this.escapeHtml(line);
      line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      return line;
    }).join('<br>');
  },

  showTyping() {
    const el = document.createElement('div');
    el.className = 'typing-indicator';
    el.id = 'typing-indicator';
    el.innerHTML = '<span></span><span></span><span></span>';
    this.messagesEl.appendChild(el);
    this.scrollDown();
  },

  hideTyping() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  },

  async findAndShowAnswer(query) {
    this.conversationHistory.push({ role: 'user', content: query });

    let answerText, sourcesList, followUpSuggestions;

    // Mode 2: Ollama-Backend versuchen
    if (AppConfig.mode === 'ollama' && AppConfig.backendUrl) {
      const backendResult = await AppConfig.sendToBackend(query, this.conversationHistory.slice(-6));
      if (backendResult && backendResult.answer) {
        this.conversationHistory.push({ role: 'assistant', content: backendResult.answer });
        answerText = `🤖 **KI-Antwort (${backendResult.model || AppConfig.ollamaModel})**\n\n${backendResult.answer}`;
        sourcesList = backendResult.sources || [];
        followUpSuggestions = this.getFollowUpQuestions(null, query);
        this.addBotMessage(answerText, { sources: sourcesList, suggestions: followUpSuggestions });
        this.showSuggestions(null, query);
        return;
      }
      console.warn('Backend nicht erreichbar, verwende lokale KI');
      AppConfig.setMode('local');
      this.updateModeIndicator();
    }

    // Mode 1: Lokale NLP-KI
    const result = AIEngine.findBestAnswer(query);

    if (result.answer && result.confidence >= 0.35) {
      const confidenceText = AIEngine.formatConfidence(result.confidence);
      answerText = `${confidenceText}\n\n${result.answer}`;

      if (result.related && result.related.length > 0) {
        answerText += '\n\n**Mehr dazu:**';
        result.related.slice(0, 2).forEach(r => {
          answerText += `\n• ${r.question}`;
        });
      }

      this.conversationHistory.push({ role: 'assistant', content: result.answer });
      followUpSuggestions = this.getFollowUpQuestions(result.category, query);
      this.addBotMessage(answerText, { sources: result.sources, suggestions: followUpSuggestions });
      this.showSuggestions(result.category, query);
    } else {
      const suggestions = result.suggestions || [];
      const fallback = AIEngine.generateFallback(query, suggestions);
      followUpSuggestions = this.getFallbackSuggestions(query);
      this.addBotMessage(
        `🤔 **Ich habe keine passende Antwort gefunden.**\n\n${fallback}`,
        { sources: [], suggestions: followUpSuggestions }
      );
      this.showSuggestions(null, query);
    }
  },

  getFollowUpQuestions(category, lastQuery) {
    let pool;
    if (category) {
      pool = KnowledgeBase.getByCategory(category);
    } else {
      pool = KnowledgeBase.getAll();
    }
    // Ähnlichste Fragen zur letzten Frage
    if (lastQuery) {
      const scored = AIEngine.search(lastQuery);
      if (scored.length > 0) {
        pool = scored;
      }
    }
    // Maximal 4, möglichst unterschiedliche Fragen
    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, 4);
    return shuffled.map(r => r.question || r);
  },

  getFallbackSuggestions(query) {
    // Bei fehlender Antwort: thematisch passende Fragen vorschlagen
    const tokens = AIEngine.tokenize(query);
    const all = KnowledgeBase.getAll();
    const scored = all.map(item => {
      const itemTokens = AIEngine.tokenize(item.question + ' ' + item.answer);
      const sim = AIEngine.bigramSimilarity(tokens, itemTokens);
      return { item, sim };
    });
    scored.sort((a, b) => b.sim - a.sim);
    return scored.slice(0, 4).map(r => r.item.question);
  },

  askQuestion(question) {
    this.inputEl.value = question;
    this.sendMessage();
  },

  showSuggestions(category, lastQuery) {
    let kb;
    if (category) {
      kb = KnowledgeBase.getByCategory(category);
    } else {
      kb = KnowledgeBase.getAll();
    }

    // KI-basierte Vorschläge: ähnlichste Fragen zur letzten Frage
    if (lastQuery) {
      const scored = AIEngine.search(lastQuery);
      if (scored.length > 0) {
        kb = scored.map(r => ({ question: r.question, category: r.category }));
      }
    }

    const shuffled = kb.sort(() => Math.random() - 0.5).slice(0, 6);
    this.suggestionsEl.innerHTML = shuffled.map(item =>
      `<button onclick="ChatbotUI.askQuestion('${this.escapeHtml(item.question)}')">${this.escapeHtml(item.question)}</button>`
    ).join('');
  },

  scrollDown() {
    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  },

  escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
};

const FAQ = {
  init() {
    this.setupFilters();
    this.render();
  },

  setupFilters() {
    const container = document.querySelector('.category-filters');
    if (!container) return;
    const categories = KnowledgeBase.getCategories();
    container.innerHTML = '<button class="active" data-category="Alle" role="tab">Alle</button>';
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.dataset.category = cat;
      btn.textContent = cat;
      btn.setAttribute('role', 'tab');
      container.appendChild(btn);
    });
    this.filters = container.querySelectorAll('button');
    this.filters.forEach(btn => {
      btn.addEventListener('click', () => {
        this.filters.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filter(btn.dataset.category);
      });
    });
  },

  filter(category) {
    const items = document.querySelectorAll('.faq-item');
    items.forEach(item => {
      const cat = item.dataset.category;
      item.style.display = (category === 'Alle' || cat === category) ? '' : 'none';
    });
  },

  render() {
    const list = document.querySelector('.faq-list');
    if (!list) return;
    const kb = KnowledgeBase.getAll().sort((a, b) => a.category.localeCompare(b.category));
    list.innerHTML = kb.map(item => `
      <div class="faq-item" data-category="${item.category}">
        <div class="faq-question" role="button" tabindex="0" aria-expanded="false">
          <span>${ChatbotUI.escapeHtml(item.question)}</span>
          <span class="arrow">▼</span>
        </div>
        <div class="faq-answer">${ChatbotUI.escapeHtml(item.answer)}</div>
      </div>
    `).join('');
    this.bindItems();
  },

  bindItems() {
    document.querySelectorAll('.faq-item').forEach(item => {
      const q = item.querySelector('.faq-question');
      q.addEventListener('click', () => {
        if (item.classList.contains('open')) {
          item.classList.remove('open');
          q.setAttribute('aria-expanded', 'false');
          item.querySelector('.faq-answer').style.maxHeight = '0';
        } else {
          document.querySelectorAll('.faq-item.open').forEach(i => {
            i.classList.remove('open');
            i.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
            i.querySelector('.faq-answer').style.maxHeight = '0';
          });
          item.classList.add('open');
          q.setAttribute('aria-expanded', 'true');
          const answer = item.querySelector('.faq-answer');
          answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
      q.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); q.click(); }
      });
    });
  }
};

const Admin = {
  init() {
    this.modal = document.getElementById('admin-modal');
    this.loginModal = document.getElementById('admin-login-modal');
    this.form = document.getElementById('admin-form');
    this.tableBody = document.getElementById('admin-table-body');
    this.isAuthenticated = false;
    this.editingId = null;
    this.activeTab = 'kb';

    document.getElementById('admin-open').addEventListener('click', () => this.openLogin());
    document.getElementById('admin-login-btn').addEventListener('click', () => this.login());
    document.getElementById('admin-login-close').addEventListener('click', () => this.closeLogin());
    document.getElementById('admin-login-abort').addEventListener('click', () => this.closeLogin());
    document.getElementById('modal-close').addEventListener('click', () => this.closeModal());
    document.getElementById('admin-cancel').addEventListener('click', () => this.closeModal());
    document.getElementById('admin-add-btn').addEventListener('click', () => this.openNew());
    document.getElementById('admin-export-btn').addEventListener('click', () => this.exportData());
    document.getElementById('admin-reset-btn').addEventListener('click', () => this.confirmReset());
    document.getElementById('admin-logout-btn').addEventListener('click', () => this.logout());

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.save();
    });

    document.getElementById('admin-password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') this.login();
    });

    document.getElementById('toggle-password').addEventListener('click', () => {
      const input = document.getElementById('admin-password');
      input.type = input.type === 'password' ? 'text' : 'password';
    });

    // Tab-Wechsel
    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    // Playground: Verbindung testen
    document.getElementById('playground-test-btn')?.addEventListener('click', () => this.testOllamaConnection());
    // Playground: Config speichern
    document.getElementById('playground-save-btn')?.addEventListener('click', () => this.savePlaygroundConfig());
  },

  switchTab(tab) {
    this.activeTab = tab;
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.toggle('active', c.id === `tab-${tab}`));
    if (tab === 'playground') this.refreshPlayground();
  },

  openLogin() {
    this.loginModal.classList.add('open');
    document.getElementById('admin-password').value = '';
    document.getElementById('admin-login-error').textContent = '';
    document.getElementById('admin-password').focus();
  },

  closeLogin() {
    this.loginModal.classList.remove('open');
  },

  login() {
    const pw = document.getElementById('admin-password').value;
    if (pw === KnowledgeBase.getAdminPassword()) {
      this.isAuthenticated = true;
      this.closeLogin();
      this.openModal();
    } else {
      document.getElementById('admin-login-error').textContent = '❌ Falsches Passwort. Bitte versuchen Sie es erneut.';
    }
  },

  logout() {
    this.isAuthenticated = false;
    this.closeModal();
    this.showToast('Erfolgreich abgemeldet.');
  },

  openModal() {
    if (!this.isAuthenticated) {
      this.openLogin();
      return;
    }
    this.renderTable();
    this.modal.classList.add('open');
  },

  closeModal() {
    this.modal.classList.remove('open');
    this.editingId = null;
    this.form.reset();
    document.getElementById('admin-form-title').textContent = 'Neue Frage hinzufügen';
    document.getElementById('admin-cancel').textContent = 'Abbrechen';
    const delBtn = this.form.querySelector('.btn-delete');
    if (delBtn) delBtn.remove();
  },

  openNew() {
    this.editingId = null;
    document.getElementById('admin-form-title').textContent = 'Neue Frage hinzufügen';
    document.getElementById('admin-question').value = '';
    document.getElementById('admin-answer').value = '';
    document.getElementById('admin-category').value = 'Allgemein';
    document.getElementById('admin-cancel').textContent = 'Abbrechen';
    const delBtn = this.form.querySelector('.btn-delete');
    if (delBtn) delBtn.remove();
    document.getElementById('admin-form-wrapper').scrollIntoView({ behavior: 'smooth' });
  },

  edit(id) {
    const kb = KnowledgeBase.getAll();
    const item = kb.find(i => i.id === id);
    if (!item) return;
    this.editingId = id;
    document.getElementById('admin-form-title').textContent = 'Frage bearbeiten';
    document.getElementById('admin-question').value = item.question;
    document.getElementById('admin-answer').value = item.answer;
    document.getElementById('admin-category').value = item.category;
    document.getElementById('admin-cancel').textContent = 'Abbrechen';
    let delBtn = this.form.querySelector('.btn-delete');
    if (!delBtn) {
      delBtn = document.createElement('button');
      delBtn.type = 'button';
      delBtn.className = 'btn-delete';
      delBtn.textContent = 'Löschen';
      delBtn.addEventListener('click', () => this.confirmDelete(id));
      const actions = this.form.querySelector('.form-actions');
      actions.insertBefore(delBtn, actions.firstChild);
    }
    document.getElementById('admin-form-wrapper').scrollIntoView({ behavior: 'smooth' });
  },

  save() {
    const question = document.getElementById('admin-question').value.trim();
    const answer = document.getElementById('admin-answer').value.trim();
    const category = document.getElementById('admin-category').value;
    if (!question || !answer) {
      this.showToast('Bitte füllen Sie alle Felder aus.', 'error');
      return;
    }
    if (this.editingId) {
      KnowledgeBase.update(this.editingId, { question, answer, category });
      this.showToast('Frage erfolgreich aktualisiert!');
    } else {
      KnowledgeBase.add({ question, answer, category });
      this.showToast('Neue Frage erfolgreich hinzugefügt!');
    }
    this.editingId = null;
    document.getElementById('admin-form-title').textContent = 'Neue Frage hinzufügen';
    this.form.reset();
    const delBtn = this.form.querySelector('.btn-delete');
    if (delBtn) delBtn.remove();
    this.renderTable();
    FAQ.render();
  },

  confirmDelete(id) {
    if (confirm('Möchten Sie diesen Eintrag wirklich löschen?')) {
      KnowledgeBase.remove(id);
      this.showToast('Eintrag gelöscht.');
      this.editingId = null;
      document.getElementById('admin-form-title').textContent = 'Neue Frage hinzufügen';
      this.form.reset();
      const delBtn = this.form.querySelector('.btn-delete');
      if (delBtn) delBtn.remove();
      this.renderTable();
      FAQ.render();
    }
  },

  confirmReset() {
    if (confirm('Möchten Sie die Wissensdatenbank wirklich auf die Standardeinträge zurücksetzen? Alle eigenen Änderungen gehen verloren!')) {
      KnowledgeBase.reset();
      this.renderTable();
      FAQ.render();
      this.showToast('Wissensdatenbank zurückgesetzt.');
    }
  },

  exportData() {
    const kb = KnowledgeBase.getAll();
    const blob = new Blob([JSON.stringify(kb, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lebenshilfe-wissensdatenbank-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showToast('Daten exportiert!');
  },

  renderTable() {
    const kb = KnowledgeBase.getAll().sort((a, b) => a.category.localeCompare(b.category));
    this.tableBody.innerHTML = kb.map(item => `
      <tr>
        <td>${ChatbotUI.escapeHtml(item.category)}</td>
        <td>${ChatbotUI.escapeHtml(item.question.length > 60 ? item.question.slice(0, 60) + '…' : item.question)}</td>
        <td>${ChatbotUI.escapeHtml(item.answer.length > 80 ? item.answer.slice(0, 80) + '…' : item.answer)}</td>
        <td class="actions">
          <button class="edit-btn" onclick="Admin.edit(${item.id})">✏️</button>
          <button class="del-btn" onclick="Admin.confirmDelete(${item.id})">🗑️</button>
        </td>
      </tr>
    `).join('');
  },

  showToast(message, type) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast show' + (type === 'error' ? ' error' : '');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3000);
  },

  // ---- Playground (Ollama-Konfiguration) ----

  async refreshPlayground() {
    const statusEl = document.getElementById('playground-status');
    const urlEl = document.getElementById('playground-url');
    const modelEl = document.getElementById('playground-model');

    if (AppConfig.mode === 'ollama') {
      statusEl.innerHTML = '<span style="color:#00A336;font-weight:bold;">✅ Verbunden</span>';
      statusEl.innerHTML += `<br><small>Backend: ${AppConfig.backendUrl}</small>`;
      urlEl.value = AppConfig.backendUrl;
      modelEl.value = AppConfig.ollamaModel;

      // Modelle laden
      await AppConfig.loadModels();
      const select = document.getElementById('playground-model-select');
      if (select && AppConfig.ollamaModels.length) {
        select.innerHTML = AppConfig.ollamaModels.map(m =>
          `<option value="${m}" ${m === AppConfig.ollamaModel ? 'selected' : ''}>${m}</option>`
        ).join('');
        select.style.display = '';
        modelEl.style.display = 'none';
      }
    } else {
      statusEl.innerHTML = '<span style="color:#EB6600;font-weight:bold;">🟡 Nicht verbunden</span>';
      statusEl.innerHTML += '<br><small>Backend nicht erreichbar. Starten Sie: <code>python backend/main.py</code></small>';
      urlEl.value = AppConfig.backendUrl || 'http://localhost:8000';
    }

    // Mode-Anzeige
    const modeRadios = document.querySelectorAll('input[name="ai-mode"]');
    modeRadios.forEach(r => r.checked = r.value === AppConfig.mode);
  },

  async testOllamaConnection() {
    const btn = document.getElementById('playground-test-btn');
    const resultEl = document.getElementById('playground-test-result');
    const url = document.getElementById('playground-url')?.value || 'http://localhost:8000';
    btn.disabled = true;
    btn.textContent = '⏳ Teste...';
    resultEl.innerHTML = '';

    const result = await AppConfig.testConnection(url);
    if (result.success) {
      resultEl.innerHTML = `<span style="color:#00A336;">✅ Erfolgreich! Backend: ${result.data.mode}, Modell: ${result.data.ollama_model}, ${result.data.kb_entries} Wissenseinträge</span>`;
      AppConfig.backendUrl = url;
      AppConfig.mode = 'ollama';
      AppConfig.ollamaConnected = true;
      AppConfig.persist();
      ChatbotUI.updateModeIndicator();
      await this.refreshPlayground();
    } else {
      resultEl.innerHTML = `<span style="color:#dc3545;">❌ Fehler: ${result.error}</span>`;
    }
    btn.disabled = false;
    btn.textContent = '🔄 Verbindung testen';
  },

  async savePlaygroundConfig() {
    const url = document.getElementById('playground-url')?.value;
    const modelInput = document.getElementById('playground-model')?.value;
    const modelSelect = document.getElementById('playground-model-select')?.value;

    const model = modelSelect || modelInput || AppConfig.ollamaModel;
    const updates = {};

    if (url && url !== AppConfig.backendUrl) updates.backendUrl = url;
    if (model && model !== AppConfig.ollamaModel) updates.ollamaModel = model;

    if (url && AppConfig.backendUrl) {
      const ok = await AppConfig.updateConfig({
        ollama_host: url,
        ollama_model: model,
      });
      if (ok) {
        AppConfig.backendUrl = url;
        AppConfig.ollamaModel = model;
        AppConfig.persist();
        this.showToast('✅ Konfiguration gespeichert!');
      } else {
        this.showToast('⚠️ Konfiguration lokal gespeichert (Backend nicht erreichbar)', 'error');
        AppConfig.backendUrl = url;
        AppConfig.ollamaModel = model;
        AppConfig.persist();
      }
    } else {
      AppConfig.backendUrl = url;
      AppConfig.ollamaModel = model;
      AppConfig.persist();
      this.showToast('✅ Konfiguration gespeichert!');
    }
    ChatbotUI.updateModeIndicator();
    await this.refreshPlayground();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  ChatbotUI.init();
  FAQ.init();
  Admin.init();
});
