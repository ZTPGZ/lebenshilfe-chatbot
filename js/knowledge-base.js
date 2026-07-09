const DEFAULT_KNOWLEDGE_BASE = [
  { id: 1, category: "Prozessmanagement", question: "Was ist Prozessmanagement?", answer: "Prozessmanagement ist ein systematischer Ansatz zur Steuerung und Optimierung von Arbeitsabläufen in unserer Einrichtung. Ziel ist es, Abläufe transparent, effizient und qualitativ hochwertig zu gestalten – zum Wohle der Menschen mit Beeinträchtigung, die wir begleiten. Bei der Lebenshilfe Braunschweig umfasst dies alle Kern-, Unterstützungs- und Führungsprozesse." },
  { id: 2, category: "Prozessmanagement", question: "Welche Prozessarten gibt es?", answer: "Wir unterscheiden drei Prozessarten: 1) Kernprozesse – unmittelbar wertschöpfend für unsere Kunden und Klienten (z.B. Pflege, Betreuung, Begleitung). 2) Unterstützungsprozesse – ermöglichen und unterstützen die Kernprozesse (z.B. Personalwirtschaft, IT, Facility Management). 3) Führungsprozesse – strategische Steuerung und Weiterentwicklung (z.B. Qualitätsmanagement, Strategieplanung)." },
  { id: 3, category: "Prozessmanagement", question: "Wie dokumentieren wir Prozesse?", answer: "Prozesse werden in unserem Qualitätsmanagement-Handbuch dokumentiert. Jeder Prozess wird mit einer Prozesslandkarte visualisiert und in Prozesssteckbriefen beschrieben. Die Dokumentation erfolgt nach dem PDCA-Zyklus (Plan-Do-Check-Act). Alle Mitarbeitenden haben Zugriff auf die aktuellen Versionen über unser internes Netzwerk." },
  { id: 4, category: "Prozessmanagement", question: "Was ist eine Prozesslandkarte?", answer: "Eine Prozesslandkarte ist die grafische Darstellung aller Prozesse einer Organisation. Sie zeigt die Zusammenhänge zwischen Kern-, Unterstützungs- und Führungsprozessen auf. Bei der Lebenshilfe Braunschweig dient sie als Orientierungshilfe für alle Mitarbeitenden, um zu verstehen, wie die eigenen Tätigkeiten in das Gesamtsystem eingebunden sind." },
  { id: 5, category: "Qualitätsmanagement", question: "Was ist Qualitätsmanagement?", answer: "Qualitätsmanagement (QM) umfasst alle Maßnahmen zur Sicherung und Verbesserung der Qualität unserer Dienstleistungen. Bei der Lebenshilfe Braunschweig orientieren wir uns an der DIN EN ISO 9001 sowie an branchenspezifischen Standards für die Behindertenhilfe. Unser QM-System stellt sicher, dass wir die hohen Anforderungen an die Betreuung und Begleitung von Menschen mit Beeinträchtigung erfüllen." },
  { id: 6, category: "Qualitätsmanagement", question: "Welche QM-Standards gelten bei der Lebenshilfe?", answer: "Bei der Lebenshilfe Braunschweig arbeiten wir nach der DIN EN ISO 9001:2015. Ergänzend beachten wir die Anforderungen der WfbM-Verordnung und die Qualitätsindikatoren der Eingliederungshilfe nach SGB IX. Unser QM-System wird regelmäßig durch interne Audits und externe Zertifizierungen überprüft." },
  { id: 7, category: "Qualitätsmanagement", question: "Was ist ein internes Audit?", answer: "Ein internes Audit ist eine systematische, unabhängige Untersuchung unserer Prozesse und Abläufe. Es wird von geschulten internen Auditoren durchgeführt und dient der Überprüfung, ob unsere Prozesse wirksam sind und den Anforderungen entsprechen. Die Ergebnisse fließen in die kontinuierliche Verbesserung ein." },
  { id: 8, category: "Qualitätsmanagement", question: "Wie läuft ein Beschwerdemanagement ab?", answer: "Unser Beschwerdemanagement ist ein wichtiger Bestandteil des Qualitätsmanagements. Jede Beschwerde wird ernst genommen, systematisch erfasst und bearbeitet. Der Ablauf: 1) Annahme und Dokumentation, 2) Prüfung und Analyse, 3) Lösung und Rückmeldung, 4) Auswertung und Verbesserung. Beschwerden sehen wir als Chance zur Weiterentwicklung." },
  { id: 9, category: "Balanced Scorecard", question: "Was ist die Balanced Scorecard?", answer: "Die Balanced Scorecard (BSC) ist ein strategisches Managementinstrument, das die Vision und Strategie einer Organisation in konkrete Ziele und Kennzahlen übersetzt. Sie betrachtet vier Perspektiven: Finanzen, Kunden/Klienten, interne Prozesse sowie Lernen und Entwicklung. Bei der Lebenshilfe Braunschweig nutzen wir die BSC, um unsere strategischen Ziele zu verfolgen und zu messen." },
  { id: 10, category: "Balanced Scorecard", question: "Welche Perspektiven hat die Balanced Scorecard?", answer: "Die Balanced Scorecard umfasst vier Perspektiven: 1) Finanzperspektive – wirtschaftliche Tragfähigkeit und Ressourceneinsatz. 2) Klienten-/Kundenperspektive – Zufriedenheit und Lebensqualität der Menschen mit Beeinträchtigung. 3) Interne Prozessperspektive – Qualität und Effizienz unserer Abläufe. 4) Lern- und Entwicklungsperspektive – Mitarbeiterzufriedenheit, Qualifikation und Innovation." },
  { id: 11, category: "Balanced Scorecard", question: "Wie erstellen wir eine Balanced Scorecard?", answer: "Die Erstellung einer Balanced Scorecard erfolgt in mehreren Schritten: 1) Klärung der Vision und Strategie. 2) Ableitung strategischer Ziele für jede der vier Perspektiven. 3) Festlegung von Kennzahlen (KPIs) zur Messung der Zielerreichung. 4) Definition von konkreten Maßnahmen und Initiativen. 5) Regelmäßige Überprüfung und Anpassung." },
  { id: 12, category: "Balanced Scorecard", question: "Können Sie ein Beispiel für BSC-Kennzahlen nennen?", answer: "Klientenperspektive: Zufriedenheit der Klienten, Teilhabe an Gemeinschaftsaktivitäten. Prozessperspektive: Anzahl Audits, Einhaltung von Dokumentationsfristen. Mitarbeiterperspektive: Krankenstand, Fortbildungen. Finanzperspektive: Kostendeckungsgrad, Wirtschaftlichkeit." },
  { id: 13, category: "Dokumentenmanagement", question: "Wo finde ich aktuelle QM-Dokumente?", answer: "Alle aktuellen QM-Dokumente finden Sie im internen Netzwerk unter \\\\lsserver\\qm-handbuch\\ oder über das QM-Portal im Intranet. Verwenden Sie stets die aktuellste Version. Die Dokumente sind nach Prozessen gegliedert und enthalten Verfahrensanweisungen, Arbeitsanleitungen und Formulare." },
  { id: 14, category: "Dokumentenmanagement", question: "Wie ist die Dokumentenlenkung geregelt?", answer: "Die Dokumentenlenkung stellt sicher, dass alle mit gültigen Dokumenten arbeiten. Regeln: 1) Nur freigegebene Dokumente verwenden. 2) Ausgedruckte Exemplare sind nicht immer aktuell – digitale Version prüfen. 3) Änderungsanträge an die QM-Abteilung. 4) Jedes Dokument hat eine eindeutige ID, Prüfdatum und Freigabe." },
  { id: 15, category: "Dokumentenmanagement", question: "Wie beantrage ich eine Änderung an einem QM-Dokument?", answer: "Änderungsanträge stellen Sie schriftlich an die QM-Abteilung mit dem Formular 'Änderungsantrag QM-Dokument' im Intranet. Anzugeben sind: Dokumententitel, aktuelle Version, gewünschte Änderung und Begründung." },
  { id: 16, category: "Pflege", question: "Wie läuft der Pflegeprozess ab?", answer: "Der Pflegeprozess folgt einem strukturierten Ablauf: 1) Pflegeanamnese und Assessment, 2) Pflegediagnose, 3) Planung gemeinsam mit dem Klienten, 4) Durchführung der Maßnahmen, 5) Evaluation und Anpassung." },
  { id: 17, category: "Pflege", question: "Was ist bei der Pflege von Menschen mit Beeinträchtigung besonders zu beachten?", answer: "Respektvoller Umgang und Selbstbestimmung stehen im Vordergrund. Wichtige Prinzipien: Person-zentrierte Pflege, soziale Teilhabe fördern, Leichte Sprache und unterstützte Kommunikation nutzen, Validation und Biografiearbeit, enge Zusammenarbeit mit Angehörigen und gesetzlichen Betreuern." },
  { id: 18, category: "Pflege", question: "Was ist der Unterschied zwischen Pflege und Betreuung?", answer: "Pflege umfasst medizinisch-behandlungspflegerische Maßnahmen und Grundpflege. Betreuung geht darüber hinaus und bezieht sich auf Alltagsbegleitung, Förderung von Selbstständigkeit und emotionale Unterstützung. Beides ist eng verbunden und wird bei der Lebenshilfe integriert betrachtet." },
  { id: 19, category: "Inklusion", question: "Was bedeutet Inklusion bei der Lebenshilfe?", answer: "Inklusion bedeutet, dass jeder Mensch selbstbestimmt am gesellschaftlichen Leben teilhaben kann – unabhängig von einer Beeinträchtigung. Wir bauen Barrieren ab und schaffen inklusive Strukturen. Unser Leitbild 'Mittendrin. Nebenan.' drückt aus, dass alle dazugehören." },
  { id: 20, category: "Inklusion", question: "Wie fördern Sie die Selbstbestimmung der Klienten?", answer: "Durch individuelle Unterstützungsplanung, Wahlmöglichkeiten bei Tagesstruktur und Wohnform, Förderung der Selbstvertretung, Beratung in Leichter Sprache und Respekt vor den Wünschen jedes Menschen." },
  { id: 21, category: "Inklusion", question: "Was ist Leichte Sprache?", answer: "Leichte Sprache ist eine besonders verständliche Sprachform für Menschen mit Lernschwierigkeiten. Sie verwendet kurze Sätze, einfache Wörter, konkrete Beispiele und Bilder. Die Regeln werden vom Netzwerk Leichte Sprache festgelegt." },
  { id: 22, category: "Qualitätsmanagement", question: "Was ist der PDCA-Zyklus?", answer: "PDCA (Plan-Do-Check-Act) ist ein zentrales QM-Werkzeug. Plan: Ziele festlegen. Do: Prozesse umsetzen. Check: Ergebnisse messen. Act: Verbesserungen ableiten. Der Kreislauf wird kontinuierlich wiederholt." },
  { id: 23, category: "Qualitätsmanagement", question: "Was ist eine Nichtkonformität?", answer: "Eine Nichtkonformität ist die Nichterfüllung einer Anforderung. Im Audit-Bericht dokumentiert, muss sie mit Korrekturmaßnahmen behoben werden. Die Ursachenanalyse hilft, Wiederholungen zu vermeiden." },
  { id: 24, category: "Qualitätsmanagement", question: "Wie oft finden QM-Zertifizierungen statt?", answer: "Die ISO 9001-Zertifizierung erfolgt im 3-Jahres-Turnus mit jährlichen Überwachungsaudits. Ergänzend führen wir jährlich interne Audits durch." },
  { id: 25, category: "Qualitätsmanagement", question: "Wer ist für das Qualitätsmanagement zuständig?", answer: "Die QM-Beauftragte/der QM-Beauftragte koordiniert das QM. Jeder Prozess hat einen Prozessverantwortlichen. Die Geschäftsführung trägt die Gesamtverantwortung." },
  { id: 26, category: "Prozessmanagement", question: "Was sind KPIs im Prozessmanagement?", answer: "KPIs (Key Performance Indicators) sind messbare Kennzahlen wie Auslastung, Durchlaufzeiten, Mitarbeiterzufriedenheit, Schulungsquote, Beschwerdequote. Sie helfen, Ziele zu überprüfen." },
  { id: 27, category: "Prozessmanagement", question: "Was ist eine Verfahrensanweisung?", answer: "Eine Verfahrensanweisung (VA) beschreibt detailliert, wie ein Prozess ausgeführt wird: Wer macht was, wann, wie und womit. Sie ist verbindlich und Teil des QM-Handbuchs." },
  { id: 28, category: "Prozessmanagement", question: "Was ist der Unterschied zwischen Prozess und Projekt?", answer: "Ein Prozess ist wiederkehrend und standardisiert (z.B. tägliche Pflege). Ein Projekt ist einmalig, zeitlich befristet mit definiertem Ziel (z.B. Einführung neuer Software)." },
  { id: 29, category: "Allgemein", question: "Was macht die Lebenshilfe Braunschweig?", answer: "Die Lebenshilfe Braunschweig begleitet Menschen mit Beeinträchtigung in allen Lebensbereichen: Wohnen, Werkstätten, Frühförderung, schulische Begleitung, offene Hilfen und Beratung. Ziel ist Inklusion und Selbstbestimmung." },
  { id: 30, category: "Allgemein", question: "Was ist das Leitbild der Lebenshilfe Braunschweig?", answer: "Unser Leitbild ist 'Mittendrin. Nebenan.' – wir stehen für gelebte Inklusion, Selbstbestimmung und gesellschaftliche Teilhabe von Menschen mit Beeinträchtigung in der Region Braunschweig." }
];

const STORAGE_KEY = 'lh_knowledge_base';
const ADMIN_PASSWORD_KEY = 'lh_admin_password';
const DEFAULT_ADMIN_PASSWORD = 'lebenshilfe2024';

const KnowledgeBase = {
  getAll() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try { return JSON.parse(stored); } catch(e) {}
    }
    this.seed();
    return [...DEFAULT_KNOWLEDGE_BASE];
  },

  seed() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_KNOWLEDGE_BASE));
  },

  save(kb) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kb));
  },

  add(item) {
    const kb = this.getAll();
    item.id = Date.now();
    kb.push(item);
    this.save(kb);
    return item;
  },

  update(id, data) {
    const kb = this.getAll();
    const idx = kb.findIndex(i => i.id === id);
    if (idx === -1) return false;
    kb[idx] = { ...kb[idx], ...data };
    this.save(kb);
    return true;
  },

  remove(id) {
    const kb = this.getAll();
    const filtered = kb.filter(i => i.id !== id);
    this.save(filtered);
    return filtered.length !== kb.length;
  },

  search(query) {
    const kb = this.getAll();
    const q = query.toLowerCase();
    return kb.filter(item =>
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  },

  getByCategory(category) {
    const kb = this.getAll();
    if (!category || category === 'Alle') return kb;
    return kb.filter(i => i.category === category);
  },

  getCategories() {
    const kb = this.getAll();
    return [...new Set(kb.map(i => i.category))].sort();
  },

  getAdminPassword() {
    return localStorage.getItem(ADMIN_PASSWORD_KEY) || DEFAULT_ADMIN_PASSWORD;
  },

  setAdminPassword(password) {
    localStorage.setItem(ADMIN_PASSWORD_KEY, password);
  },

  findAnswer(query) {
    if (typeof AIEngine !== 'undefined') {
      const result = AIEngine.findBestAnswer(query);
      if (result.answer) return { ...result, answer: result.answer };
      return null;
    }
    const results = this.search(query);
    if (results.length === 0) return null;
    return results.reduce((best, item) => {
      const qScore = (item.question.toLowerCase().match(new RegExp(query.toLowerCase(), 'g')) || []).length * 3;
      const aScore = (item.answer.toLowerCase().match(new RegExp(query.toLowerCase(), 'g')) || []).length;
      const cScore = (item.category.toLowerCase().match(new RegExp(query.toLowerCase(), 'g')) || []).length * 2;
      const score = qScore + aScore + cScore;
      return score > (best.score || 0) ? { ...item, score } : best;
    }, { score: 0 });
  },

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    this.seed();
    return this.getAll();
  }
};
