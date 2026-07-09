/*
 * Leichte KI-Engine für den QM-Assistenten
 * Vollständig offline, keine externen APIs
 * Features: Deutsches Stemming, TF-IDF Ähnlichkeit, Kontext, Synonyme
 */

const AIEngine = {
  // Gesprächskontext (letzte 3 Austausche)
  context: [],

  // Deutsche Stoppwörter
  stopwords: new Set([
    'der', 'die', 'das', 'den', 'dem', 'des', 'ein', 'eine', 'einen', 'einem',
    'eines', 'einer', 'und', 'oder', 'aber', 'auf', 'für', 'mit', 'von', 'an',
    'aus', 'bei', 'bis', 'durch', 'gegen', 'in', 'nach', 'neben', 'um', 'unter',
    'vor', 'zwischen', 'über', 'zu', 'zum', 'zur', 'nicht', 'auch', 'noch',
    'schon', 'immer', 'wie', 'so', 'dass', 'wenn', 'als', 'nachdem', 'weil',
    'denn', 'da', 'dann', 'dort', 'hier', 'hin', 'her', 'alle', 'beide',
    'kein', 'keine', 'keinen', 'keinem', 'mein', 'dein', 'sein', 'ihr', 'unser',
    'euer', 'ihr', 'ihre', 'meine', 'deine', 'seine', 'unsere', 'eure',
    'diese', 'dieser', 'dieses', 'diesem', 'diesen', 'jene', 'jener', 'jenes',
    'solche', 'solcher', 'solches', 'man', 'manche', 'mancher', 'einige',
    'einiger', 'einiges', 'etwas', 'nichts', 'jemand', 'niemand', 'jeder',
    'jedes', 'jedem', 'jeden', 'wer', 'was', 'welche', 'welcher', 'welches',
    'wem', 'wen', 'wessen', 'wann', 'warum', 'wieso', 'weshalb', 'wieviel',
    'wie viele', 'wo', 'wohin', 'woher', 'wobei', 'woran', 'worauf', 'wodurch',
    'wovon', 'worum', 'worüber', 'sich', 'mir', 'mich', 'dir', 'dich',
    'sich', 'uns', 'euch', 'ihnen', 'sie', 'es', 'ihm', 'ihn',
    'bin', 'bist', 'ist', 'sind', 'seid', 'war', 'warst', 'waren', 'wart',
    'gewesen', 'werde', 'wirst', 'wird', 'werden', 'werdet', 'wurde', 'wurden',
    'worden', 'habe', 'hast', 'hat', 'haben', 'habt', 'hatte', 'hatten',
    'gehabt', 'sein', 'geworden', 'würde', 'würden', 'würdet', 'kann',
    'kannst', 'können', 'könnt', 'konnte', 'konnten', 'konntest', 'muss',
    'musst', 'müssen', 'müsst', 'musste', 'mussten', 'soll', 'sollst',
    'sollen', 'sollt', 'sollte', 'sollten', 'will', 'willst', 'wollen',
    'wollt', 'wollte', 'wollten', 'darf', 'darfst', 'dürfen', 'dürft',
    'durfte', 'durften', 'mag', 'magst', 'mögen', 'mögt', 'mochte', 'mochten',
    'möchte', 'möchtest', 'möchtet', 'bin', 'bitte', 'danke', 'vielleicht',
    'eigentlich', 'einfach', 'mal', 'ja', 'nein', 'okay', 'ok', 'sehr',
    'etwa', 'ungefähr', 'fast', 'kaum', 'erst', 'schon', 'bereits',
    'gerade', 'eben', 'sogar', 'allerdings', 'jedoch', 'trotzdem',
    'zwar', 'nämlich', 'übrigens', 'außerdem', 'sonst', 'deshalb',
    'darum', 'deswegen', 'trotz', 'wegen', 'während', 'innerhalb',
    'außerhalb', 'oberhalb', 'unterhalb', 'entlang', 'gegenüber',
    'ab', 'außer', 'ohne', 'seit', 'bis', 'entlang'
  ]),

  // Deutsche Synonym-Karte
  synonyms: {
    // Prozessmanagement
    prozess: 'prozessmanagement',
    ablauf: 'prozess',
    vorgang: 'prozess',
    verfahren: 'prozess',
    arbeitsablauf: 'prozess',
    prozessschritt: 'prozess',
    prozesskarte: 'prozesslandkarte',
    ablaufplan: 'prozesslandkarte',

    // Qualitätsmanagement
    qualität: 'qualitätsmanagement',
    qm: 'qualitätsmanagement',
    qualitaet: 'qualitätsmanagement',
    qualitätssicherung: 'qualitätsmanagement',
    qs: 'qualitätsmanagement',
    qualitaetsmanagement: 'qualitätsmanagement',
    audit: 'internes audit',
    überprüfung: 'audit',
    prüfung: 'audit',
    zertifizierung: 'zertifizierung',
    zertifikat: 'zertifizierung',
    nichtkonformität: 'nichtkonformität',
    fehler: 'nichtkonformität',
    mangel: 'nichtkonformität',
    verbesserung: 'pdca',
    kontinuierliche: 'pdca',
    pdca: 'pdca',
    kreislauf: 'pdca',
    zyklus: 'pdca',

    // Balanced Scorecard
    bsc: 'balanced scorecard',
    kennzahl: 'kpi',
    kennzahlen: 'kpi',
    kpi: 'kpi',
    steuerung: 'balanced scorecard',
    strategie: 'balanced scorecard',
    strategisch: 'balanced scorecard',
    ziel: 'ziel',     // used in BSC context
    perspektive: 'perspektive',
    finanzperspektive: 'finanzperspektive',
    klientenperspektive: 'klientenperspektive',
    kundenperspektive: 'klientenperspektive',
    prozessperspektive: 'prozessperspektive',
    entwicklungsperspektive: 'lernen',

    // Dokumentenmanagement
    dokument: 'dokument',
    dokumentation: 'dokument',
    dokumentenlenkung: 'dokumentenlenkung',
    formular: 'dokument',
    vorlage: 'dokument',
    verfahrensanweisung: 'verfahrensanweisung',
    va: 'verfahrensanweisung',
    handbuch: 'dokument',
    qmhandbuch: 'dokument',

    // Pflege
    pflege: 'pflege',
    pflegeprozess: 'pflege',
    betreuen: 'betreuung',
    betreuer: 'betreuung',
    begleitung: 'betreuung',
    unterstützung: 'betreuung',
    hilfe: 'betreuung',
    pflegen: 'pflege',
    körperpflege: 'pflege',
    behandlungspflege: 'pflege',
    grundpflege: 'pflege',
    validation: 'validation',
    demenz: 'validation',
    desorientiert: 'validation',
    biografiearbeit: 'biografiearbeit',

    // Inklusion
    inklusion: 'inklusion',
    teilhabe: 'inklusion',
    barrierefrei: 'barrierefreiheit',
    barriere: 'barrierefreiheit',
    zugänglichkeit: 'barrierefreiheit',
    selbstbestimmung: 'selbstbestimmung',
    selbstbestimmt: 'selbstbestimmung',
    autonomie: 'selbstbestimmung',
    leichte sprache: 'leichte sprache',
    verständlich: 'leichte sprache',

    // Beschwerdemanagement
    beschwerde: 'beschwerdemanagement',
    reklamation: 'beschwerdemanagement',
    kritik: 'beschwerdemanagement',
    feedback: 'beschwerdemanagement',
    verbesserungsvorschlag: 'beschwerdemanagement',

    // Allgemein
    lebenshilfe: 'lebenshilfe',
    braunschweig: 'lebenshilfe',
    organisation: 'lebenshilfe',
    einrichtung: 'lebenshilfe',
    mitarbeiter: 'mitarbeiter',
    angestellter: 'mitarbeiter',
    team: 'mitarbeiter',
    ansprechpartner: 'mitarbeiter',
    zuständig: 'zuständigkeit',
    verantwortlich: 'zuständigkeit',
  },

  /*
   * Deutsches Stemming: vereinfachte Regel-basierte Reduktion
   */
  stem(word) {
    let w = word.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Länge < 4: nicht stemmen
    if (w.length < 4) return w;

    // Längste Endungen zuerst entfernen
    const suffixes = [
      'lichkeit', 'lerinnen', 'erinnen', 'igkeiten', 'erischen',
      'nisation', 'ination', 'graphie', 'logie',
      'lierung', 'ierung', 'ierung',
      'heiten', 'keit', 'heit', 'keit', 'nis',
      'innen', 'isch', 'ische', 'ischen', 'ischer',
      'liche', 'licher', 'liches', 'lich',
      'ungen', 'ung', 'ling', 'ling',
      'niss', 'lein', 'chen',
      'tern', 'sten', 'stel',
      'ten', 'tet', 'tes', 'te',
      'em', 'en', 'el', 'er', 'es',
      'e', 'n', 't',
    ];

    for (const suffix of suffixes) {
      if (w.endsWith(suffix) && w.length - suffix.length >= 3) {
        w = w.slice(0, -suffix.length);
        // Nach Entfernung von -ung, -heit, -keit oft ein -ig oder -lich dran
        if (w.endsWith('ig') || w.endsWith('lich')) {
          // gut so
        }
        break;
      }
    }

    // Doppelkonsonanten vereinfachen
    w = w.replace(/([bcdfghklmnpqrstvwxyz])\1/g, '$1');

    return w;
  },

  /*
   * Tokenisierung + Normalisierung eines Textes
   */
  tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[.,!?;:()""''«»\-–—/\\\[\]{}|@#$%^&*+=<>~`]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1)
      .filter(t => !this.stopwords.has(t))
      .map(t => this.synonyms[t] || t)
      .map(t => this.stem(t));
  },

  /*
   * TF-IDF berechnen für Query vs. Dokumente
   */
  computeTFIDF(queryTokens, allDocsTokens) {
    const N = allDocsTokens.length;
    if (N === 0) return [];

    // Dokumentfrequenz (DF) für jeden Term
    const df = {};
    for (const doc of allDocsTokens) {
      const unique = new Set(doc);
      for (const term of unique) {
        df[term] = (df[term] || 0) + 1;
      }
    }

    const results = [];

    for (let i = 0; i < allDocsTokens.length; i++) {
      const doc = allDocsTokens[i];
      const tfidf = {};

      // TF berechnen für Query-Terme im Dokument
      for (const qTerm of queryTokens) {
        if (!doc.includes(qTerm)) continue;
        // Term Frequency im Dokument
        const tf = doc.filter(t => t === qTerm).length / doc.length;
        // Inverse Document Frequency
        const idf = Math.log((N + 1) / (df[qTerm] || 1) + 1);
        tfidf[qTerm] = tf * idf;
      }

      // Cosine Similarity
      const magnitude = Math.sqrt(Object.values(tfidf).reduce((sum, v) => sum + v * v, 0));
      const score = magnitude / Math.sqrt(queryTokens.length) || 0;

      results.push(score);
    }

    return results;
  },

  /*
   * Bigram/Jaccard Similarity als zusätzlichen Score
   */
  bigramSimilarity(tokens1, tokens2) {
    const set1 = new Set(tokens1);
    const set2 = new Set(tokens2);
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    if (union.size === 0) return 0;
    return intersection.size / union.size;
  },

  /*
   * Erweiterte Suche: kombiniert TF-IDF, Jaccard und Keyword-Matching
   */
  search(query) {
    const kb = KnowledgeBase.getAll();
    if (!query || !kb.length) return [];

    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return kb.map(item => ({ ...item, score: 0, confidence: 0 }));

    const allTokens = kb.map(item => this.tokenize(item.question + ' ' + item.answer));
    const tfidfScores = this.computeTFIDF(queryTokens, allTokens);

    const scored = kb.map((item, i) => {
      const tokens = allTokens[i];
      const tfidf = tfidfScores[i] || 0;
      const jaccard = this.bigramSimilarity(queryTokens, tokens);

      // Exakte Wort-Treffer in der Frage (höher gewichtet)
      const exactQuestion = query.toLowerCase();
      const qMatch = item.question.toLowerCase();
      let exactBonus = 0;
      if (qMatch === exactQuestion) exactBonus = 2.0;
      else if (qMatch.includes(exactQuestion) || exactQuestion.includes(qMatch)) exactBonus = 1.0;

      // Prüfe ob alle Query-Tokens in Frage oder Antwort vorkommen
      const allTokensMatch = queryTokens.every(t =>
        tokens.includes(t) || item.question.toLowerCase().includes(t) || item.answer.toLowerCase().includes(t)
      );
      const allMatchBonus = allTokensMatch ? 0.8 : 0;

      // Kategorie-Treffer-Bonus
      const catTokens = this.tokenize(item.category);
      const catBonus = this.bigramSimilarity(queryTokens, catTokens) * 0.5;

      // Kontext-Bonus: Wenn vorherige Fragen ähnliche Kategorie
      const contextBonus = this.getContextBonus(item.category);

      const totalScore = tfidf * 1.5 + jaccard * 1.0 + exactBonus * 2.0 + allMatchBonus + catBonus + contextBonus;

      // Konfidenz 0-1 normalisieren
      const confidence = Math.min(1, totalScore / 3.0);

      return { ...item, score: totalScore, confidence };
    });

    // Sortieren nach Score (absteigend)
    scored.sort((a, b) => b.score - a.score);

    return scored.filter(item => item.score > 0.01);
  },

  /*
   * Kontext-Bonus: Ähnlichkeit mit vorherigen Fragen
   */
  getContextBonus(category) {
    if (this.context.length === 0) return 0;
    const lastCats = this.context.slice(-3).map(c => c.category);
    const matches = lastCats.filter(c => c === category).length;
    return matches * 0.3;
  },

  /*
   * Kontext aktualisieren nach einer Frage
   */
  updateContext(question, answer, category) {
    this.context.push({ question, answer, category });
    if (this.context.length > 10) {
      this.context = this.context.slice(-10);
    }
  },

  /*
   * Beste Antwort finden
   */
  findBestAnswer(query) {
    const results = this.search(query);

    if (results.length === 0) {
      return { answer: null, suggestions: [], confidence: 0 };
    }

    const best = results[0];

    // Bei niedriger Konfidenz: Top-3 als Vorschläge
    if (best.confidence < 0.35 && results.length > 1) {
      const suggestions = results.slice(0, 3).map(r => ({
        question: r.question,
        category: r.category,
        confidence: r.confidence
      }));
      return { answer: null, suggestions, confidence: best.confidence };
    }

    // Kontext speichern
    this.updateContext(query, best.answer, best.category);

    // Zusätzliche verwandte Fragen für "mehr dazu"
    const related = results.slice(1, 4).filter(r => r.id !== best.id);

    return {
      answer: best.answer,
      category: best.category,
      confidence: best.confidence,
      related: related.map(r => ({ question: r.question, category: r.category })),
      sources: [best.category]
    };
  },

  /*
   * Antwort mit Konfidenz-Badge formatieren
   */
  formatConfidence(confidence) {
    if (confidence >= 0.8) return '🤖 Sehr gute Übereinstimmung';
    if (confidence >= 0.6) return '🤖 Gute Übereinstimmung';
    if (confidence >= 0.35) return '🤖 Ähnliche Frage gefunden';
    return '🤖 Schwache Übereinstimmung';
  },

  /*
   * Fallback-Generierung wenn keine gute Antwort gefunden wurde
   */
  generateFallback(query, suggestions) {
    const tokens = this.tokenize(query);
    let parts = [];

    // Versuche Kategorie zu erraten
    const categories = KnowledgeBase.getCategories();
    const catTokens = categories.map(c => ({ cat: c, tokens: this.tokenize(c) }));
    let bestCat = null;
    let bestCatScore = 0;
    for (const { cat, tokens: ct } of catTokens) {
      const sim = this.bigramSimilarity(tokens, ct);
      if (sim > bestCatScore) {
        bestCatScore = sim;
        bestCat = cat;
      }
    }

    // Frage in der Kategorie vorschlagen
    if (bestCat && bestCatScore > 0.2) {
      const catItems = KnowledgeBase.getByCategory(bestCat).slice(0, 3);
      parts.push(`Ihre Frage könnte zum Bereich **${bestCat}** gehören.`);
      if (catItems.length) {
        parts.push('Hier einige passende Fragen:');
        catItems.forEach(item => parts.push(`- ${item.question}`));
      }
    }

    // Allgemeine Vorschläge
    if (!suggestions || suggestions.length === 0) {
      const random = KnowledgeBase.getAll().sort(() => Math.random() - 0.5).slice(0, 4);
      parts.push('Oder stöbern Sie in diesen Themen:');
      random.forEach(item => parts.push(`- ${item.question}`));
    }

    parts.push('💡 Als Admin können Sie im Admin-Panel neue Fragen und Antworten hinzufügen.');

    return parts.join('\n');
  },

  /*
   * Gesprächs-Kontext zurücksetzen
   */
  resetContext() {
    this.context = [];
  }
};
