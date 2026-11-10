/* Memora — Education mode v1 */
(function () {
  "use strict";
  const A = window.Android;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const fileSrc = (sid, rel) => (A.fileUrl ? A.fileUrl(sid, rel) : `file://${A.sessionPath(sid)}/${rel}`);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const J = (s, d) => { try { return s ? JSON.parse(s) : d; } catch (e) { return d; } };

  // ------------------------------------------------------------------ icons
  const P = {
    fp: '<path d="M7.5 4.6A9 9 0 0 1 21 12.5M3.6 8A9 9 0 0 0 3 11.5M6 19.5a13 13 0 0 0 1.5-6.5 4.5 4.5 0 0 1 9 0c0 1.6-.1 3.1-.4 4.6M12 13c0 3.2-.7 6.2-2 8.6M16.4 20.6c.3-.6.5-1.3.7-2M9.6 9.2A4.5 4.5 0 0 1 12 8.5"/>',
    del: '<path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z"/><path d="m17 9.5-5 5M12 9.5l5 5"/>',
    chat: '<path d="M4.5 5h15A1.5 1.5 0 0 1 21 6.5v9a1.5 1.5 0 0 1-1.5 1.5H12l-4.5 3.5V17h-3A1.5 1.5 0 0 1 3 15.5v-9A1.5 1.5 0 0 1 4.5 5z"/><path d="M8 10h8M8 13h5"/>',
    task: '<rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="m8 12 3 3 5-6"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6.5A2.5 2.5 0 0 0 13.5 4h-7A2.5 2.5 0 0 0 4 6.5v7A2.5 2.5 0 0 0 6.5 16H8"/>',
    flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
    lock: '<rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
    book: '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>',
    cal: '<rect x="3" y="4.5" width="18" height="17" rx="3"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    mic: '<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3.5"/>',
    pause: '<rect x="6.5" y="5" width="3.5" height="14" rx="1.2" fill="currentColor" stroke="none"/><rect x="14" y="5" width="3.5" height="14" rx="1.2" fill="currentColor" stroke="none"/>',
    play: '<path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.6-6.8a.8.8 0 0 0 0-1.4L9.2 4.5A.8.8 0 0 0 8 5.2z" fill="currentColor" stroke="none"/>',
    star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    starf: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="currentColor"/>',
    cam: '<path d="M3 8.5A2.5 2.5 0 0 1 5.5 6h1.8l1.4-2h6.6l1.4 2h1.8A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/><circle cx="12" cy="12.8" r="3.6"/>',
    stop: '<rect x="6" y="6" width="12" height="12" rx="2.5" fill="currentColor" stroke="none"/>',
    left: '<path d="m15 5-7 7 7 7"/>',
    right: '<path d="m9 5 7 7-7 7"/>',
    down: '<path d="M12 3.5v12M6.5 10.5 12 16l5.5-5.5M4 20.5h16"/>',
    share: '<path d="M12 15V3.5M7.5 8 12 3.5 16.5 8"/><path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    head: '<path d="M4 15v-3a8 8 0 0 1 16 0v3"/><rect x="3" y="14" width="5" height="7" rx="2"/><rect x="16" y="14" width="5" height="7" rx="2"/>',
    file: '<path d="M14 2.5H7A2.5 2.5 0 0 0 4.5 5v14A2.5 2.5 0 0 0 7 21.5h10a2.5 2.5 0 0 0 2.5-2.5V8z"/><path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h5"/>',
    more: '<circle cx="5" cy="12" r="1.6" fill="currentColor"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/><circle cx="19" cy="12" r="1.6" fill="currentColor"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    trash: '<path d="M4 6.5h16M9.5 6.5V4h5v2.5M6.5 6.5l1 13.5h9l1-13.5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    back15: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.6"/><path d="M4 3.5v5.1h5.1"/><text x="12" y="15.5" font-size="7.5" text-anchor="middle" fill="currentColor" stroke="none" font-family="Inter" font-weight="700">15</text>',
    fwd15: '<path d="M20 12a8 8 0 1 1-2.4-5.7L20 8.6"/><path d="M20 3.5v5.1h-5.1"/><text x="12" y="15.5" font-size="7.5" text-anchor="middle" fill="currentColor" stroke="none" font-family="Inter" font-weight="700">15</text>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    upload: '<path d="M12 16V4.5M7 9l5-5 5 5"/><path d="M4 16.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2.5"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M18.5 14a6.5 6.5 0 0 1 3 6"/>',
    list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2" fill="currentColor"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor"/><circle cx="4.5" cy="18" r="1.2" fill="currentColor"/>',
    key: '<circle cx="8" cy="15" r="4.5"/><path d="m11.2 11.8 8.3-8.3M16.5 6.5l2.5 2.5M14 9l2 2"/>',
    bolt: '<path d="M13 2.5 4.5 13.5H12l-1 8 8.5-11H12z"/>',
    refresh: '<path d="M20 11a8 8 0 0 0-14.6-4.5L3.5 9M3.5 4v5h5M4 13a8 8 0 0 0 14.6 4.5L20.5 15M20.5 20v-5h-5"/>',
    image: '<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  };
  const ic = (n, cls) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"${cls ? ` class="${cls}"` : ""}>${P[n] || ""}</svg>`;

  // ------------------------------------------------------------------ data
  const COLORS = ["#4F46E5", "#EE5A4F", "#17936A", "#D9822B", "#8B5CF6", "#0E9BB0", "#DB2777", "#5E8C12"];
  const LOGO = `<div class="logo"><span class="mk"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17V9.5c0-1.4 1.1-1.7 1.9-.8L12 14l5.1-5.3c.8-.9 1.9-.6 1.9.8V17"/><circle cx="19.2" cy="4.8" r="1.9" fill="#FF8A7A" stroke="none"/></svg></span>memora</div>`;
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const LANGS = [
    ["ta", "Tamil", "தமிழ்"], ["ta-Latn", "Tanglish", "Tamil in English letters"], ["en", "English", ""], ["hi", "Hindi", "हिन्दी"],
    ["te", "Telugu", "తెలుగు"], ["kn", "Kannada", "ಕನ್ನಡ"], ["ml", "Malayalam", "മലയാളം"], ["mr", "Marathi", "मराठी"],
    ["bn", "Bengali", "বাংলা"], ["gu", "Gujarati", "ગુજરાતી"], ["pa", "Punjabi", "ਪੰਜਾਬੀ"], ["ur", "Urdu", "اردو"],
    ["or", "Odia", "ଓଡ଼ିଆ"], ["si", "Sinhala", "සිංහල"], ["ne", "Nepali", "नेपाली"], ["ar", "Arabic", "العربية"],
    ["fr", "French", "Français"], ["de", "German", "Deutsch"], ["es", "Spanish", "Español"], ["pt", "Portuguese", "Português"],
    ["it", "Italian", "Italiano"], ["ru", "Russian", "Русский"], ["ja", "Japanese", "日本語"], ["ko", "Korean", "한국어"],
    ["zh-CN", "Chinese", "简体中文"], ["id", "Indonesian", "Bahasa"], ["ms", "Malay", "Melayu"], ["th", "Thai", "ไทย"],
    ["vi", "Vietnamese", "Tiếng Việt"], ["tr", "Turkish", "Türkçe"], ["nl", "Dutch", "Nederlands"], ["sv", "Swedish", "Svenska"],
    ["pl", "Polish", "Polski"], ["uk", "Ukrainian", "Українська"], ["he", "Hebrew", "עברית"], ["fa", "Persian", "فارسی"],
    ["sw", "Swahili", "Kiswahili"], ["fil", "Filipino", ""]
  ];
  const langName = (code) => { const l = LANGS.find((x) => x[0] === code); return l ? l[1] : code; };

  const DEFAULT_SETTINGS = { name: "", apiKey: "", model: "gemini-flash-latest", summaryLang: "English", voice: "en-IN", rate: 1.0, autoProcess: true, mic: "standard" };
  let db = J(A.readDb(), null) || {};
  db.version = 1;
  db.settings = Object.assign({}, DEFAULT_SETTINGS, db.settings || {});
  db.subjects = db.subjects || [];
  db.sessions = db.sessions || [];
  db.tickets = db.tickets || [];
  db.plans = db.plans || [];
  db.memos = db.memos || [];
  db.reports = db.reports || [];
  const save = () => { A.writeDb(JSON.stringify(db)); if (window.__memReady) scheduleReminders(); };
  save();

  const subj = (id) => db.subjects.find((s) => s.id === id) || null;
  const sess = (id) => db.sessions.find((s) => s.id === id) || null;
  const GENERAL = { id: "", name: "General", teacher: "", color: "#8A8794", slots: [] };

  // ------------------------------------------------------------------ time helpers
  const pad = (n) => String(n).padStart(2, "0");
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const fmtDate = (iso) => { const d = new Date(iso); return `${pad(d.getDate())} ${MON[d.getMonth()]} ${d.getFullYear()}`; };
  const fmtDay = (iso) => { const d = new Date(iso); return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()]; };
  const clock = (ms) => { const s = Math.max(0, Math.floor(ms / 1000)), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; return h ? `${h}:${pad(m)}:${pad(x)}` : `${pad(m)}:${pad(x)}`; };
  const dur = (ms) => { const m = Math.round(ms / 60000); if (m < 1) return "<1 min"; const h = Math.floor(m / 60); return h ? `${h}h ${m % 60}m` : `${m} min`; };
  const t12 = (hm) => { if (!hm) return ""; const [h, m] = hm.split(":").map(Number); const ap = h >= 12 ? "PM" : "AM"; return `${((h + 11) % 12) + 1}:${pad(m)} ${ap}`; };
  const mins = (hm) => { const [h, m] = (hm || "0:0").split(":").map(Number); return h * 60 + m; };
  const isoDow = (d) => ((d.getDay() + 6) % 7) + 1; // Mon=1..Sun=7

  function slotsToday(d) {
    const dow = isoDow(d || new Date());
    const out = [];
    db.subjects.forEach((s) => (s.slots || []).forEach((sl) => { if ((sl.days || []).includes(dow)) out.push({ s, sl }); }));
    return out.sort((a, b) => mins(a.sl.start) - mins(b.sl.start));
  }
  function detectClass() {
    const now = new Date(), nm = now.getHours() * 60 + now.getMinutes();
    const today = slotsToday(now);
    const cur = today.find((x) => nm >= mins(x.sl.start) - 15 && nm <= mins(x.sl.end));
    if (cur) return { kind: "now", ...cur };
    const next = today.find((x) => mins(x.sl.start) > nm);
    if (next) return { kind: "next", ...next };
    return null;
  }
  const nextClassNo = (sid) => db.sessions.filter((x) => (x.subjectId || "") === (sid || "")).reduce((m, x) => Math.max(m, x.classNo || 0), 0) + 1;
  function scheduleText(s) {
    return (s.slots || []).map((sl) => `${(sl.days || []).sort().map((d) => DAYS[d - 1]).join(", ")} · ${t12(sl.start)}–${t12(sl.end)}`).join("  |  ");
  }

  // ------------------------------------------------------------------ status
  const rec = () => J(A.recState(), { state: "idle" });
  const job = (id) => J(A.jobStatus(id), {});
  function status(s) {
    const r = rec();
    if (r.sid === s.id && r.state !== "idle") return { k: "rec", label: r.state === "paused" ? "On break" : r.state === "saving" ? "Saving" : "Recording" };
    const j = job(s.id);
    if (j.running) return { k: "proc", label: j.stage || "Processing", p: j.progress || 0, job: j.job, started: j.started, stuck: j.updated && Date.now() - j.updated > 4 * 60000 };
    const ready = A.exists(s.id, "summary.md");
    if (j.error) return { k: ready ? "ready" : "err", err: j.error, job: j.job, label: j.error };
    if (ready) return { k: "ready" };
    if (s.status === "importing") return { k: "proc", label: "Importing", p: 0 };
    return { k: "saved" };
  }
  function chipFor(st) {
    if (st.k === "rec") return `<span class="chip rec"><span class="recdot pulse" style="width:7px;height:7px;box-shadow:none"></span>${st.label}</span>`;
    if (st.k === "proc") return `<span class="chip gold">${Math.round((st.p || 0) * 100)}% · Preparing</span>`;
    if (st.k === "ready") return `<span class="chip ok">${ic("check")}Ready</span>`;
    if (st.k === "err") return `<span class="chip err">Needs attention</span>`;
    return `<span class="chip">Saved</span>`;
  }

  // ------------------------------------------------------------------ UI primitives
  let toastT;
  function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("on"), 2600); }
  let sheetOnClose = null;
  function sheet(html, onClose) {
    const sh = $("#sheet");
    sh.innerHTML = `<div class="grab"></div>${html}`;
    sh.classList.remove("hidden"); $("#scrim").classList.remove("hidden");
    sh.scrollTop = 0;
    sheetOnClose = onClose || null;
    return sh;
  }
  function closeSheet() { $("#sheet").classList.add("hidden"); $("#scrim").classList.add("hidden"); $("#sheet").innerHTML = ""; const f = sheetOnClose; sheetOnClose = null; if (f) f(); }
  $("#scrim").addEventListener("click", closeSheet);
  function overlay(title, sub) {
    const o = $("#overlay");
    if (!title) { o.classList.add("hidden"); return; }
    o.innerHTML = `<div class="spin"></div><b>${esc(title)}</b><span>${esc(sub || "")}</span>`;
    o.classList.remove("hidden");
  }
  function confirmSheet(title, sub, okLabel, danger, onOk) {
    const sh = sheet(`<h3>${esc(title)}</h3><p class="sub">${esc(sub)}</p><div class="row"><button class="btn line" data-x>Cancel</button><button class="btn ${danger ? "danger" : "gold"}" data-ok>${esc(okLabel)}</button></div>`);
    $("[data-x]", sh).onclick = closeSheet;
    $("[data-ok]", sh).onclick = () => { closeSheet(); onOk(); };
  }

  // ------------------------------------------------------------------ router
  let view = "today", params = {}, hist = [];
  const TOP = ["today", "library", "timetable", "settings", "meetings", "mlibrary", "tasks", "ask", "reports"];
  const segOf = () => (db.settings.segment === "meet" ? "meet" : "edu");
  const home = () => (segOf() === "meet" ? "meetings" : "today");
  const isMeet = (s) => !!s && s.segment === "meeting";
  function go(v, p, replace) {
    if (!replace && !(TOP.includes(v) && TOP.includes(view))) hist.push([view, params]);
    if (TOP.includes(v)) hist = [];
    view = v; params = p || {};
    render(); window.scrollTo(0, 0);
  }
  function back() {
    if (lockEl) { if (lockEl.dataset.unlock) return false; closePin(); return true; }
    if (!$("#sheet").classList.contains("hidden")) { closeSheet(); return true; }
    const vw = $(".viewer"); if (vw) { vw.remove(); return true; }
    if (hist.length) { const [v, p] = hist.pop(); view = v; params = p; render(); return true; }
    if (view !== home()) { go(home()); return true; }
    return false;
  }
  window.onBack = back;

  function nav() {
    const meet = segOf() === "meet";
    const items = meet
      ? [["meetings", "home", "Home"], ["mlibrary", "list", "Meetings"], ["tasks", "task", "Tasks"], ["ask", "chat", "Ask"], ["reports", "mail", "Reports"]]
      : [["today", "home", "Today"], ["library", "book", "Library"], ["ask", "chat", "Ask"], ["timetable", "cal", "Timetable"], ["settings", "gear", "Settings"]];
    const active = view === "subject" || view === "pack" || view === "book" ? "library" : view === "session" ? (meet ? "mlibrary" : "library") : view === "brief" || view === "clarity" ? "meetings" : view;
    $("#nav").innerHTML = items.map(([k, i, l]) => `<button class="nv ${active === k ? "on" : ""}" data-nav="${k}">${ic(i)}${l}</button>`).join("");
    $$("[data-nav]").forEach((b) => (b.onclick = () => go(b.dataset.nav)));
  }

  function render() {
    syncMeetings();
    const app = $("#app");
    document.body.classList.toggle("nonav", view === "record");
    document.body.classList.toggle("askv", view === "ask");
    app.classList.toggle("full", view === "record");
    const fn = VIEWS[view] || VIEWS.today;
    app.innerHTML = fn();
    if (BIND[view]) BIND[view](app);
    nav();
    tick(true);
  }

  // ------------------------------------------------------------------ views
  const VIEWS = {};
  const BIND = {};

  function segSwitch(active) {
    return `<div class="segs"><button class="seg ${active === "edu" ? "on" : ""}" data-seg="edu">${ic("book")} Education</button>
      <button class="seg ${active === "meet" ? "on" : ""}" data-seg="meet">${ic("users")} Meetings</button></div>`;
  }
  function bindSeg(app) {
    $$("[data-seg]", app).forEach((b) => (b.onclick = () => { db.settings.segment = b.dataset.seg; save(); go(home()); }));
  }

  function sessionItem(s) {
    const sb = subj(s.subjectId) || GENERAL;
    const st = status(s);
    return `<button class="item" data-open="${s.id}">
      <div class="ic" style="color:${sb.color}">${esc((sb.name || "?").charAt(0).toUpperCase())}</div>
      <div class="tx"><div class="t1">${esc(s.title)}</div><div class="t2">${fmtDay(s.date)}, ${fmtDate(s.date)}${s.durationMs ? " · " + dur(s.durationMs) : ""}</div></div>
      ${chipFor(st)}</button>`;
  }
  function bindOpen(app) { $$("[data-open]", app).forEach((b) => (b.onclick = () => go("session", { id: b.dataset.open }))); }

  VIEWS.today = () => {
    const h = new Date().getHours();
    const greet = h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
    const name = db.settings.name ? `, ${esc(db.settings.name)}` : "";
    const det = detectClass();
    const r = rec();
    let nowCard;
    if (r.state !== "idle" && r.sid) {
      const s = sess(r.sid);
      nowCard = `<div class="card now"><div class="eyebrow"><span class="recdot pulse" style="width:8px;height:8px"></span> ${r.state === "paused" ? "On break" : "Recording now"}</div>
        <h3>${esc(s ? s.title : "Class")}</h3><div class="meta">${clock(r.elapsed)} recorded</div>
        <button class="btn gold block" data-resume>${ic("mic")} Return to recording</button></div>`;
    } else if (det) {
      const n = nextClassNo(det.s.id);
      nowCard = `<div class="card now"><div class="eyebrow"><span class="dot"></span>${det.kind === "now" ? "Now" : "Next today"} · ${t12(det.sl.start)} – ${t12(det.sl.end)}</div>
        <h3>${esc(det.s.name)}</h3><div class="meta">${det.s.teacher ? esc(det.s.teacher) + " · " : ""}Class ${n}</div>
        <button class="btn gold block" data-start="${det.s.id}">${ic("mic")} Start Class ${n}</button>
        <button class="btn small line block" style="margin-top:10px" data-pick>Different subject</button></div>`;
    } else {
      nowCard = `<div class="card now"><div class="eyebrow"><span class="dot"></span>Ready when you are</div>
        <h3>No class scheduled right now</h3><div class="meta">Pick a subject and Memora will name, date and number the class for you.</div>
        <button class="btn gold block" data-pick>${ic("mic")} Start a class</button></div>`;
    }
    const setup = setupItems();
    const pendingSetup = setup.filter((x) => !x.done).length;
    const recent = db.sessions.filter((s) => s.segment !== "meeting").slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
    return `<div class="top">${LOGO}<button class="iconbtn" data-import title="Import">${ic("upload")}</button></div>
      ${segSwitch("edu")}
      <div class="hello"><h1>${greet}${name}</h1><p>${fmtDay(new Date().toISOString())}, ${fmtDate(new Date().toISOString())}</p></div>
      ${nowCard}
      ${pendingSetup ? `<h2 class="sec">Get set up <span style="letter-spacing:0">${setup.length - pendingSetup}/${setup.length}</span></h2><div class="card">${setup.map((x) => `<button class="check ${x.done ? "done" : ""}" style="width:100%;text-align:left" data-setup="${x.k}"><div class="b">${x.done ? ic("check") : ""}</div><div class="tx"><b>${x.t}</b><span>${x.d}</span></div>${x.done ? "" : ic("right", "chev")}</button>`).join("")}</div>` : ""}
      <h2 class="sec">Recent classes ${db.sessions.length ? `<button data-nav2="library">See all</button>` : ""}</h2>
      ${recent.length ? `<div class="list">${recent.map(sessionItem).join("")}</div>` :
        `<div class="card empty"><div class="big">Your classes will live here</div>Start a recording in class — Memora writes detailed notes, a PDF and a voice recap you can listen to later.</div>`}
      <button class="btn line block" style="margin-top:14px" data-import>${ic("upload")} Import a recording</button>`;
  };
  BIND.today = (app) => {
    bindSeg(app); bindOpen(app);
    $$("[data-start]", app).forEach((b) => (b.onclick = () => startClass(b.dataset.start)));
    $$("[data-pick]", app).forEach((b) => (b.onclick = () => pickSubject((id) => startClass(id), "Start a class", "Which subject is this class for?")));
    $$("[data-resume]", app).forEach((b) => (b.onclick = () => go("record", { id: rec().sid })));
    $$("[data-import]", app).forEach((b) => (b.onclick = () => A.pickAudio()));
    $$("[data-nav2]", app).forEach((b) => (b.onclick = () => go(b.dataset.nav2)));
    $$("[data-setup]", app).forEach((b) => (b.onclick = () => {
      const k = b.dataset.setup;
      if (k === "key") keySheet();
      else if (k === "subj") subjectSheet(null);
      else if (k === "perm") A.requestPerms();
      else if (k === "batt") A.batterySettings();
    }));
  };

  function setupItems() {
    return [
      { k: "key", t: "Add your free AI key", d: "Google Gemini · 2 minutes, no payment", done: !!db.settings.apiKey },
      { k: "subj", t: "Add subjects & timetable", d: "Auto-detects the class and names it", done: db.subjects.length > 0 },
      { k: "perm", t: "Allow microphone & notifications", d: "Needed to record with the screen off", done: A.hasPerm("mic") && A.hasPerm("notif") },
      { k: "batt", t: "Let Memora run in background", d: "Stops the phone killing long recordings", done: A.hasPerm("battery") },
    ];
  }

  // ================================================================== MEETINGS
  const todayISO = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
  const nowISO = () => new Date().toISOString();
  const meetings = () => db.sessions.filter(isMeet).sort((a, b) => b.date.localeCompare(a.date));
  const seriesList = () => Array.from(new Set(meetings().map((m) => m.series).concat(db.tickets.map((t) => t.series)).filter(Boolean))).sort();
  const openTasks = (series) => db.tickets.filter((t) => t.status === "open" && (!series || t.series === series));
  const fmtDue = (d) => { if (!d) return ""; const [y, m, dd] = d.split("-").map(Number); return `${pad(dd)} ${MON[m - 1]}`; };
  const isOverdue = (t) => t.status === "open" && t.due && t.due < todayISO();

  // AI outputs → title, people, tickets, follow-ups, memos and the next meeting (runs once per meeting)
  function syncMeetings() {
    let changed = false;
    db.sessions.forEach((s) => {
      if (!isMeet(s) || s.synced || !A.exists(s.id, "summary.md")) return;
      const at = nowISO();
      const meta = J(A.readText(s.id, "meta.json"), {}), mx = J(A.readText(s.id, "meeting.json"), {});
      if (meta.title && !s.titleLocked) { if (!s.userTitle) s.userTitle = s.title; s.title = String(meta.title).slice(0, 90); }
      if (!s.attendees && Array.isArray(mx.people)) s.attendees = mx.people.map((p) => p && p.name).filter((n) => n && !isMe(n) && !/^speaker\s*\d/i.test(n)).slice(0, 8).join(", ");
      J(A.readText(s.id, "actions.json"), []).forEach((a) => {
        if (!a || !a.task) return;
        db.tickets.push({
          id: "t" + uid(), text: String(a.task), owner: a.owner || "", due: /^\d{4}-\d{2}-\d{2}$/.test(a.due || "") ? a.due : "",
          status: "open", meetingId: s.id, series: s.series || "", created: at, notes: a.why || "",
          priority: ["high", "medium", "low"].includes(a.priority) ? a.priority : "medium", mine: !!a.mine || isMe(a.owner), manager: !!a.manager, at: a.at || "",
          history: [{ at, what: `Created from “${s.title}”`, meetingId: s.id }],
        });
      });
      J(A.readText(s.id, "followups.json"), []).forEach((f) => {
        const t = db.tickets.find((x) => x.id === f.id); if (!t) return;
        t.history = t.history || [];
        t.history.push({ at, what: `Discussed in “${s.title}”${f.note ? ": " + f.note : ""}`, meetingId: s.id });
        t.followedIn = (t.followedIn || []).concat(s.id);
        if (f.status === "done" && t.status !== "done") { t.status = "done"; t.doneAt = at; t.pending = null; t.history.push({ at, what: `Closed in “${s.title}”`, meetingId: s.id }); }
        else if (f.status === "pending") { t.pending = { reason: f.reason || f.note || "", followWith: f.followWith || (t.pending && t.pending.followWith) || "", since: (t.pending && t.pending.since) || at }; t.history.push({ at, what: `Pending: ${t.pending.reason || "no reason given"}${t.pending.followWith ? " · follow up with " + t.pending.followWith : ""}`, meetingId: s.id }); }
        else if (f.status === "open" && t.pending) { t.pending = null; t.history.push({ at, what: "Moving again", meetingId: s.id }); }
      });
      (mx.remember || []).forEach((r) => { if (r && r.text) db.memos.push({ id: "n" + uid(), text: String(r.text), date: /^\d{4}-\d{2}-\d{2}$/.test(r.date || "") ? r.date : "", meetingId: s.id, created: at, done: false }); });
      const nm = mx.nextMeeting;
      if (nm && /^\d{4}-\d{2}-\d{2}$/.test(nm.date || "") && !db.plans.some((p) => p.fromId === s.id)) {
        const [y, mo, d] = nm.date.split("-").map(Number); const [hh, mm] = (/^\d{1,2}:\d{2}$/.test(nm.time || "") ? nm.time : "11:00").split(":").map(Number);
        const when = new Date(y, mo - 1, d, hh, mm);
        if (when.getTime() > Date.now()) db.plans.push({ id: "p" + uid(), at: when.toISOString(), title: s.series ? `${s.series} · next` : `Follow-up · ${s.title}`, series: s.series || "", fromId: s.id, mtype: s.mtype || "Official", attendees: nm.with || s.attendees || "", topics: (nm.topics || []).join("\n"), auto: true });
      }
      if (s.planId) db.plans = db.plans.filter((p) => p.id !== s.planId);
      s.synced = true; changed = true;
    });
    if (changed) { save(); if (db.settings.apiKey && window.__memReady) setTimeout(() => makeClarity(true), 1500); }
  }
  function resetMeetingTickets(s) {
    if (!isMeet(s)) return;
    db.tickets = db.tickets.filter((t) => !(t.meetingId === s.id && (t.history || []).length <= 1 && t.status === "open"));
    db.memos = db.memos.filter((m) => m.meetingId !== s.id);
    db.plans = db.plans.filter((p) => !(p.fromId === s.id && p.auto));
    s.synced = false; save();
  }

  function meetingItem(s) {
    const st = status(s);
    const tk = db.tickets.filter((t) => t.meetingId === s.id);
    const open = tk.filter((t) => t.status === "open").length;
    return `<button class="item" data-open="${s.id}">
      <div class="ic" style="color:${s.mtype === "Personal" ? "#DB2777" : "var(--gold)"}">${ic(s.mtype === "Personal" ? "users" : "list")}</div>
      <div class="tx"><div class="t1">${esc(s.title)}</div><div class="t2">${fmtDay(s.date)}, ${fmtDate(s.date)}${s.durationMs ? " · " + dur(s.durationMs) : ""}${open ? ` · ${open} open` : ""}</div></div>
      ${chipFor(st)}</button>`;
  }

  function ticketRow(t, showFrom) {
    const m = sess(t.meetingId);
    const bits = [];
    if (t.owner) bits.push(esc(t.owner));
    if (t.due) bits.push(`<span style="${isOverdue(t) ? "color:var(--rec);font-weight:700" : ""}">${isOverdue(t) ? "Overdue · " : "Due "}${fmtDue(t.due)}</span>`);
    if (t.status === "done" && t.doneAt) bits.push(`Done ${fmtDate(t.doneAt)}`);
    if (isPending(t)) bits.push(`<span style="color:var(--warn)">Pending${t.pending.reason ? ": " + esc(t.pending.reason) : ""}${t.pending.followWith ? " · chase " + esc(t.pending.followWith) : ""}</span>`);
    if (showFrom && m) bits.push(esc(m.title));
    if ((t.followedIn || []).length) bits.push(`↻ ${t.followedIn.length}`);
    return `<div class="tk ${t.status}"><button class="tkc" data-tdone="${t.id}">${t.status === "done" ? ic("check") : ""}</button>
      <button class="tkb" data-topen="${t.id}"><div class="t1">${t.priority === "high" && t.status !== "done" ? `<span class="chip rec tkc2">High</span>` : ""}${t.manager && t.status !== "done" ? `<span class="chip gold tkc2">Manager</span>` : ""}${esc(t.text)}</div>${bits.length ? `<div class="t2">${bits.join(" · ")}</div>` : ""}</button></div>`;
  }
  function bindTickets(root) {
    $$("[data-tdone]", root).forEach((b) => (b.onclick = () => toggleDone(b.dataset.tdone)));
    $$("[data-topen]", root).forEach((b) => (b.onclick = () => ticketSheet(db.tickets.find((t) => t.id === b.dataset.topen))));
  }
  function toggleDone(id) {
    const t = db.tickets.find((x) => x.id === id); if (!t) return;
    const at = nowISO();
    t.history = t.history || [];
    if (t.status === "done") { t.status = "open"; t.doneAt = null; t.history.push({ at, what: "Reopened" }); toast("Moved back to open"); }
    else { t.status = "done"; t.doneAt = at; t.pending = null; t.history.push({ at, what: "Marked done" }); toast("Done ✓ — moved to Done list"); }
    save(); render();
  }

  function ticketSheet(t, defaults) {
    const isNew = !t;
    const d = t || Object.assign({ id: "t" + uid(), text: "", owner: "", due: "", status: "open", meetingId: "", series: "", notes: "", history: [] }, defaults || {});
    const series = seriesList();
    const m = sess(d.meetingId);
    const sh = sheet(`<h3>${isNew ? "New task" : "Task"}</h3>${m ? `<p class="sub">From “${esc(m.title)}” · ${fmtDate(m.date)}</p>` : `<p class="sub">Follow-ups are checked automatically in the next meeting of the same series.</p>`}
      <div class="field"><label>Task</label><textarea class="inp" id="tt" placeholder="What needs to be done?">${esc(d.text)}</textarea></div>
      <div class="row"><div class="field"><label>Owner</label><input class="inp" id="to" value="${esc(d.owner)}" placeholder="Name"></div>
      <div class="field"><label>Due date</label><input class="inp" id="tdue" type="date" value="${esc(d.due)}"></div></div>
      <div class="row"><div class="field"><label>Status</label><select class="inp" id="tst">${[["open", "Open"], ["pending", "Pending / stuck"], ["done", "Done"]].map(([k, l]) => `<option value="${k}" ${(d.status === "done" ? "done" : d.pending ? "pending" : "open") === k ? "selected" : ""}>${l}</option>`).join("")}</select></div>
      <div class="field"><label>Priority</label><select class="inp" id="tpr">${["high", "medium", "low"].map((k) => `<option value="${k}" ${(d.priority || "medium") === k ? "selected" : ""}>${k[0].toUpperCase() + k.slice(1)}</option>`).join("")}</select></div></div>
      <div id="tpend" class="pendbox" style="${d.pending ? "" : "display:none"}">
        <div class="field"><label>Why is it pending?</label><input class="inp" id="tpr2" value="${esc((d.pending && d.pending.reason) || "")}" placeholder="e.g. waiting for approval from finance"></div>
        <div class="row"><div class="field"><label>Follow up with</label><input class="inp" id="tfw" value="${esc((d.pending && d.pending.followWith) || "")}" placeholder="Name"></div>
        <div class="field"><label>Next follow-up</label><input class="inp" id="tnx" type="date" value="${esc((d.pending && d.pending.next) || "")}"></div></div></div>
      <label class="chk"><input type="checkbox" id="tmg" ${d.manager ? "checked" : ""}> Align with my manager</label>
      ${isNew ? "" : `<div class="field"><label>Add a status update</label><input class="inp" id="tup" placeholder="e.g. Called Ravi, he will confirm by Friday"></div>`}
      ${m && d.at && tsMs(d.at) != null ? `<button class="btn line block small" style="margin-bottom:10px" data-hear>${ic("play")} Hear where it was said (${esc(d.at)})</button>` : ""}
      <div class="field"><label>Meeting series</label><select class="inp" id="tser"><option value="">None</option>${series.map((x) => `<option ${x === d.series ? "selected" : ""}>${esc(x)}</option>`).join("")}</select></div>
      <div class="field"><label>Notes</label><input class="inp" id="tn" value="${esc(d.notes || "")}" placeholder="Optional"></div>
      <button class="btn gold block" data-save>${isNew ? "Add task" : "Save changes"}</button>
      ${isNew ? "" : `<button class="btn line block" style="margin-top:8px" data-tshare>${ic("share")} Send to ${esc(d.owner || "owner")} (WhatsApp, SMS…)</button>`}
      ${isNew ? "" : `<div class="row" style="margin-top:8px"><button class="btn line" data-tog>${d.status === "done" ? "Reopen" : ic("check") + " Mark done"}</button><button class="btn danger" data-del>${ic("trash")} Delete</button></div>`}
      ${(d.history || []).length ? `<h2 class="sec" style="margin-top:22px">History</h2><div class="hist">${d.history.slice().reverse().map((h) => `<div class="hi"><i></i><div><b>${esc(h.what)}</b><span>${fmtDate(h.at)} · ${new Date(h.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span></div></div>`).join("")}</div>` : ""}`);
    $("#tst", sh).onchange = (e) => { $("#tpend", sh).style.display = e.target.value === "pending" ? "" : "none"; };
    const hr = $("[data-hear]", sh); if (hr) hr.onclick = () => { closeSheet(); playOriginal(m, Math.max(0, tsMs(d.at) - 3000)); };
    $("[data-save]", sh).onclick = () => {
      const text = $("#tt").value.trim();
      if (!text) { toast("Write the task first"); return; }
      const at0 = nowISO(), ns = $("#tst").value;
      d.history = d.history || [];
      d.priority = $("#tpr").value; d.manager = $("#tmg").checked;
      if (ns === "done" && d.status !== "done") { d.status = "done"; d.doneAt = at0; d.pending = null; if (!isNew) d.history.push({ at: at0, what: "Marked done" }); }
      else if (ns !== "done" && d.status === "done") { d.status = "open"; d.doneAt = null; d.history.push({ at: at0, what: "Reopened" }); }
      if (ns === "pending") {
        const was = d.pending, reason = $("#tpr2").value.trim(), fw = $("#tfw").value.trim();
        d.pending = { reason, followWith: fw, next: $("#tnx").value, since: (was && was.since) || at0 };
        if (!was || was.reason !== reason || was.followWith !== fw) d.history.push({ at: at0, what: `Pending: ${reason || "no reason given"}${fw ? " · follow up with " + fw : ""}` });
      } else if (ns === "open" && d.pending) { d.pending = null; d.history.push({ at: at0, what: "Back in progress" }); }
      const up = $("#tup") ? $("#tup").value.trim() : "";
      if (up) d.history.push({ at: at0, what: "Update: " + up });
      const changed = !isNew && (text !== d.text || $("#to").value.trim() !== d.owner || $("#tdue").value !== d.due);
      d.text = text; d.owner = $("#to").value.trim(); d.due = $("#tdue").value; d.series = $("#tser").value; d.notes = $("#tn").value.trim();
      d.history = d.history || [];
      if (isNew) { d.created = nowISO(); d.history.push({ at: d.created, what: "Added manually" }); db.tickets.push(d); }
      else if (changed) d.history.push({ at: nowISO(), what: "Edited" });
      save(); closeSheet(); toast(isNew ? "Task added" : "Saved"); render();
    };
    const tsh = $("[data-tshare]", sh);
    if (tsh) tsh.onclick = () => A.shareText(`Hi${d.owner ? " " + d.owner : ""}, a follow-up${m ? " from “" + m.title + "”" : ""}:\n• ${d.text}${d.due ? "\nDue: " + fmtDue(d.due) : ""}\n\nPlease update me once it's done. Thanks!`);
    const tg = $("[data-tog]", sh); if (tg) tg.onclick = () => { closeSheet(); toggleDone(d.id); };
    const dl = $("[data-del]", sh); if (dl) dl.onclick = () => { closeSheet(); confirmSheet("Delete this task?", "It will be removed from open and done lists.", "Delete", true, () => { db.tickets = db.tickets.filter((x) => x.id !== d.id); save(); toast("Task deleted"); render(); }); };
  }

  // ---------- new meeting
  function meetingSetup(opts) {
    opts = opts || {};
    const series = seriesList();
    const st = { mtype: "Official", series: "", newSeries: false };
    const draw = () => {
      const ser = st.newSeries ? ($("#mns") ? $("#mns").value.trim() : "") : st.series;
      const n = ser ? meetings().filter((m) => m.series === ser).length + 1 : 0;
      const pendingN = ser ? openTasks(ser).length : 0;
      const keep = { title: $("#mt") ? $("#mt").value : "", att: $("#ma") ? $("#ma").value : "", ag: $("#mag") ? $("#mag").value : "", ns: $("#mns") ? $("#mns").value : "" };
      const autoTitle = ser ? `${ser} · #${n}` : "";
      const sh = sheet(`<h3>${opts.importName ? "Import meeting recording" : "New meeting"}</h3><p class="sub">${opts.importName ? `“${esc(opts.importName)}”` : "Memora records it and prepares the summary, minutes, tasks and email."}</p>
        <div class="field"><label>Type</label><div class="days">${["Official", "Personal"].map((x) => `<button class="day wide ${st.mtype === x ? "on" : ""}" data-ty="${x}">${x}</button>`).join("")}</div></div>
        <div class="field"><label>Series (recurring meeting)</label><div class="days">
          <button class="day wide ${!st.series && !st.newSeries ? "on" : ""}" data-se="">One-off</button>
          ${series.map((x) => `<button class="day wide ${st.series === x && !st.newSeries ? "on" : ""}" data-se="${esc(x)}">${esc(x)}</button>`).join("")}
          <button class="day wide ${st.newSeries ? "on" : ""}" data-se="__new">${ic("plus")} New</button></div>
          ${st.newSeries ? `<input class="inp" id="mns" style="margin-top:8px" placeholder="e.g. Weekly Sales Review" value="${esc(keep.ns)}">` : ""}
          ${pendingN ? `<div class="meta" style="margin-top:8px;color:var(--gold)">${pendingN} open follow-up${pendingN > 1 ? "s" : ""} from this series will be checked in this meeting.</div>` : ""}</div>
        <div class="field"><label>Title</label><input class="inp" id="mt" placeholder="e.g. Q4 planning with client" value="${esc(keep.title || autoTitle)}"></div>
        <div class="field"><label>Attendees</label><input class="inp" id="ma" placeholder="Names, comma separated (optional)" value="${esc(keep.att)}"></div>
        <div class="field"><label>Agenda</label><textarea class="inp" id="mag" placeholder="One item per line (optional — AI finds it if empty)">${esc(keep.ag)}</textarea></div>
        <button class="btn gold block" data-go>${opts.importName ? ic("upload") + " Import & prepare" : ic("mic") + " Start recording"}</button>`);
      $$("[data-ty]", sh).forEach((b) => (b.onclick = () => { st.mtype = b.dataset.ty; draw(); }));
      $$("[data-se]", sh).forEach((b) => (b.onclick = () => {
        const v = b.dataset.se;
        const prevAuto = $("#mt").value === autoTitle;
        if (v === "__new") { st.newSeries = true; st.series = ""; } else { st.newSeries = false; st.series = v; }
        if (prevAuto) $("#mt").value = "";
        draw();
      }));
      const ns = $("#mns", sh);
      if (ns) ns.oninput = () => { const v = ns.value.trim(); const mt = $("#mt"); if (!mt.dataset.touched) mt.value = v ? `${v} · #${meetings().filter((m) => m.series === v).length + 1}` : ""; };
      $("#mt", sh).oninput = (e) => (e.target.dataset.touched = "1");
      $("[data-go]", sh).onclick = () => {
        const seriesName = st.newSeries ? ($("#mns").value.trim()) : st.series;
        const info = {
          title: $("#mt").value.trim() || (seriesName ? `${seriesName} · #${meetings().filter((m) => m.series === seriesName).length + 1}` : `${st.mtype} meeting`), titleAuto: !$("#mt").value.trim(),
          mtype: st.mtype, series: seriesName, attendees: $("#ma").value.trim(), agenda: $("#mag").value.trim(),
        };
        closeSheet();
        if (opts.importName) {
          const s = newMeeting(info, "import");
          s.importedName = opts.importName; save();
          overlay("Importing recording", opts.importName);
          A.importPending(s.id);
        } else startMeeting(info);
      };
    };
    draw();
  }
  function newMeeting(info, source) {
    const now = new Date();
    const s = Object.assign({
      id: "m" + uid(), segment: "meeting", date: now.toISOString(), dateLabel: `${fmtDay(now.toISOString())}, ${fmtDate(now.toISOString())}`,
      durationMs: 0, status: source === "import" ? "importing" : "recording", source: source || "recorded", photos: [], bookmarks: [],
    }, info);
    db.sessions.push(s); save();
    return s;
  }
  function startMeeting(info) {
    if (!A.hasPerm("mic")) { pendingStart = () => startMeeting(info); A.requestPerms(); toast("Allow the microphone to record"); return; }
    const r = rec();
    if (r.state !== "idle") { go("record", { id: r.sid }); return; }
    const s = newMeeting(info, "rec");
    startedAt = Date.now();
    if (!A.recStart(s.id, s.title, db.settings.mic || "standard")) { toast("Could not start the microphone"); return; }
    go("record", { id: s.id });
  }

  // ---------- meetings home
  let lineTab = "";
  VIEWS.meetings = () => {
    const r = rec();
    const ms = meetings();
    const cs = clarityStats();
    const next = openTasks().slice().sort((a, b) => (isOverdue(b) - isOverdue(a)) || (a.due || "9999").localeCompare(b.due || "9999")).slice(0, 4);
    const np = nearPlan();
    let hero;
    if (r.state !== "idle" && r.sid) {
      const s = sess(r.sid);
      hero = `<div class="card now"><div class="eyebrow"><span class="recdot pulse" style="background:#fff;box-shadow:none"></span> ${r.state === "paused" ? "On break" : "Recording now"}</div>
        <h3>${esc(s ? s.title : "Recording")}</h3><div class="meta">${clock(r.elapsed)} recorded</div>
        <button class="btn gold block" data-resume>${ic("mic")} Return to recording</button></div>`;
    } else if (np) {
      hero = `<div class="card now"><div class="eyebrow"><span class="dot"></span>${new Date(np.at) > new Date() ? "Up next · " : "Now · "}${hm(np.at)}</div>
        <h3>${esc(np.title)}</h3><div class="meta">${np.attendees ? esc(np.attendees) + " · " : ""}${planTasks(np).length} open items · ${topicsOf(np).length} topics</div>
        <button class="btn gold block" data-quickm>${ic("mic")} Record this meeting</button>
        <button class="btn small line block" style="margin-top:10px" data-brief="${np.id}">Open the brief</button></div>`;
    } else {
      hero = `<div class="card now"><div class="eyebrow"><span class="dot"></span>One tap</div>
        <h3>Press record. Memora does the rest.</h3><div class="meta">Title, people, minutes, tasks, follow-ups, reminders and the email — all from the recording.</div>
        <button class="btn gold block" data-quickm>${ic("mic")} Record now</button>
        <button class="btn small line block" style="margin-top:10px" data-newm>Add details first</button></div>`;
    }
    const lu = lineup();
    const tabs = [["today", "Today"], ["week", "This week"], ["next", "Next week"]].concat(lu.later.length ? [["later", "Later"]] : []);
    const lt = lineTab || (lu.today.length ? "today" : lu.week.length ? "week" : lu.next.length ? "next" : "today");
    const memos = (db.memos || []).filter((m) => !m.done && (!m.date || m.date <= new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10))).slice(-4).reverse();
    const c = db.clarity && db.clarity.data;
    return `<div class="top">${LOGO}<div style="display:flex;gap:6px"><button class="iconbtn" data-import title="Import">${ic("upload")}</button><button class="iconbtn" data-nav2="settings" title="Settings">${ic("gear")}</button></div></div>
      ${segSwitch("meet")}
      ${hero}
      <button class="card clar" data-clarity><div class="eyebrow">${ic("spark")} My clarity ${clarBusy ? "· updating…" : ""}</div>
        <div class="clh">${c ? esc(c.headline || "") : ms.length ? "Tap to see where your work stands and what to do next." : "Your clarity builds up as you record meetings."}</div>
        ${c && (c.focus || []).length ? `<div class="clf">${ic("right")} ${esc(c.focus[0])}</div>` : ""}</button>
      <div class="stats four">
        <button class="stat" data-go-tasks="open"><b>${cs.open}</b><span>Open</span></button>
        <button class="stat ${cs.pending ? "warn" : ""}" data-go-tasks="pending"><b>${cs.pending}</b><span>Pending</span></button>
        <button class="stat ${cs.overdue ? "warn" : ""}" data-go-tasks="open"><b>${cs.overdue}</b><span>Overdue</span></button>
        <button class="stat" data-go-tasks="done"><b>${cs.closedWeek}</b><span>Done</span></button>
      </div>
      <h2 class="sec">Lineup <button data-addplan>${ic("plus")} Add</button></h2>
      <div class="langs" style="margin-top:0">${tabs.map(([k, l]) => `<button class="lang ${lt === k ? "on" : ""}" data-lt="${k}">${l}${lu[k].length ? " · " + lu[k].length : ""}</button>`).join("")}</div>
      <div class="list" style="margin-top:8px">${lu[lt].map(planItem).join("") || `<div class="card empty" style="padding:16px">${lt === "today" ? "Nothing planned today." : "Nothing planned yet."} <button class="lnk" data-addplan>Add a meeting</button> — Memora reminds you with a brief before it starts.</div>`}</div>
      ${memos.length ? `<h2 class="sec">Don't forget</h2><div class="card" style="padding:6px 14px">${memos.map((m) => `<div class="agi"><button class="chip gold" data-memo="${m.id}">${m.date ? fmtDue(m.date) : ic("check")}</button><div><b>${esc(m.text)}</b>${sess(m.meetingId) ? `<span>${esc(sess(m.meetingId).title)}</span>` : ""}</div></div>`).join("")}</div>` : ""}
      ${next.length ? `<h2 class="sec">Follow up next <button data-go-tasks2="follow">By person</button></h2><div class="tklist">${next.map((t) => ticketRow(t, true)).join("")}</div>` : ""}
      <h2 class="sec">Recent meetings ${ms.length ? `<button data-nav2="mlibrary">See all</button>` : ""}</h2>
      ${ms.length ? `<div class="list">${ms.slice(0, 4).map(meetingItem).join("")}</div>` : `<div class="card empty"><div class="big">No meetings yet</div>Tap Record now when your next meeting begins, or import a recording.</div>`}
      <button class="btn line block" style="margin-top:12px" data-import>${ic("upload")} Import a recording</button>`;
  };
  BIND.meetings = (app) => {
    bindSeg(app); bindOpen(app); bindTickets(app);
    $$("[data-quickm]", app).forEach((b) => (b.onclick = () => quickMeeting()));
    $$("[data-newm]", app).forEach((b) => (b.onclick = () => meetingSetup()));
    $$("[data-brief]", app).forEach((b) => (b.onclick = () => go("brief", { id: b.dataset.brief })));
    $$("[data-addplan]", app).forEach((b) => (b.onclick = () => lineupSheet(null)));
    $$("[data-lt]", app).forEach((b) => (b.onclick = () => { lineTab = b.dataset.lt; render(); }));
    $$("[data-memo]", app).forEach((b) => (b.onclick = () => memoDone(b.dataset.memo)));
    $$("[data-clarity]", app).forEach((b) => (b.onclick = () => go("clarity")));
    $$("[data-resume]", app).forEach((b) => (b.onclick = () => go("record", { id: rec().sid })));
    $$("[data-import]", app).forEach((b) => (b.onclick = () => A.pickAudio()));
    $$("[data-nav2]", app).forEach((b) => (b.onclick = () => go(b.dataset.nav2)));
    $$("[data-go-tasks],[data-go-tasks2]", app).forEach((b) => (b.onclick = () => { taskTab = b.dataset.goTasks || b.dataset.goTasks2; go("tasks"); }));
  };
  function memoDone(id) {
    const m = (db.memos || []).find((x) => x.id === id); if (!m) return;
    m.done = !m.done; save(); toast(m.done ? "Marked done" : "Back on your list"); render();
  }

  // ---------- meetings library
  let mFilter = "", mQ = "";
  VIEWS.mlibrary = () => {
    const series = seriesList();
    const q = mQ.toLowerCase();
    const list = meetings().filter((m) => (!mFilter || m.series === mFilter) && (!q || m.title.toLowerCase().includes(q) || (m.attendees || "").toLowerCase().includes(q)));
    return `<div class="top"><div class="brand">Meetings</div><button class="iconbtn" data-newm>${ic("plus")}</button></div>
      <div class="search">${ic("search")}<input id="mq" placeholder="Search meetings or people" value="${esc(mQ)}"></div>
      ${series.length ? `<div class="langs"><button class="lang ${!mFilter ? "on" : ""}" data-f="">All</button>${series.map((x) => `<button class="lang ${mFilter === x ? "on" : ""}" data-f="${esc(x)}">${esc(x)}</button>`).join("")}</div>` : ""}
      <div class="list" style="margin-top:10px">${list.map(meetingItem).join("") || `<div class="empty">No meetings here yet.</div>`}</div>`;
  };
  BIND.mlibrary = (app) => {
    bindOpen(app);
    $("[data-newm]", app).onclick = () => meetingSetup();
    $$("[data-f]", app).forEach((b) => (b.onclick = () => { mFilter = b.dataset.f; render(); }));
    const q = $("#mq", app);
    q.oninput = () => { mQ = q.value; const pos = q.selectionStart; render(); const n = $("#mq"); n.focus(); n.setSelectionRange(pos, pos); };
  };

  // ---------- tasks
  let taskTab = "open", tFilter = "", tOwner = "", tMgr = false;
  VIEWS.tasks = () => {
    const series = seriesList();
    const base = db.tickets.filter((t) => (!tFilter || (tFilter === "__none" ? !t.series : t.series === tFilter)) && (!tMgr || t.manager));
    const open = base.filter((t) => t.status === "open" && !t.pending), pend = base.filter(isPending), done = base.filter((t) => t.status === "done");
    const own = (l) => l.filter((t) => !tOwner || t.owner === tOwner);
    const byDue = (a, b) => (isOverdue(b) - isOverdue(a)) || ((b.priority === "high") - (a.priority === "high")) || (a.due || "9999").localeCompare(b.due || "9999");
    const owners = Array.from(new Set((taskTab === "pending" ? pend : taskTab === "done" ? done : open).map((t) => t.owner).filter(Boolean))).sort();
    let body;
    if (taskTab === "follow") {
      const g = followGroups().filter(([, l]) => l.some((t) => base.includes(t)));
      body = g.map(([who, l]) => { l = l.filter((t) => base.includes(t)); return `<div class="card fg"><div class="fgh"><div class="av">${esc(who.charAt(0).toUpperCase())}</div><div class="tx"><b>${esc(who)}</b><span>${l.length} item${l.length > 1 ? "s" : ""}${l.filter(isOverdue).length ? " · " + l.filter(isOverdue).length + " overdue" : ""}${l.filter(isPending).length ? " · " + l.filter(isPending).length + " pending" : ""}</span></div>${who !== "Me" && who !== "Unassigned" ? `<button class="btn small line" data-fmsg="${esc(who)}">${ic("share")} Follow up</button>` : ""}</div>
        <div class="tklist">${l.sort(byDue).map((t) => ticketRow(t, true)).join("")}</div></div>`; }).join("") || `<div class="empty">Nobody to chase — everything open is moving.</div>`;
    } else {
      const list = own(taskTab === "pending" ? pend : taskTab === "done" ? done : open).sort(taskTab === "done" ? (a, b) => (b.doneAt || "").localeCompare(a.doneAt || "") : byDue);
      body = `<div class="tklist">${list.map((t) => ticketRow(t, true)).join("") || `<div class="empty">${taskTab === "open" ? "Nothing open. Tasks from your meetings appear here automatically — or add one with +." : taskTab === "pending" ? "Nothing stuck. Tasks that are blocked show here with the reason and who to chase." : "Completed tasks and their history appear here."}</div>`}</div>`;
    }
    return `<div class="top"><div class="brand">Tasks</div><button class="iconbtn" data-addt>${ic("plus")}</button></div>
      <div class="segs four"><button class="seg ${taskTab === "open" ? "on" : ""}" data-tt="open">Open · ${open.length}</button><button class="seg ${taskTab === "pending" ? "on" : ""}" data-tt="pending">Pending · ${pend.length}</button><button class="seg ${taskTab === "follow" ? "on" : ""}" data-tt="follow">Follow up</button><button class="seg ${taskTab === "done" ? "on" : ""}" data-tt="done">Done · ${done.length}</button></div>
      <div class="langs" style="margin-top:-6px"><button class="lang ${tMgr ? "on" : ""}" data-mgr>${ic("flag")} For manager</button>${series.length ? `<button class="lang ${!tFilter ? "on" : ""}" data-f="">All</button>${series.map((x) => `<button class="lang ${tFilter === x ? "on" : ""}" data-f="${esc(x)}">${esc(x)}</button>`).join("")}<button class="lang ${tFilter === "__none" ? "on" : ""}" data-f="__none">One-off</button>` : ""}</div>
      ${taskTab !== "follow" && (owners.length > 1 || tOwner) ? `<div class="langs" style="margin-top:2px"><button class="lang ${!tOwner ? "on" : ""}" data-ow="">${ic("users")} Everyone</button>${owners.map((o) => `<button class="lang ${tOwner === o ? "on" : ""}" data-ow="${esc(o)}">${esc(o)}</button>`).join("")}</div>` : ""}
      <div style="margin-top:10px">${body}</div>
      ${taskTab === "open" && open.length ? `<p class="tip">Tap the circle to mark done. Tap a task to mark it pending with the reason — Memora checks it again in the next meeting with those people.</p>` : ""}`;
  };
  BIND.tasks = (app) => {
    bindTickets(app);
    $("[data-addt]", app).onclick = () => ticketSheet(null, { series: tFilter && tFilter !== "__none" ? tFilter : "" });
    $$("[data-tt]", app).forEach((b) => (b.onclick = () => { taskTab = b.dataset.tt; tOwner = ""; render(); }));
    $$("[data-f]", app).forEach((b) => (b.onclick = () => { tFilter = b.dataset.f; render(); }));
    $$("[data-ow]", app).forEach((b) => (b.onclick = () => { tOwner = b.dataset.ow; render(); }));
    $$("[data-mgr]", app).forEach((b) => (b.onclick = () => { tMgr = !tMgr; render(); }));
    $$("[data-fmsg]", app).forEach((b) => (b.onclick = () => { const g = followGroups().find(([w]) => w === b.dataset.fmsg); if (g) A.shareText(followMsg(g[0], g[1])); }));
  };

  // ---------- meeting detail
  let mTab = "summary";
  function meetingView(s) {
    const st = status(s);
    const ready = A.exists(s.id, "summary.md");
    const hasAudio = A.exists(s.id, "summary_audio.m4a");
    const agenda = J(A.readText(s.id, "agenda.json"), []);
    const mine = db.tickets.filter((t) => t.meetingId === s.id);
    const followed = db.tickets.filter((t) => (t.followedIn || []).includes(s.id));
    let body = "";
    if (mTab === "summary") {
      const md = A.readText(s.id, "summary.md");
      const ag = agenda.length ? `<div class="card" style="margin-bottom:14px;padding:12px 14px"><div class="eyebrow" style="margin-bottom:8px">Agenda</div>${agenda.map((a) => `<div class="agi"><span class="chip ${a.status === "done" ? "ok" : a.status === "partial" ? "gold" : "err"}">${a.status === "done" ? "Done" : a.status === "partial" ? "Partly" : "Pending"}</span><div><b>${esc(a.item)}</b>${a.note ? `<span>${esc(a.note)}</span>` : ""}</div></div>`).join("")}</div>` : "";
      body = md ? ag + `<div class="md">${mdHtml(md)}</div>` : `<div class="empty"><div class="big">Summary appears here</div>Key points, decisions, risks and next steps.</div>`;
    } else if (mTab === "insights") {
      body = insightsBody(s);
    } else if (mTab === "mom") {
      const md = A.readText(s.id, "mom.md");
      body = md ? `<div class="md">${mdHtml(md)}</div><button class="btn line block" style="margin-top:14px" data-copymom>${ic("copy")} Copy minutes</button>` : `<div class="empty">Minutes of meeting appear after processing.</div>`;
    } else if (mTab === "tasks") {
      body = `<div class="tklist">${mine.map((t) => ticketRow(t, false)).join("") || `<div class="empty">No tasks from this meeting yet.</div>`}</div>
        <button class="btn line block" style="margin-top:10px" data-addmt>${ic("plus")} Add task</button>
        ${followed.length ? `<h2 class="sec">Follow-ups discussed here</h2><div class="tklist">${followed.map((t) => ticketRow(t, true)).join("")}</div>` : ""}`;
    } else if (mTab === "email") {
      const em = Object.assign({ subject: "", body: "" }, J(A.readText(s.id, "email.json"), {}), s.emailEdit || {});
      body = em.body ? `<div class="field"><label>To</label><input class="inp" id="eto" placeholder="email@company.com, … (optional)" value="${esc(s.emailTo || "")}"></div>
        <div class="field"><label>Subject</label><input class="inp" id="esub" value="${esc(em.subject)}"></div>
        <div class="field"><label>Message</label><textarea class="inp" id="ebody" style="height:340px;line-height:1.55">${esc(em.body)}</textarea></div>
        <div class="row"><button class="btn line" data-ecopy>${ic("copy")} Copy</button><button class="btn line" data-eshare>${ic("share")} Share</button></div>
        <button class="btn gold block" style="margin-top:8px" data-esend>${ic("mail")} Open in email app</button>
        <p class="tip">Edits are saved automatically.</p>` : `<div class="empty">The email draft appears after processing.</div>`;
    } else if (mTab === "transcript") {
      const t = A.readText(s.id, "transcript.md");
      body = t ? `<div class="md">${mdHtml(t)}</div>` : `<div class="empty">The full transcript with speaker names appears after processing.</div>`;
    }
    const openN = mine.filter((t) => t.status === "open").length;
    return `<button class="back" data-back>${ic("left")} Meetings</button>
      <div class="shead"><div class="eyebrow">${esc(s.mtype || "Official")} meeting${s.series ? " · " + esc(s.series) : ""}</div>
      <h1>${esc(s.title)}</h1><div class="meta"><span>${esc(s.dateLabel || fmtDate(s.date))}</span>${s.durationMs ? `<span>${dur(s.durationMs)}</span>` : ""}${s.attendees ? `<span>${esc(s.attendees)}</span>` : ""}</div>
      ${(() => { const tl = (J(A.readText(s.id, "meta.json"), {}).titles || []).filter((x) => x && x !== s.title); if (s.userTitle && s.userTitle !== s.title && !tl.includes(s.userTitle)) tl.push(s.userTitle); return tl.length && !s.titleLocked ? `<div class="tsugg"><span>${ic("spark")} Title from the recording · other ideas:</span>${tl.slice(0, 4).map((x) => `<button class="lang" data-ttl="${esc(x)}">${esc(x)}</button>`).join("")}<button class="lang" data-tkeep>${ic("check")} Keep</button></div>` : ""; })()}</div>
      <div id="stcard" style="margin-top:16px">${statusCard(s, st)}</div>
      <div class="actions">
        <button class="act hi" data-listen ${ready ? "" : "disabled"}>${ic("head")}${hasAudio ? "Listen" : "Voice"}</button>
        <button class="act" data-pdf ${ready ? "" : "disabled"}>${ic("file")}PDF</button>
        <button class="act" data-mail ${ready ? "" : "disabled"}>${ic("mail")}Email</button>
        <button class="act" data-more>${ic("more")}More</button>
      </div>
      <div class="tabs">
        <button class="tab ${mTab === "summary" ? "on" : ""}" data-mt="summary">Summary</button>
        <button class="tab ${mTab === "insights" ? "on" : ""}" data-mt="insights">Insights</button>
        <button class="tab ${mTab === "mom" ? "on" : ""}" data-mt="mom">Minutes</button>
        <button class="tab ${mTab === "tasks" ? "on" : ""}" data-mt="tasks">Tasks${openN ? " " + openN : ""}</button>
        <button class="tab ${mTab === "email" ? "on" : ""}" data-mt="email">Email</button>
        <button class="tab ${mTab === "transcript" ? "on" : ""}" data-mt="transcript">Transcript</button>
      </div>
      <div id="sbody">${body}</div>`;
  }
  function bindMeeting(app, s) {
    $$("[data-back]", app).forEach((b) => (b.onclick = back));
    bindStatus(app, s); bindTickets(app);
    $$("[data-mt]", app).forEach((b) => (b.onclick = () => { mTab = b.dataset.mt; render(); }));
    $$("#sbody [data-t]", app).forEach((b) => (b.onclick = () => playOriginal(s, Math.max(0, Number(b.dataset.t) - 3000))));
    $$("[data-ttl]", app).forEach((b) => (b.onclick = () => { s.title = b.dataset.ttl; s.titleLocked = true; save(); toast("Title updated"); render(); }));
    $$("[data-tkeep]", app).forEach((b) => (b.onclick = () => { s.titleLocked = true; save(); render(); }));
    $$("#sbody [data-memo]", app).forEach((b) => (b.onclick = () => memoDone(b.dataset.memo)));
    $$("#sbody [data-brief]", app).forEach((b) => (b.onclick = () => go("brief", { id: b.dataset.brief })));
    $$("#sbody [data-addnext]", app).forEach((b) => (b.onclick = () => { const nm = J(A.readText(s.id, "meeting.json"), {}).nextMeeting || {}; let at; if (/^\d{4}-\d{2}-\d{2}$/.test(nm.date || "")) { const [y, mo, d] = nm.date.split("-").map(Number); const [hh, mm] = (/^\d{1,2}:\d{2}$/.test(nm.time || "") ? nm.time : "11:00").split(":").map(Number); at = new Date(y, mo - 1, d, hh, mm).toISOString(); } lineupSheet(null, Object.assign({ title: s.series ? `${s.series} · next` : `Follow-up · ${s.title}`, attendees: nm.with || s.attendees || "", topics: (nm.topics || []).join("\n"), series: s.series || "", fromId: s.id, mtype: s.mtype || "Official" }, at ? { at } : {})); }));
    const L = $("[data-listen]", app); if (L) L.onclick = () => { curLang = ""; listen(s); };
    const pdf = $("[data-pdf]", app); if (pdf) pdf.onclick = () => meetingPdf(s);
    const ml = $("[data-mail]", app); if (ml) ml.onclick = () => { mTab = "email"; render(); };
    $("[data-more]", app).onclick = () => meetingMore(s);
    const cm = $("[data-copymom]", app); if (cm) cm.onclick = () => { A.copyText(A.readText(s.id, "mom.md")); toast("Minutes copied"); };
    const am = $("[data-addmt]", app); if (am) am.onclick = () => ticketSheet(null, { meetingId: s.id, series: s.series || "" });
    const eb = $("#ebody", app);
    if (eb) {
      const keep = () => { s.emailEdit = { subject: $("#esub").value, body: $("#ebody").value }; s.emailTo = $("#eto").value.trim(); save(); };
      ["#eto", "#esub", "#ebody"].forEach((k) => ($(k, app).onchange = keep));
      $("[data-ecopy]", app).onclick = () => { keep(); A.copyText(`Subject: ${$("#esub").value}\n\n${$("#ebody").value}`); toast("Email copied"); };
      $("[data-eshare]", app).onclick = () => { keep(); A.shareText(`${$("#esub").value}\n\n${$("#ebody").value}`); };
      $("[data-esend]", app).onclick = () => { keep(); A.composeEmail($("#eto").value.trim(), $("#esub").value, $("#ebody").value); };
    }
  }
  function meetingMore(s) {
    const hasOrig = !!A.audioName(s.id);
    const sh = sheet(`<h3>${esc(s.title)}</h3><p class="sub">${esc(s.dateLabel || "")}</p>
      ${hasOrig ? `<button class="opt" data-a="orig">${ic("play")}<div class="tx"><b>Play original recording</b><span>The full meeting audio</span></div></button>` : ""}
      ${hasOrig ? (A.exists(s.id, "clean_audio.m4a") ? `<button class="opt" data-a="cleanplay">${ic("spark")}<div class="tx"><b>Play clean recording</b><span>Noise, silences & side talk removed</span></div></button>` : `<button class="opt" data-a="clean">${ic("spark")}<div class="tx"><b>Make a clean recording</b><span>Removes noise, silences & side talk</span></div></button>`) : ""}
      <button class="opt" data-a="dl">${ic("down")}<div class="tx"><b>Download</b><span>Voice recap, recording, minutes, transcript</span></div></button>
      <button class="opt" data-a="plan">${ic("cal")}<div class="tx"><b>Add next meeting to lineup</b><span>Reminder 10 min before with a brief</span></div></button>
      <button class="opt" data-a="edit">${ic("edit")}<div class="tx"><b>Edit details</b><span>Title, type, series, attendees, agenda</span></div></button>
      ${hasOrig ? `<button class="opt" data-a="regen">${ic("refresh")}<div class="tx"><b>Re-create outputs</b><span>Run the AI again (uses the latest agenda & attendees)</span></div></button>` : ""}
      <button class="opt red" data-a="del">${ic("trash")}<div class="tx"><b>Delete meeting</b><span>Removes recording and outputs (tasks stay)</span></div></button>`);
    $$("[data-a]", sh).forEach((b) => (b.onclick = () => {
      const a = b.dataset.a; closeSheet();
      if (a === "orig") playOriginal(s, 0);
      else if (a === "dl") downloadSheet(s);
      else if (a === "edit") editMeeting(s);
      else if (a === "plan") { const d = new Date(Date.now() + 7 * 86400000); d.setHours(new Date(s.date).getHours(), new Date(s.date).getMinutes(), 0, 0); lineupSheet(null, { at: d.toISOString(), title: s.series ? `${s.series} · next` : `Follow-up · ${s.title}`, attendees: s.attendees || "", series: s.series || "", fromId: s.id, mtype: s.mtype || "Official", topics: J(A.readText(s.id, "agenda.json"), []).filter((x) => x.status !== "done").map((x) => x.item).join("\n") }); }
      else if (a === "clean") { A.process(s.id, "experience", "clean", "", false); toast("Cleaning… you can leave this screen"); setTimeout(render, 300); }
      else if (a === "cleanplay") A.playLoad(`${A.sessionPath(s.id)}/clean_audio.m4a`, s.title, "Clean recording", 0);
      else if (a === "regen") confirmSheet("Re-create the outputs?", "Summary, minutes, tasks and email will be made again. Tasks you edited or closed are kept.", "Re-create", false, () => { resetMeetingTickets(s); A.process(s.id, "summary", "", "", true); setTimeout(render, 300); });
      else if (a === "del") confirmSheet("Delete this meeting?", "The recording and its outputs are removed from your phone. Its tasks stay in your task list.", "Delete", true, () => {
        A.playStop(); A.deleteSession(s.id); db.sessions = db.sessions.filter((x) => x.id !== s.id); save(); back();
      });
    }));
  }
  function editMeeting(s) {
    const series = seriesList();
    const sh = sheet(`<h3>Edit meeting</h3>
      <div class="field"><label>Title</label><input class="inp" id="et" value="${esc(s.title)}"></div>
      <div class="field"><label>Type</label><select class="inp" id="ety">${["Official", "Personal"].map((x) => `<option ${x === s.mtype ? "selected" : ""}>${x}</option>`).join("")}</select></div>
      <div class="field"><label>Series</label><input class="inp" id="ese" list="serl" value="${esc(s.series || "")}" placeholder="One-off"><datalist id="serl">${series.map((x) => `<option value="${esc(x)}">`).join("")}</datalist></div>
      <div class="field"><label>Attendees</label><input class="inp" id="eat" value="${esc(s.attendees || "")}"></div>
      <div class="field"><label>Agenda</label><textarea class="inp" id="eag">${esc(s.agenda || "")}</textarea></div>
      <button class="btn gold block" data-ok>Save</button>`);
    $("[data-ok]", sh).onclick = () => {
      if ($("#et").value.trim() && $("#et").value.trim() !== s.title) s.titleLocked = true;
      s.title = $("#et").value.trim() || s.title; s.mtype = $("#ety").value; s.series = $("#ese").value.trim();
      s.attendees = $("#eat").value.trim(); s.agenda = $("#eag").value.trim();
      db.tickets.forEach((t) => { if (t.meetingId === s.id) t.series = s.series; });
      save(); closeSheet(); render();
    };
  }
  function meetingPdf(s) {
    const mom = A.readText(s.id, "mom.md"), sum = A.readText(s.id, "summary.md");
    const tk = db.tickets.filter((t) => t.meetingId === s.id);
    const extra = tk.length ? `\n\n## Task tracker (current status)\n\n| Task | Owner | Due | Status |\n|---|---|---|---|\n${tk.map((t) => `| ${t.text.replace(/\|/g, "/")} | ${t.owner || "—"} | ${t.due ? fmtDue(t.due) : "—"} | ${t.status === "done" ? "Done" : t.pending ? "Pending" + (t.pending.reason ? " — " + t.pending.reason.replace(/\|/g, "/") : "") : "Open"} |`).join("\n")}` : "";
    makePdf(s, "", (mom || "") + "\n\n---\n\n" + (sum || "") + extra, "MEETING MINUTES");
  }


  // ------------------------------------------------------------------ start / record
  function pickSubject(cb, title, sub) {
    const list = db.subjects.map((s) => `<button class="opt" data-s="${s.id}"><span class="dot8" style="background:${s.color};width:12px;height:12px"></span><div class="tx"><b>${esc(s.name)}</b><span>${s.teacher ? esc(s.teacher) + " · " : ""}next: Class ${nextClassNo(s.id)}</span></div></button>`).join("");
    const sh = sheet(`<h3>${esc(title)}</h3><p class="sub">${esc(sub)}</p>${list}
      <button class="opt" data-s="__general"><span class="dot8" style="background:#8A8794;width:12px;height:12px"></span><div class="tx"><b>General</b><span>Not linked to a subject</span></div></button>
      <button class="btn line block" style="margin-top:14px" data-new>${ic("plus")} New subject</button>`);
    $$("[data-s]", sh).forEach((b) => (b.onclick = () => { closeSheet(); cb(b.dataset.s === "__general" ? "" : b.dataset.s); }));
    $("[data-new]", sh).onclick = () => { closeSheet(); subjectSheet(null, (id) => cb(id)); };
  }

  function newSession(subjectId, source) {
    const sb = subj(subjectId) || GENERAL;
    const n = nextClassNo(subjectId);
    const now = new Date();
    const s = {
      id: "s" + uid(), segment: "education", subjectId: subjectId || "", classNo: n,
      title: `${sb.name} · Class ${n}`, date: now.toISOString(), dateLabel: `${fmtDay(now.toISOString())}, ${fmtDate(now.toISOString())}`,
      durationMs: 0, status: source === "import" ? "importing" : "recording", source: source || "recorded", photos: [], bookmarks: [],
    };
    db.sessions.push(s); save();
    return s;
  }

  let pendingStart = null, startedAt = 0;
  function startClass(subjectId) {
    if (!A.hasPerm("mic")) { pendingStart = () => startClass(subjectId); A.requestPerms(); toast("Allow the microphone to record"); return; }
    const r = rec();
    if (r.state !== "idle") { go("record", { id: r.sid }); return; }
    const s = newSession(subjectId, "rec");
    startedAt = Date.now();
    const ok = A.recStart(s.id, s.title, db.settings.mic || "standard");
    if (!ok) { toast("Could not start the microphone"); return; }
    go("record", { id: s.id });
  }
  window.onPerms = (p) => {
    if (pendingStart && p.mic) { const f = pendingStart; pendingStart = null; f(); }
    else { pendingStart = null; if (TOP.includes(view)) render(); }
  };

  const WAVE_N = 44;
  let waveData = new Array(WAVE_N).fill(0);
  VIEWS.record = () => {
    const s = sess(params.id) || { title: "Class" };
    const sb = subj(s.subjectId) || GENERAL;
    const m = isMeet(s);
    const eyebrow = m ? `<div class="eyebrow">${esc(s.mtype || "Official")} meeting${s.series ? " · " + esc(s.series) : ""}</div>` : `<div class="eyebrow" style="color:${sb.color}">${esc(sb.name)}${sb.teacher ? " · " + esc(sb.teacher) : ""}</div>`;
    return `<div class="recview" id="recv">
      <button class="back" data-min>${ic("left")} Minimise</button>
      <div class="head">${eyebrow}
      <h1>${esc(s.title)}</h1><div class="meta">${esc(s.dateLabel || "")}</div></div>
      <div class="timer" id="rtimer">00:00</div>
      <div class="recstate" id="rstate"><span class="recdot pulse"></span> Listening</div>
      ${db.settings.noiseClean !== false || db.settings.skipSilence !== false ? `<div class="tip" style="margin-top:6px">${[db.settings.noiseClean !== false ? "Noise clean-up on" : "", db.settings.skipSilence !== false ? "skipping silence" : ""].filter(Boolean).join(" · ")}</div>` : ""}
      <div class="wave" id="wave">${waveData.map(() => "<i></i>").join("")}</div>
      <div class="ctrls">
        <button class="cbtn" data-mark><div class="c">${ic("star")}</div>Important</button>
        <button class="cbtn main" data-pause><div class="c" id="pbtn">${ic("pause")}</div><span id="plabel">Break</span></button>
        <button class="cbtn" data-photo><div class="c">${ic("cam")}</div>${m ? "Photo" : "Board"}</button>
      </div>
      <div class="marks" id="marks"></div>
      <div class="foot"><button class="btn danger block" data-stop>${ic("stop")} End ${m ? "meeting" : "class"}</button>
      <div class="tip">You can lock the phone — recording continues.<br>Tap Break during breaks and Resume when ${m ? "the meeting" : "class"} restarts.</div></div></div>`;
  };
  BIND.record = (app) => {
    $("[data-min]", app).onclick = () => go(home());
    $("[data-pause]", app).onclick = () => { const r = rec(); if (r.state === "recording") A.recPause(); else if (r.state === "paused") A.recResume(); setTimeout(() => tick(true), 250); };
    $("[data-mark]", app).onclick = () => {
      const r = rec(); if (r.state === "idle") return;
      A.recMark("");
      if (navigator.vibrate) navigator.vibrate(30);
      const sh = sheet(`<h3>⭐ Marked at ${clock(r.elapsed)}</h3><p class="sub">Memora will highlight this part in your notes. Add a short note if you like (optional).</p>
        <div class="field"><input class="inp" id="mnote" placeholder="e.g. exam question, formula"></div>
        <div class="row"><button class="btn line" data-x>Done</button><button class="btn gold" data-ok>Save note</button></div>`);
      $("[data-x]", sh).onclick = closeSheet;
      $("[data-ok]", sh).onclick = () => { const v = $("#mnote").value.trim(); if (v) A.recNoteLast(v); closeSheet(); toast("Note saved"); };
    };
    $("[data-photo]", app).onclick = () => photoSheet(params.id);
    const m = isMeet(sess(params.id));
    $("[data-stop]", app).onclick = () => confirmSheet(m ? "End this meeting?" : "End this class?", m ? "Memora will save the recording and prepare the summary, minutes, tasks and email draft." : "Memora will save the recording and start preparing your notes and voice recap.", m ? "End meeting" : "End class", true, stopClass);
  };

  function photoSheet(sid) {
    const sh = sheet(`<h3>Add a board photo</h3><p class="sub">Photos are attached to this class at the current time and included in the PDF.</p>
      <button class="opt" data-cam>${ic("cam")}<div class="tx"><b>Take photo</b><span>Open the camera</span></div></button>
      <button class="opt" data-gal>${ic("image")}<div class="tx"><b>Choose from gallery</b><span>Pick an existing picture</span></div></button>`);
    $("[data-cam]", sh).onclick = () => { closeSheet(); A.takePhoto(sid); };
    $("[data-gal]", sh).onclick = () => { closeSheet(); A.pickPhoto(sid); };
  }
  window.onPhoto = (sid, name) => {
    const s = sess(sid); if (!s) return;
    const r = rec();
    s.photos = s.photos || [];
    s.photos.push({ name, t: r.sid === sid ? r.elapsed : null });
    save(); toast("Photo added");
    if (view === "session" && params.id === sid) render();
  };

  let stopping = null;
  function stopClass() {
    const r = rec();
    stopping = r.sid;
    overlay(isMeet(sess(r.sid)) ? "Saving your meeting" : "Saving your class", "Joining the recording…");
    A.recStop();
  }
  function afterSaved(sid, ms) {
    const s = sess(sid); if (!s) return;
    s.durationMs = ms || s.durationMs;
    s.status = "saved";
    s.bookmarks = J(A.readText(sid, "bookmarks.json"), []);
    save();
    overlay(null);
    maybeProcess(s);
    go("session", { id: sid }, true);
    hist = [[home(), {}]];
  }
  function maybeProcess(s) {
    if ((db.settings.autoProcess || isMeet(s)) && db.settings.apiKey) A.process(s.id, "summary", "", "", false);
  }

  window.onRecovered = (sid, ms) => {
    const s = sess(sid); if (!s) return;
    s.durationMs = ms; s.status = "saved"; s.bookmarks = J(A.readText(sid, "bookmarks.json"), []); save();
    if (ms > 0) toast("Recovered an unfinished recording: " + s.title);
    render();
  };

  // ------------------------------------------------------------------ import
  window.onImportReady = (name) => {
    if (segOf() === "meet") { meetingSetup({ importName: name }); return; }
    pickSubject((id) => {
      const s = newSession(id, "import");
      s.importedName = name; save();
      overlay("Importing recording", name);
      A.importPending(s.id);
    }, "Import recording", `“${name}” — which subject is it for? Memora will number it as the next class.`);
  };
  window.onImported = (sid, r) => {
    overlay(null);
    const s = sess(sid); if (!s) return;
    if (!r.ok) { toast(r.msg || "Import failed"); db.sessions = db.sessions.filter((x) => x.id !== sid); A.deleteSession(sid); save(); render(); return; }
    s.durationMs = r.durationMs; s.status = "saved"; save();
    maybeProcess(s);
    go("session", { id: sid });
  };

  // ------------------------------------------------------------------ session
  let curLang = "", curTab = "notes";
  function mdHtml(md) {
    let h = window.marked ? window.marked.parse(md || "") : "<pre>" + esc(md) + "</pre>";
    // clickable timestamps: [12:30], (≈ 12:30), [1:02:03]
    h = h.replace(/\[(\d{1,2}:)?(\d{1,2}):(\d{2})\]|\(≈\s*((\d{1,2}:)?\d{1,2}:\d{2})\)/g, (m) => {
      const t = m.replace(/[\[\]()≈\s]/g, "");
      const p = t.split(":").map(Number);
      const ms = (p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + p[1]) * 1000;
      return `<button class="ts" data-t="${ms}">${t}</button>`;
    });
    return h;
  }
  if (window.marked) {
    window.marked.use({ gfm: true, breaks: false, renderer: { html(t) { return esc(typeof t === "string" ? t : (t && t.text) || ""); } } });
  }
  function translations(sid) {
    return LANGS.filter((l) => A.exists(sid, `summary_${l[0]}.md`)).map((l) => l[0]);
  }
  const notesFile = (code) => (code ? `summary_${code}.md` : "summary.md");
  const audioFile = (code) => (code ? `summary_audio_${code}.m4a` : "summary_audio.m4a");
  const fileBase = (s) => `${s.title.replace(/·/g, "-")} - ${fmtDate(s.date)}`;

  function statusCard(s, st) {
    if (st.k === "proc" && /^(experience|quiz)/.test(st.job || "")) return "";
    if (st.k === "err" && /^experience/.test(st.job || "") && A.exists(s.id, "summary.md")) return "";
    if (st.k === "rec") return `<div class="card status"><span class="recdot pulse"></span><div><b>${st.label}…</b><span>Notes will be prepared when the class ends.</span></div></div>
      <button class="btn gold block" style="margin-top:10px" data-gorec>${ic("mic")} Open recorder</button>`;
    if (st.k === "proc") return `<div class="card"><div class="status"><div class="spin" style="width:30px;height:30px;flex:none"></div><div><b>${esc(st.label)}</b><span>${st.started ? clock(Date.now() - st.started) + " elapsed · " : ""}${Math.round((st.p || 0) * 100)}% · you can close the app — it keeps working.</span></div></div>
      ${st.stuck ? `<div class="stuck">${ic("bolt")}<span>No progress for a while — it may be stuck.</span><button class="btn small line" data-unstick>Stop</button></div>` : ""}
      <div class="bar"><i style="width:${Math.max(4, Math.round(st.p * 100))}%"></i></div></div>`;
    if (st.k === "err") return `<div class="card"><div class="status">${ic("bolt")}<div><b>Couldn't finish</b><span>${esc(st.err)}</span></div></div>
      <div class="row" style="margin-top:14px"><button class="btn small line" data-gokey>Settings</button><button class="btn small gold" data-retry>${ic("refresh")} Retry</button></div></div>`;
    if (st.k === "saved") {
      if (!db.settings.apiKey) return `<div class="card"><div class="status">${ic("key")}<div><b>Recording saved ✓</b><span>Add your free AI key to turn it into detailed notes, a PDF and a voice recap.</span></div></div>
        <button class="btn gold block" style="margin-top:14px" data-gokey>${ic("key")} Add free AI key</button></div>`;
      return `<div class="card"><div class="status">${ic("spark")}<div><b>Recording saved ✓</b><span>Create detailed notes, transcript, PDF and voice recap.</span></div></div>
        <button class="btn gold block" style="margin-top:14px" data-retry>${ic("spark")} Create notes now</button></div>`;
    }
    if (st.k === "ready" && st.err) return `<div class="card"><div class="status">${ic("bolt")}<div><b>Heads up</b><span>${esc(st.err)}</span></div></div>
      <div class="row" style="margin-top:12px"><button class="btn small line" data-dismiss>Dismiss</button><button class="btn small line" data-tts>Voice settings</button></div></div>`;
    return "";
  }

  VIEWS.session = () => {
    const s = sess(params.id);
    if (isMeet(s)) return meetingView(s);
    if (!s) return `<button class="back" data-back>${ic("left")} Back</button><div class="empty">This class was deleted.</div>`;
    const sb = subj(s.subjectId) || GENERAL;
    const st = status(s);
    const ready = A.exists(s.id, "summary.md");
    const tr = translations(s.id);
    if (curLang && !tr.includes(curLang) && !(st.k === "proc" && (st.job || "").endsWith(":" + curLang))) curLang = "";
    const hasAudio = A.exists(s.id, audioFile(curLang)) || (!curLang && A.exists(s.id, "replay_audio.m4a"));
    const hasOrig = !!A.audioName(s.id);
    const marks = s.bookmarks || [];
    const photos = s.photos || [];
    let body = "";
    if (curTab === "notes") {
      const md = A.readText(s.id, notesFile(curLang));
      body = md ? `<div class="md">${mdHtml(md)}</div>` : (ready && curLang ? `<div class="empty">Translating to ${langName(curLang)}…</div>` : `<div class="empty"><div class="big">Notes appear here</div>Detailed, topic-by-topic notes with every point from the class.</div>`);
    } else if (curTab === "transcript") {
      const t = A.readText(s.id, "transcript.md");
      body = t ? `<div class="md">${mdHtml(t)}</div>` : `<div class="empty">The full transcript appears after processing. Tap any time-stamp to hear that moment.</div>`;
    } else if (curTab === "marks") {
      body = marks.length ? `<div class="list marklist">${marks.map((m) => `<button class="item" data-t="${m.t}"><div class="ic">${ic("starf")}</div><div class="tx"><div class="t1">${clock(m.t)}</div><div class="t2">${esc(m.note || "Marked important — tap to listen")}</div></div>${ic("play", "chev")}</button>`).join("")}</div>`
        : `<div class="empty">No moments marked. During class, tap ⭐ Important whenever the teacher says something you must not miss.</div>`;
    } else if (curTab === "revise") {
      body = reviseBody(s);
    } else if (curTab === "photos") {
      const base = A.sessionPath(s.id);
      body = `<div class="photos">${photos.map((p) => `<button class="ph" data-ph="${esc(p.name)}"><img src="${fileSrc(s.id, "photos/" + p.name)}">${p.t != null ? `<span>${clock(p.t)}</span>` : ""}</button>`).join("")}
        <button class="ph" data-addph style="display:grid;place-items:center;border:1px dashed var(--line2);color:var(--muted)">${ic("plus")}</button></div>`;
    }
    return `<button class="back" data-back>${ic("left")} ${esc(sb.name)}</button>
      <div class="shead"><div class="eyebrow" style="color:${sb.color}">${esc(sb.name)}${sb.teacher ? " · " + esc(sb.teacher) : ""}</div>
      <h1>${esc(s.title)}</h1><div class="meta"><span>${esc(s.dateLabel || fmtDate(s.date))}</span>${s.durationMs ? `<span>${dur(s.durationMs)}</span>` : ""}${marks.length ? `<span>⭐ ${marks.length}</span>` : ""}</div></div>
      <div id="stcard" style="margin-top:18px">${statusCard(s, st)}</div>
      <div class="actions">
        <button class="act hi" data-listen ${ready ? "" : "disabled"}>${ic("head")}${hasAudio ? "Listen" : "Voice"}</button>
        <button class="act" data-pdf ${ready ? "" : "disabled"}>${ic("file")}PDF</button>
        <button class="act" data-dl ${hasAudio || hasOrig ? "" : "disabled"}>${ic("down")}Download</button>
        <button class="act" data-more>${ic("more")}More</button>
      </div>
      ${ready ? `<div class="langs"><button class="lang ${curLang === "" ? "on" : ""}" data-lang="">${esc(db.settings.summaryLang || "English")}</button>
        ${tr.map((c) => `<button class="lang ${curLang === c ? "on" : ""}" data-lang="${c}">${esc(langName(c))}</button>`).join("")}
        <button class="lang" data-translate>${ic("globe")} Translate</button></div>` : ""}
      ${ready ? `<div id="expwrap">${expCard(s)}</div>` : ""}
      <div class="tabs">
        <button class="tab ${curTab === "notes" ? "on" : ""}" data-tab="notes">Notes</button>
        <button class="tab ${curTab === "transcript" ? "on" : ""}" data-tab="transcript">Transcript</button>
        <button class="tab ${curTab === "marks" ? "on" : ""}" data-tab="marks">Important${marks.length ? " " + marks.length : ""}</button>
        <button class="tab ${curTab === "photos" ? "on" : ""}" data-tab="photos">Photos${photos.length ? " " + photos.length : ""}</button>
        <button class="tab ${curTab === "revise" ? "on" : ""}" data-tab="revise">Revise</button>
      </div>
      <div id="sbody">${body}</div>`;
  };
  BIND.session = (app) => {
    const s = sess(params.id);
    if (isMeet(s)) return bindMeeting(app, s);
    $$("[data-back]", app).forEach((b) => (b.onclick = back));
    if (!s) return;
    bindStatus(app, s);
    $$("[data-tab]", app).forEach((b) => (b.onclick = () => { curTab = b.dataset.tab; render(); }));
    if (curTab === "revise") bindRevise(app, s);
    bindExp(app, s);
    $$("[data-lang]", app).forEach((b) => (b.onclick = () => { curLang = b.dataset.lang; render(); }));
    $$("[data-translate]", app).forEach((b) => (b.onclick = () => translateSheet(s)));
    $$("[data-t]", app).forEach((b) => (b.onclick = () => playOriginal(s, Math.max(0, Number(b.dataset.t) - (b.classList.contains("item") ? 20000 : 3000)))));
    $$("[data-ph]", app).forEach((b) => (b.onclick = () => viewPhoto(s, b.dataset.ph)));
    $$("[data-addph]", app).forEach((b) => (b.onclick = () => photoSheet(s.id)));
    const L = $("[data-listen]", app);
    if (L) L.onclick = () => listen(s);
    const pdf = $("[data-pdf]", app);
    if (pdf) pdf.onclick = () => makePdf(s, curLang);
    const dl = $("[data-dl]", app);
    if (dl) dl.onclick = () => downloadSheet(s);
    $("[data-more]", app).onclick = () => moreSheet(s);
  };
  function retryJob(s, jb) {
    jb = jb || "summary";
    if (jb.startsWith("translate:") || jb.startsWith("taudio:")) { const c = jb.split(":")[1]; A.process(s.id, jb.split(":")[0], c, langName(c), false); }
    else if (jb.startsWith("experience")) A.process(s.id, "experience", jb.split(":")[1] || "all", "", false);
    else if (jb === "audio" || jb === "quiz") A.process(s.id, jb, "", "", false);
    else A.process(s.id, "summary", "", "", false);
  }
  // keeps work moving without the user: resumes jobs cut off by the phone, and re-tries the replay after a voice limit
  let lastAuto = 0;
  function autoContinue() {
    if (Date.now() - lastAuto < 55000 || !db.settings.apiKey) return;
    lastAuto = Date.now();
    const today = todayISO();
    db.sessions.forEach((s) => {
      const j = job(s.id);
      if (j.running) return;
      const rt = J(A.readText(s.id, "retry.json"), null);
      if (rt && rt.at && Date.now() >= rt.at) { A.writeText(s.id, "retry.json", ""); A.process(s.id, "experience", rt.what || "replay", "", false); return; }
      if (j.error && /Stopped before finishing/.test(j.error) && s.autoResumed !== today) { s.autoResumed = today; save(); retryJob(s, j.job); }
    });
  }

  function bindStatus(root, s) {
    $$("[data-retry]", root).forEach((b) => (b.onclick = () => { retryJob(s, job(s.id).job); setTimeout(render, 300); }));
    $$("[data-gokey]", root).forEach((b) => (b.onclick = () => keySheet()));
    $$("[data-unstick]", root).forEach((b) => (b.onclick = () => { A.resetJob(s.id); toast("Stopped — tap Retry to start again"); setTimeout(render, 200); }));
    $$("[data-gorec]", root).forEach((b) => (b.onclick = () => go("record", { id: s.id })));
    $$("[data-dismiss]", root).forEach((b) => (b.onclick = () => { A.writeText(s.id, "status.json", JSON.stringify({ running: false, error: null, stage: "Ready", progress: 1 })); render(); }));
    $$("[data-tts]", root).forEach((b) => (b.onclick = () => A.ttsSettings()));
  }

  function listen(s) {
    const f = audioFile(curLang);
    if (!A.exists(s.id, f) && A.exists(s.id, f + ".preview.m4a")) { A.playLoad(`${A.sessionPath(s.id)}/${f}.preview.m4a`, s.title, "Voice recap (first parts)", 0); toast("Playing the parts ready so far"); return; }
    if (!curLang && !isMeet(s) && !A.exists(s.id, f)) {
      if (A.exists(s.id, "replay_audio.m4a")) { A.playLoad(`${A.sessionPath(s.id)}/replay_audio.m4a`, s.title, "Classroom replay", 0); return; }
      const st = job(s.id);
      if (st.running) { toast("Your audio lesson is being prepared — it will appear here soon"); return; }
    }
    if (A.exists(s.id, f)) {
      A.playLoad(`${A.sessionPath(s.id)}/${f}`, s.title, `Voice recap${curLang ? " · " + langName(curLang) : ""}`, 0);
      return;
    }
    if (curLang) A.process(s.id, "taudio", curLang, langName(curLang), false);
    else A.process(s.id, "audio", "", "", false);
    toast("Recording the voice recap…");
    setTimeout(render, 300);
  }
  function playOriginal(s, ms) {
    const a = A.audioName(s.id);
    if (!a) { toast("Original recording not available"); return; }
    A.playLoad(`${A.sessionPath(s.id)}/${a}`, s.title, "Original recording", ms || 0);
  }
  function viewPhoto(s, name) {
    const v = document.createElement("div");
    v.className = "viewer";
    v.innerHTML = `<img src="${fileSrc(s.id, "photos/" + name)}">`;
    v.onclick = () => v.remove();
    document.body.appendChild(v);
  }

  function translateSheet(s) {
    const tr = translations(s.id);
    const sh = sheet(`<h3>Translate notes</h3><p class="sub">Full notes and the voice recap in another language. Nothing is shortened.</p>
      <div class="langgrid">${LANGS.filter((l) => l[1] !== db.settings.summaryLang).map((l) => `<button data-c="${l[0]}">${esc(l[1])}${l[2] ? `<small>${esc(l[2])}</small>` : ""}${tr.includes(l[0]) ? " ✓" : ""}</button>`).join("")}</div>`);
    $$("[data-c]", sh).forEach((b) => (b.onclick = () => {
      const c = b.dataset.c;
      closeSheet();
      curLang = c; curTab = "notes";
      if (!tr.includes(c)) { A.process(s.id, "translate", c, langName(c), false); toast(`Translating to ${langName(c)}…`); }
      setTimeout(render, 250);
    }));
  }

  function downloadSheet(s) {
    const base = fileBase(s);
    const items = [];
    if (A.exists(s.id, "summary_audio.m4a")) items.push(["summary_audio.m4a", `${base} - Voice recap.m4a`, "Voice recap", db.settings.summaryLang || "English"]);
    translations(s.id).forEach((c) => { if (A.exists(s.id, audioFile(c))) items.push([audioFile(c), `${base} - Voice recap (${langName(c)}).m4a`, "Voice recap", langName(c)]); });
    if (A.exists(s.id, "clean_audio.m4a")) items.push(["clean_audio.m4a", `${base} - Clean recording.m4a`, "Clean recording", "Noise & breaks removed"]);
    if (A.exists(s.id, "replay_audio.m4a")) items.push(["replay_audio.m4a", `${base} - Classroom replay.m4a`, "Classroom replay", "Teacher & student voices"]);
    if (A.exists(s.id, "qabank.md")) items.push(["qabank.md", `${base} - Q&A Bank.md`, "Q&A Bank as text", "Markdown"]);
    if (A.exists(s.id, "classbook.md")) items.push(["classbook.md", `${base} - Class Book.md`, "Class Book as text", "Markdown (use PDF inside the book for print)"]);
    const orig = A.audioName(s.id);
    if (orig) items.push([orig, `${base} - Original recording.${orig.split(".").pop()}`, (isMeet(s) ? "Original meeting recording" : "Original class recording"), dur(s.durationMs || 0)]);
    if (A.exists(s.id, "mom.md")) items.push(["mom.md", `${base} - Minutes.md`, "Minutes of meeting", "Text"]);
    if (A.exists(s.id, "summary.md")) items.push(["summary.md", `${base} - ${isMeet(s) ? "Summary" : "Notes"}.md`, isMeet(s) ? "Summary as text" : "Notes as text", "Markdown"]);
    if (A.exists(s.id, "transcript.md")) items.push(["transcript.md", `${base} - Transcript.md`, "Full transcript", "Text"]);
    const sh = sheet(`<h3>Download</h3><p class="sub">Files are saved to <b>Downloads/Memora</b> on your phone, in the background.</p>
      <button class="btn gold block" data-all style="margin-bottom:8px">${ic("down")} Download all (PDFs + audio)</button>
      ${items.map((it, i) => `<div class="opt">${ic(it[0].endsWith(".md") ? "file" : "head")}<div class="tx"><b>${esc(it[2])}</b><span>${esc(it[3])}</span></div>
        <button class="iconbtn" data-share="${i}">${ic("share")}</button><button class="iconbtn" data-save="${i}" style="margin-left:6px">${ic("down")}</button></div>`).join("") || `<div class="empty">Nothing to download yet.</div>`}`);
    $("[data-all]", sh).onclick = () => { closeSheet(); downloadAll(s); };
    $$("[data-save]", sh).forEach((b) => (b.onclick = () => { const it = items[+b.dataset.save]; A.exportFile(s.id, it[0], it[1]); }));
    $$("[data-share]", sh).forEach((b) => (b.onclick = () => { const it = items[+b.dataset.share]; A.shareFile(s.id, it[0], it[1]); }));
  }

  function moreSheet(s) {
    const hasOrig = !!A.audioName(s.id);
    const ready = A.exists(s.id, "summary.md");
    const sh = sheet(`<h3>${esc(s.title)}</h3><p class="sub">${esc(s.dateLabel || "")}</p>
      ${hasOrig ? `<button class="opt" data-a="orig">${ic("play")}<div class="tx"><b>Play original recording</b><span>The full class audio</span></div></button>` : ""}
      ${ready ? `<button class="opt" data-a="sharetxt">${ic("share")}<div class="tx"><b>Share notes as text</b><span>WhatsApp, email, Keep…</span></div></button>` : ""}
      <button class="opt" data-a="photo">${ic("cam")}<div class="tx"><b>Add board photo</b><span>Camera or gallery</span></div></button>
      <button class="opt" data-a="rename">${ic("edit")}<div class="tx"><b>Rename / change subject</b><span>Fix the class name or number</span></div></button>
      ${hasOrig ? `<button class="opt" data-a="regen">${ic("refresh")}<div class="tx"><b>Re-create notes</b><span>Run the AI again from the recording</span></div></button>` : ""}
      ${ready ? `<button class="opt" data-a="revoice">${ic("head")}<div class="tx"><b>Re-make voice recap</b><span>After changing the voice in Settings</span></div></button>` : ""}
      <button class="opt red" data-a="del">${ic("trash")}<div class="tx"><b>Delete class</b><span>Removes recording, notes and audio</span></div></button>`);
    $$("[data-a]", sh).forEach((b) => (b.onclick = () => {
      const a = b.dataset.a; closeSheet();
      if (a === "orig") playOriginal(s, 0);
      else if (a === "sharetxt") A.shareText(`${s.title} — ${s.dateLabel}\n\n` + A.readText(s.id, notesFile(curLang)));
      else if (a === "photo") photoSheet(s.id);
      else if (a === "rename") renameSheet(s);
      else if (a === "regen") confirmSheet("Re-create the notes?", "The transcript, notes and voice recap will be made again from the recording.", "Re-create", false, () => { resetMeetingTickets(s); A.process(s.id, "summary", "", "", true); setTimeout(render, 300); });
      else if (a === "revoice") { A.process(s.id, curLang ? "taudio" : "audio", curLang, langName(curLang), false); setTimeout(render, 300); }
      else if (a === "del") confirmSheet("Delete this class?", "This permanently removes the recording, notes, photos and audio from your phone.", "Delete", true, () => {
        A.playStop(); A.deleteSession(s.id); db.sessions = db.sessions.filter((x) => x.id !== s.id); save(); back();
      });
    }));
  }

  function renameSheet(s) {
    const opts = [GENERAL].concat(db.subjects).map((x) => `<option value="${x.id}" ${x.id === (s.subjectId || "") ? "selected" : ""}>${esc(x.name)}</option>`).join("");
    const sh = sheet(`<h3>Edit class</h3>
      <div class="field"><label>Subject</label><select class="inp" id="rsub">${opts}</select></div>
      <div class="field"><label>Class number</label><input class="inp" id="rno" type="number" min="1" value="${s.classNo || 1}"></div>
      <div class="field"><label>Title</label><input class="inp" id="rtitle" value="${esc(s.title)}"></div>
      <button class="btn gold block" data-ok>Save</button>`);
    const auto = () => { const sb = subj($("#rsub").value) || GENERAL; $("#rtitle").value = `${sb.name} · Class ${$("#rno").value}`; };
    $("#rsub").onchange = auto; $("#rno").oninput = auto;
    $("[data-ok]", sh).onclick = () => {
      s.subjectId = $("#rsub").value; s.classNo = Math.max(1, parseInt($("#rno").value) || 1); s.title = $("#rtitle").value.trim() || s.title;
      save(); closeSheet(); render();
    };
  }

  const pdfCbs = {};
  window.onPdf = (id, ok, msg, local) => { const f = pdfCbs[id]; delete pdfCbs[id]; if (f) f(ok, msg, local); };
  window.onExported = (ok, total, folder) => { if (exportDone) { const f = exportDone; exportDone = null; f(ok, total, folder); } else toast(`Saved ${ok} file${ok === 1 ? "" : "s"} to Downloads/Memora`); };
  let exportDone = null;
  function savePdfQuiet(s, html, name, folder) {
    return new Promise((res) => { const id = "pdf" + uid(); pdfCbs[id] = (ok, msg, local) => res({ ok, msg, local }); A.savePdf(s.id, html, name, folder, id); });
  }
  function pdfKind(label) { return { "CLASS BOOK": "Class Book", "Q&A BANK": "Q&A Bank", "MEETING MINUTES": "Minutes", "WEEKLY RECAP": "Weekly recap", "STUDY GUIDE": "Study guide" }[label] || "Notes"; }
  function makePdf(s, code, mdOverride, label, quiet) {
    const md = mdOverride || A.readText(s.id, notesFile(code));
    if (!md) { toast("Notes not ready"); return; }
    const sb = isMeet(s) ? { name: (s.mtype || "Official") + " meeting" + (s.series ? " · " + s.series : ""), teacher: s.attendees || "" } : subj(s.subjectId) || GENERAL;
    const base = A.sessionPath(s.id);
    let html = window.marked ? window.marked.parse(md) : esc(md);
    const photos = (s.photos || []).map((p) => `<figure><img src="${fileSrc(s.id, "photos/" + p.name)}"><figcaption>${p.t != null ? "Board · " + clock(p.t) : "Board photo"}</figcaption></figure>`).join("");
    const doc = `<!doctype html><html><head><meta charset="utf-8"><style>
      @font-face{font-family:Jakarta;font-weight:400;src:url(fonts/jakarta-400.woff2)}
      @font-face{font-family:Jakarta;font-weight:600;src:url(fonts/jakarta-600.woff2)}
      @font-face{font-family:Jakarta;font-weight:700;src:url(fonts/jakarta-700.woff2)}
      @page{size:A4;margin:16mm 15mm 18mm}
      body{font-family:Jakarta,"Noto Sans Tamil","Noto Sans",sans-serif;color:#1d1c20;font-size:10.6pt;line-height:1.58;margin:0}
      .cover{border-bottom:2px solid #4F46E5;padding-bottom:12px;margin-bottom:18px}
      .brand{font-size:9pt;font-weight:700;color:#4F46E5;letter-spacing:.12em}
      .ttl{font-size:20pt;font-weight:700;margin:6px 0 4px;line-height:1.15}
      .meta{color:#6d6a64;font-size:9.5pt}
      h1{font-weight:700;font-size:15pt;margin:4px 0 12px}
      h2{font-weight:700;font-size:12.5pt;color:#4F46E5;margin:22px 0 6px;border-bottom:1px solid #e3e1f7;padding-bottom:4px;page-break-after:avoid}
      h3{font-size:11.5pt;font-weight:700;margin:14px 0 4px;page-break-after:avoid}
      ul,ol{padding-left:20px;margin:4px 0} li{margin:2px 0} strong{font-weight:700}
      table{border-collapse:collapse;width:100%;font-size:9.5pt} th,td{border:1px solid #ddd;padding:5px 7px;text-align:left;vertical-align:top}
      blockquote{margin:8px 0;padding:2px 12px;border-left:3px solid #7C5CF0;color:#555}
      figure{margin:0;page-break-inside:avoid;display:inline-block;width:48%;margin:0 1% 10px}
      figure img{width:100%;border-radius:6px} figcaption{font-size:8.5pt;color:#777;margin-top:3px}
      .foot{margin-top:26px;color:#9a968e;font-size:8.5pt;text-align:center}
    </style></head><body>
      <div class="cover"><div class="brand">MEMORA · ${label || "CLASS NOTES"}</div><div class="ttl">${esc(s.title)}</div>
      <div class="meta">${esc(sb.name)}${sb.teacher ? " · " + esc(sb.teacher) : ""} · ${esc(s.dateLabel || fmtDate(s.date))}${s.durationMs ? " · " + dur(s.durationMs) : ""}${code ? " · " + esc(langName(code)) : ""}</div></div>
      ${html}
      ${photos ? `<h2>Board photos</h2>${photos}` : ""}
      <div class="foot">Prepared by Memora from the class recording</div></body></html>`;
    const name = `${fileBase(s)}${code ? " - " + langName(code) : ""} - ${pdfKind(label)}.pdf`;
    if (quiet) return savePdfQuiet(s, doc, name, fileBase(s));
    toast("Saving PDF…");
    savePdfQuiet(s, doc, name, fileBase(s)).then((r) => {
      if (!r.ok) { toast(r.msg || "PDF failed"); return; }
      const sh = sheet(`<h3>PDF saved ✓</h3><p class="sub">${esc(name)}<br>${esc(r.msg)}</p>
        <div class="row"><button class="btn line" data-print>${ic("file")} Print</button><button class="btn gold" data-share>${ic("share")} Share</button></div>`);
      $("[data-share]", sh).onclick = () => { closeSheet(); A.shareFile(s.id, r.local, name); };
      $("[data-print]", sh).onclick = () => { closeSheet(); A.printPdf(doc, name.replace(/\.pdf$/, "")); };
    });
  }

  // one tap: every PDF + audio of this class/meeting into Downloads/Memora/<name>, in the background
  function dlPill(text) {
    let el = $("#dlpill");
    if (!el) { el = document.createElement("div"); el.id = "dlpill"; el.className = "dlpill"; document.body.appendChild(el); }
    if (!text) { el.remove(); return; }
    el.innerHTML = `${ic("down")}<span>${esc(text)}</span>`;
  }
  window.onDlProgress = (i, total) => dlPill(`Saving audio ${i + 1} of ${total}…`);
  async function downloadAll(s) {
    const folder = fileBase(s);
    dlPill("Preparing download…");
    const jobs = [];
    if (A.exists(s.id, "summary.md")) jobs.push(isMeet(s) ? [(A.readText(s.id, "mom.md") || "") + "\n\n---\n\n" + A.readText(s.id, "summary.md"), "MEETING MINUTES"] : [A.readText(s.id, "summary.md"), "CLASS NOTES"]);
    if (A.exists(s.id, "classbook.md")) jobs.push([A.readText(s.id, "classbook.md"), "CLASS BOOK"]);
    if (A.exists(s.id, "qabank.md")) jobs.push([A.readText(s.id, "qabank.md"), "Q&A BANK"]);
    let pdfs = 0;
    let k = 0;
    window.__quietPdf = true;
    for (const [md, label] of jobs) { dlPill(`Making PDF ${++k} of ${jobs.length}…`); const r = await makePdf(s, "", md, label, true); if (r && r.ok) pdfs++; }
    window.__quietPdf = false;
    const base = folder;
    const files = [];
    if (A.exists(s.id, "summary_audio.m4a")) files.push(["summary_audio.m4a", `${base} - Voice recap.m4a`]);
    if (A.exists(s.id, "replay_audio.m4a")) files.push(["replay_audio.m4a", `${base} - Classroom replay.m4a`]);
    if (A.exists(s.id, "clean_audio.m4a")) files.push(["clean_audio.m4a", `${base} - Clean recording.m4a`]);
    if (!A.exists(s.id, "clean_audio.m4a")) { const orig = A.audioName(s.id); if (orig) files.push([orig, `${base} - Original recording.${orig.split(".").pop()}`]); }
    exportDone = (ok) => { dlPill(null); toast(`Done ✓ ${pdfs} PDF${pdfs === 1 ? "" : "s"} + ${ok} audio saved to Downloads/Memora/${folder}`); };
    if (!files.length) { exportDone(0); return; }
    A.exportFiles(s.id, JSON.stringify(files), folder);
  }

  // ------------------------------------------------------------------ library
  let libQ = "", deepHits = null;
  VIEWS.library = () => {
    const q = libQ.toLowerCase();
    const all = db.sessions.filter((s) => s.segment !== "meeting").slice().sort((a, b) => b.date.localeCompare(a.date));
    const subjects = [GENERAL].concat(db.subjects).map((sb) => ({ sb, list: all.filter((s) => (s.subjectId || "") === sb.id) })).filter((x) => x.sb.id !== "" || x.list.length);
    let res = "";
    if (q) {
      const hits = all.filter((s) => s.title.toLowerCase().includes(q) || (deepHits && deepHits.includes(s.id)));
      res = `<h2 class="sec">Results <button data-deep>Search inside notes</button></h2>${hits.length ? `<div class="list">${hits.map(sessionItem).join("")}</div>` : `<div class="empty">No classes match “${esc(libQ)}”.</div>`}`;
    } else {
      res = `<h2 class="sec">Subjects</h2>${subjects.length ? `<div class="list">${subjects.map((x) => `<button class="item" data-subj="${x.sb.id}"><div class="ic" style="color:${x.sb.color}">${esc(x.sb.name.charAt(0).toUpperCase())}</div><div class="tx"><div class="t1">${esc(x.sb.name)}</div><div class="t2">${x.list.length} class${x.list.length === 1 ? "" : "es"}${x.sb.teacher ? " · " + esc(x.sb.teacher) : ""}</div></div>${ic("right", "chev")}</button>`).join("")}</div>` : `<div class="card empty"><div class="big">No subjects yet</div>Add your subjects in Timetable.</div>`}
        ${all.length ? `<h2 class="sec">All classes</h2><div class="list">${all.map(sessionItem).join("")}</div>` : ""}`;
    }
    return `<div class="top"><div class="brand">Library</div></div>
      <div class="search">${ic("search")}<input id="q" placeholder="Search classes" value="${esc(libQ)}"></div>${res}`;
  };
  BIND.library = (app) => {
    bindOpen(app);
    const q = $("#q", app);
    q.oninput = () => { libQ = q.value; deepHits = null; const pos = q.selectionStart; render(); const n = $("#q"); n.focus(); n.setSelectionRange(pos, pos); };
    $$("[data-subj]", app).forEach((b) => (b.onclick = () => go("subject", { id: b.dataset.subj })));
    $$("[data-deep]", app).forEach((b) => (b.onclick = () => {
      const q2 = libQ.toLowerCase();
      deepHits = db.sessions.filter((s) => (A.readText(s.id, "summary.md") + A.readText(s.id, "transcript.md")).toLowerCase().includes(q2)).map((s) => s.id);
      render();
    }));
  };

  VIEWS.subject = () => {
    const sb = params.id ? subj(params.id) : GENERAL;
    if (!sb) return `<button class="back" data-back>${ic("left")} Library</button><div class="empty">Subject deleted.</div>`;
    const list = db.sessions.filter((s) => (s.subjectId || "") === sb.id).sort((a, b) => b.date.localeCompare(a.date));
    const total = list.reduce((m, s) => m + (s.durationMs || 0), 0);
    return `<button class="back" data-back>${ic("left")} Library</button>
      <div class="shead"><div class="eyebrow" style="color:${sb.color}">Subject</div><h1>${esc(sb.name)}</h1>
      <div class="meta">${sb.teacher ? `<span>${esc(sb.teacher)}</span>` : ""}<span>${list.length} class${list.length === 1 ? "" : "es"}</span>${total ? `<span>${dur(total)} recorded</span>` : ""}</div>
      ${sb.slots && sb.slots.length ? `<div class="meta" style="margin-top:8px">${esc(scheduleText(sb))}</div>` : ""}</div>
      <div class="row" style="margin:18px 0 6px"><button class="btn gold" data-start>${ic("mic")} Class ${nextClassNo(sb.id)}</button>${sb.id ? `<button class="btn line" data-edit>${ic("edit")} Edit</button>` : ""}</div>
      ${packCard(sb.id)}
      <h2 class="sec">Classes</h2>${list.length ? `<div class="list">${list.map(sessionItem).join("")}</div>` : `<div class="empty">No classes yet.</div>`}`;
  };
  BIND.subject = (app) => {
    $$("[data-back]", app).forEach((b) => (b.onclick = back));
    bindOpen(app);
    $$("[data-start]", app).forEach((b) => (b.onclick = () => startClass(params.id || "")));
    $$("[data-edit]", app).forEach((b) => (b.onclick = () => subjectSheet(subj(params.id))));
    bindPack(app, params.id || "");
  };

  // ------------------------------------------------------------------ timetable
  VIEWS.timetable = () => {
    const todayDow = isoDow(new Date());
    const week = DAYS.map((d, i) => {
      const dow = i + 1;
      const items = [];
      db.subjects.forEach((s) => (s.slots || []).forEach((sl) => { if ((sl.days || []).includes(dow)) items.push({ s, sl }); }));
      items.sort((a, b) => mins(a.sl.start) - mins(b.sl.start));
      return { d, dow, items };
    }).filter((x) => x.items.length);
    return `<div class="top"><div class="brand">Timetable</div><button class="iconbtn" data-add>${ic("plus")}</button></div>
      <p class="meta" style="margin:-4px 2px 6px;line-height:1.5">Tell Memora who teaches what and when. At class time it picks the subject and names the recording — <i>Subject · Class 5 · date</i>.</p>
      <h2 class="sec">Subjects</h2>
      ${db.subjects.length ? `<div class="list">${db.subjects.map((s) => `<button class="item" data-edit="${s.id}"><div class="ic" style="color:${s.color}">${esc(s.name.charAt(0).toUpperCase())}</div><div class="tx"><div class="t1">${esc(s.name)}</div><div class="t2">${s.teacher ? esc(s.teacher) + " · " : ""}${s.slots && s.slots.length ? esc(scheduleText(s)) : "No schedule"}</div></div>${ic("edit", "chev")}</button>`).join("")}</div>`
        : `<div class="card empty"><div class="big">Add your first subject</div>Name, teacher, and the days & times it runs.</div>`}
      <button class="btn line block" style="margin-top:12px" data-add>${ic("plus")} Add subject</button>
      ${week.length ? `<h2 class="sec">Week</h2>${week.map((w) => `<div class="dayhead ${w.dow === todayDow ? "today" : ""}">${w.d}${w.dow === todayDow ? " · Today" : ""}</div><div class="list">${w.items.map((x) => `<div class="item"><span class="dot8" style="background:${x.s.color}"></span><div class="tx"><div class="t1">${esc(x.s.name)}</div><div class="t2">${t12(x.sl.start)} – ${t12(x.sl.end)}${x.s.teacher ? " · " + esc(x.s.teacher) : ""}</div></div></div>`).join("")}</div>`).join("")}` : ""}`;
  };
  BIND.timetable = (app) => {
    $$("[data-add]", app).forEach((b) => (b.onclick = () => subjectSheet(null)));
    $$("[data-edit]", app).forEach((b) => (b.onclick = () => subjectSheet(subj(b.dataset.edit))));
  };

  function subjectSheet(existing, onSaved) {
    const s = existing ? JSON.parse(JSON.stringify(existing)) : { id: "j" + uid(), name: "", teacher: "", color: COLORS[db.subjects.length % COLORS.length], slots: [] };
    if (!s.slots.length) s.slots.push({ days: [], start: "18:30", end: "20:30" });
    const draw = () => {
      const sh = sheet(`<h3>${existing ? "Edit subject" : "New subject"}</h3>
        <div class="field"><label>Subject name</label><input class="inp" id="sn" value="${esc(s.name)}" placeholder="e.g. Digital Marketing"></div>
        <div class="field"><label>Teacher</label><input class="inp" id="st" value="${esc(s.teacher)}" placeholder="e.g. Prof. Ramesh"></div>
        <div class="field"><label>Colour</label><div class="swatches">${COLORS.map((c) => `<button class="sw ${c === s.color ? "on" : ""}" style="background:${c}" data-c="${c}"></button>`).join("")}</div></div>
        <div class="field"><label>When does it run?</label>
        ${s.slots.map((sl, i) => `<div class="slot" data-i="${i}"><div class="days">${DAYS.map((d, k) => `<button class="day ${sl.days.includes(k + 1) ? "on" : ""}" data-d="${k + 1}">${d}</button>`).join("")}</div>
          <div class="times"><input class="inp" type="time" data-f="start" value="${sl.start}"><span>to</span><input class="inp" type="time" data-f="end" value="${sl.end}">${s.slots.length > 1 ? `<button class="iconbtn" data-rm>${ic("x")}</button>` : ""}</div></div>`).join("")}
        <button class="btn small line" data-addslot>${ic("plus")} Another time</button></div>
        <button class="btn gold block" data-save>Save subject</button>
        ${existing ? `<button class="btn danger block" style="margin-top:10px" data-del>Delete subject</button>` : ""}`);
      const sync = () => { s.name = $("#sn").value; s.teacher = $("#st").value; $$(".slot", sh).forEach((el) => { const sl = s.slots[+el.dataset.i]; $$("[data-f]", el).forEach((inp) => (sl[inp.dataset.f] = inp.value)); }); };
      $$("[data-c]", sh).forEach((b) => (b.onclick = () => { sync(); s.color = b.dataset.c; draw(); }));
      $$(".slot", sh).forEach((el) => {
        const sl = s.slots[+el.dataset.i];
        $$("[data-d]", el).forEach((b) => (b.onclick = () => { const d = +b.dataset.d; sl.days = sl.days.includes(d) ? sl.days.filter((x) => x !== d) : sl.days.concat(d); b.classList.toggle("on"); }));
        const rm = $("[data-rm]", el); if (rm) rm.onclick = () => { sync(); s.slots.splice(+el.dataset.i, 1); draw(); };
      });
      $("[data-addslot]", sh).onclick = () => { sync(); s.slots.push({ days: [], start: "18:30", end: "20:30" }); draw(); };
      $("[data-save]", sh).onclick = () => {
        sync();
        s.name = s.name.trim(); s.teacher = s.teacher.trim();
        if (!s.name) { toast("Enter the subject name"); return; }
        s.slots = s.slots.filter((x) => x.days.length && x.start && x.end);
        const i = db.subjects.findIndex((x) => x.id === s.id);
        if (i >= 0) db.subjects[i] = s; else db.subjects.push(s);
        save(); closeSheet(); toast("Saved"); render();
        if (onSaved) onSaved(s.id);
      };
      const del = $("[data-del]", sh);
      if (del) del.onclick = () => { closeSheet(); confirmSheet("Delete subject?", "Its classes stay in your Library under General.", "Delete", true, () => {
        db.subjects = db.subjects.filter((x) => x.id !== s.id); db.sessions.forEach((x) => { if (x.subjectId === s.id) x.subjectId = ""; }); save(); go("timetable");
      }); };
    };
    draw();
  }

  // ------------------------------------------------------------------ settings
  const STUDIO = [["Aoede", "Aoede — female, warm & breezy"], ["Kore", "Kore — female, clear & firm"], ["Leda", "Leda — female, youthful"], ["Charon", "Charon — male, calm & informative"], ["Puck", "Puck — male, bright & upbeat"], ["Orus", "Orus — male, firm"]];
  const VOICES = [["en-IN", "English — Indian accent"], ["en-US", "English — US"], ["en-GB", "English — UK"]];
  const MICS = [["standard", "Standard", "Best for most phones"], ["far", "Far-field", "Phone kept away from the teacher"], ["voice", "Voice focus", "Less noise processing"], ["raw", "Raw", "Unprocessed mic (if supported)"]];
  VIEWS.settings = () => {
    const st = db.settings;
    const ls = lockSt();
    const t = (on, k) => `<button class="toggle ${on ? "on" : ""}" data-tg="${k}"></button>`;
    return `<div class="top"><div class="brand">Settings</div></div>
      <h2 class="sec">You</h2><div class="card" style="padding:4px 16px">
        <button class="set" style="width:100%;text-align:left" data-name><div class="tx"><b>Your name</b><span>${esc(st.name || "Add your name")}</span></div>${ic("right", "chev")}</button></div>
      <h2 class="sec">AI</h2><div class="card" style="padding:4px 16px">
        <button class="set" style="width:100%;text-align:left" data-key><div class="tx"><b>Gemini AI key</b><span>${st.apiKey ? "Connected · ••••" + esc(st.apiKey.slice(-4)) : "Not added — free from Google"}</span></div>${ic("right", "chev")}</button>
        <button class="set" style="width:100%;text-align:left" data-model><div class="tx"><b>AI model</b><span>${esc(st.model)}</span></div>${ic("right", "chev")}</button>
        <button class="set" style="width:100%;text-align:left" data-slang><div class="tx"><b>Notes language</b><span>${esc(st.summaryLang)}</span></div>${ic("right", "chev")}</button>
        <button class="set" style="width:100%;text-align:left" data-quality><div class="tx"><b>Processing mode</b><span>${st.quality === "thorough" ? "Thorough — full transcript first, then notes" : "Fast — notes straight from the audio, transcript after"}</span></div>${ic("right", "chev")}</button>
        <div class="set"><div class="tx"><b>Auto-create notes after class</b><span>Starts as soon as you end the class</span></div>${t(st.autoProcess, "autoProcess")}</div>
        <div class="set"><div class="tx"><b>Also make single-voice recap</b><span>Off = faster. Classes use the two-voice replay as their audio</span></div>${t(!!st.autoRecap, "autoRecap")}</div>
        <div class="set"><div class="tx"><b>Auto-create class experience</b><span>Class Book, Q&A Bank, replay & clean audio right after the notes</span></div>${t(st.autoExperience !== false, "autoExperience")}</div></div>
      <h2 class="sec">Voice recap</h2><div class="card" style="padding:4px 16px">
        <button class="set" style="width:100%;text-align:left" data-vengine><div class="tx"><b>Voice quality</b><span>${st.voiceEngine === "phone" ? "Phone voice (offline, basic)" : "Studio voice — natural AI voice (uses your Gemini key)"}</span></div>${ic("right", "chev")}</button>
        ${st.voiceEngine === "phone" ? "" : `<button class="set" style="width:100%;text-align:left" data-svoice><div class="tx"><b>Studio voice</b><span>${esc((STUDIO.find((v) => v[0] === (st.studioVoice || "Aoede")) || STUDIO[0])[1])}</span></div>${ic("right", "chev")}</button>`}
        <button class="set" style="width:100%;text-align:left" data-voice><div class="tx"><b>Phone voice accent</b><span>${esc((VOICES.find((v) => v[0] === st.voice) || [0, st.voice])[1])}</span></div>${ic("right", "chev")}</button>
        <button class="set" style="width:100%;text-align:left" data-rate><div class="tx"><b>Speaking speed</b><span>${st.rate === 1 ? "Normal (1.0×)" : st.rate + "×"}</span></div>${ic("right", "chev")}</button>
        <button class="set" style="width:100%;text-align:left" data-ttsset><div class="tx"><b>Phone voices</b><span>Install Tamil / other language voices</span></div>${ic("right", "chev")}</button></div>
      <h2 class="sec">Recording</h2><div class="card" style="padding:4px 16px">
        <div class="set"><div class="tx"><b>Skip silence</b><span>Long quiet gaps are not recorded — smaller files, faster notes</span></div>${t(st.skipSilence !== false, "skipSilence")}</div>
        <div class="set"><div class="tx"><b>Noise clean-up</b><span>Reduces fan / traffic noise and lifts a far voice</span></div>${t(st.noiseClean !== false, "noiseClean")}</div>
        <button class="set" style="width:100%;text-align:left" data-mic><div class="tx"><b>Microphone mode</b><span>${esc((MICS.find((m) => m[0] === st.mic) || MICS[0])[1])}</span></div>${ic("right", "chev")}</button>
        <button class="set" style="width:100%;text-align:left" data-perm><div class="tx"><b>Permissions</b><span>Mic ${A.hasPerm("mic") ? "✓" : "✗"} · Notifications ${A.hasPerm("notif") ? "✓" : "✗"} · Background ${A.hasPerm("battery") ? "✓" : "✗"}</span></div>${ic("right", "chev")}</button></div>
      <h2 class="sec">Security</h2><div class="card" style="padding:4px 16px">
        <div class="set"><div class="tx"><b>App lock (PIN)</b><span>${ls.on ? "On · 4-digit PIN" : "Off — anyone with your phone can open it"}</span></div>${t(ls.on, "__lock")}</div>
        ${ls.on && ls.bioAvail ? `<div class="set"><div class="tx"><b>Fingerprint unlock</b><span>Unlock with your fingerprint</span></div>${t(ls.bio, "__bio")}</div>` : ""}
        ${ls.on && !ls.bioAvail ? `<div class="set"><div class="tx"><b>Fingerprint unlock</b><span>Add a fingerprint in phone Settings to use it</span></div></div>` : ""}
        ${ls.on ? `<button class="set" style="width:100%;text-align:left" data-grace><div class="tx"><b>Lock after</b><span>${ls.grace ? "Away for " + ls.grace / 60000 + " min" : "Immediately when you leave the app"}</span></div>${ic("right", "chev")}</button>
        <button class="set" style="width:100%;text-align:left" data-chpin><div class="tx"><b>Change PIN</b><span>Set a new 4-digit PIN</span></div>${ic("right", "chev")}</button>` : ""}</div>
      <h2 class="sec">Reminders</h2><div class="card" style="padding:4px 16px">
        <div class="set"><div class="tx"><b>Class reminders</b><span>About 5 min before each class · open Memora once after a phone restart</span></div>${t(st.remClass !== false, "remClass")}</div>
        <div class="set"><div class="tx"><b>Task due reminders</b><span>9 AM on the due date</span></div>${t(st.remTask !== false, "remTask")}</div>
        <div class="set"><div class="tx"><b>Meeting brief</b><span>10 min before a planned meeting</span></div>${t(st.remMeet !== false, "remMeet")}</div>
        <div class="set"><div class="tx"><b>Quick start</b><span style="white-space:normal">Long-press the Memora icon for shortcuts, or add the “Memora record” tile to Quick Settings.</span></div></div></div>
      <h2 class="sec">Backup</h2><div class="card" style="padding:4px 16px">
        <button class="set" style="width:100%;text-align:left" data-backup><div class="tx"><b>Back up now</b><span>${st.lastBackup ? "Last backup " + fmtDate(st.lastBackup) : "Never — recommended weekly"}</span></div>${ic("right", "chev")}</button>
        <button class="set" style="width:100%;text-align:left" data-restore><div class="tx"><b>Restore from backup</b><span>Pick a Memora-backup .zip</span></div>${ic("right", "chev")}</button></div>
      <h2 class="sec">Storage</h2><div class="card" style="padding:4px 16px">
        <div class="set"><div class="tx"><b>Used on this phone</b><span>${esc(A.storageInfo())} · ${db.sessions.length} classes</span></div></div>
        <div class="set"><div class="tx"><b>Keep your files safe</b><span style="white-space:normal">Uninstalling Memora deletes its data. Download important recaps to Downloads/Memora.</span></div></div></div>
      <p class="tip" style="margin-top:24px">Memora 2.3</p>`;
  };
  BIND.settings = (app) => {
    const st = db.settings;
    $$("[data-tg]", app).forEach((b) => (b.onclick = () => {
      const k = b.dataset.tg, ls = lockSt();
      if (k === "__lock") {
        if (!ls.on) createPin(() => { A.setBio(true); toast(ls.bioAvail ? "App lock on · fingerprint enabled" : "App lock on"); render(); });
        else verifyPin("Turn off app lock", () => { A.disableLock(); toast("App lock off"); render(); });
        return;
      }
      if (k === "__bio") { A.setBio(!ls.bio); render(); return; }
      if (k.startsWith("rem") || k === "skipSilence" || k === "noiseClean" || k === "autoExperience") { st[k] = st[k] === false; save(); render(); return; }
      st[k] = !st[k]; save(); render();
    }));
    $("[data-backup]", app).onclick = backupSheet;
    $("[data-quality]", app).onclick = () => choiceSheet("Processing mode", "How Memora turns a recording into notes.", [["fast", "Fast (recommended) — notes in a few minutes, transcript follows"], ["thorough", "Thorough — transcript first, then notes (slower)"]], st.quality || "fast", (v) => { st.quality = v; save(); render(); });
    $("[data-restore]", app).onclick = () => confirmSheet("Restore a backup?", "Classes, meetings, tasks and settings will be replaced by the backup's contents.", "Choose file", false, () => A.pickBackup());
    const gr = $("[data-grace]", app);
    if (gr) gr.onclick = () => choiceSheet("Lock after", "How long Memora can stay unlocked after you switch to another app.", [[0, "Immediately"], [60000, "After 1 minute"], [300000, "After 5 minutes"], [900000, "After 15 minutes"]], lockSt().grace, (v) => { A.setGrace(Number(v)); render(); });
    const cp = $("[data-chpin]", app);
    if (cp) cp.onclick = () => verifyPin("Change PIN", () => createPin(() => toast("PIN changed")));
    $("[data-name]", app).onclick = () => textSheet("Your name", "Used for greetings.", st.name, (v) => { st.name = v; save(); render(); });
    $("[data-key]", app).onclick = () => keySheet();
    $("[data-model]", app).onclick = () => modelSheet();
    $("[data-slang]", app).onclick = () => choiceSheet("Notes language", "Main language for notes and the voice recap. You can still translate any class later.", LANGS.map((l) => [l[1], l[1]]), st.summaryLang, (v) => { st.summaryLang = v; if (v === "English") st.voice = st.voice.startsWith("en") ? st.voice : "en-IN"; else { const l = LANGS.find((x) => x[1] === v); st.voice = l[0] === "ta-Latn" ? "en-IN" : l[0]; } save(); render(); });
    $("[data-vengine]", app).onclick = () => choiceSheet("Voice quality", "Studio voice sounds like a real person and works for Tamil, Hindi and other languages. If the free limit is reached, Memora falls back to the phone voice automatically.", [["studio", "Studio voice — natural (recommended)"], ["phone", "Phone voice — offline, basic"]], st.voiceEngine || "studio", (v) => { st.voiceEngine = v; save(); render(); });
    const sv = $("[data-svoice]", app); if (sv) sv.onclick = () => choiceSheet("Studio voice", "Applies to new voice recaps. To change an old one: open the class → More → Re-make voice recap.", STUDIO, st.studioVoice || "Aoede", (v) => { st.studioVoice = v; save(); render(); });
    $("[data-voice]", app).onclick = () => choiceSheet("Voice", "Voice used for the English recap. Other languages use that language's phone voice.", VOICES, st.voice, (v) => { st.voice = v; save(); render(); });
    $("[data-rate]", app).onclick = () => choiceSheet("Speaking speed", "Speed of the generated voice. You can also change playback speed in the player.", [[0.9, "Slightly slow (0.9×)"], [1, "Normal (1.0×)"], [1.1, "Slightly fast (1.1×)"], [1.25, "Fast (1.25×)"]], st.rate, (v) => { st.rate = Number(v); save(); render(); });
    $("[data-ttsset]", app).onclick = () => A.ttsSettings();
    $("[data-mic]", app).onclick = () => choiceSheet("Microphone mode", "If the teacher sounds far or faint, try Far-field.", MICS.map((m) => [m[0], m[1] + " — " + m[2]]), st.mic, (v) => { st.mic = v; save(); render(); });
    $("[data-perm]", app).onclick = () => {
      const sh = sheet(`<h3>Permissions</h3><p class="sub">Memora needs these to record a full class with the screen off.</p>
        <button class="opt" data-p="perm">${ic("mic")}<div class="tx"><b>Microphone & notifications</b><span>${A.hasPerm("mic") && A.hasPerm("notif") ? "Allowed ✓" : "Tap to allow"}</span></div></button>
        <button class="opt" data-p="batt">${ic("bolt")}<div class="tx"><b>Run in background</b><span>${A.hasPerm("battery") ? "Allowed ✓" : "Tap and choose Allow"}</span></div></button>`);
      $$("[data-p]", sh).forEach((b) => (b.onclick = () => { closeSheet(); if (b.dataset.p === "perm") A.requestPerms(); else A.batterySettings(); }));
    };
  };

  function textSheet(title, sub, val, cb) {
    const sh = sheet(`<h3>${esc(title)}</h3><p class="sub">${esc(sub)}</p><div class="field"><input class="inp" id="tv" value="${esc(val || "")}"></div><button class="btn gold block" data-ok>Save</button>`);
    $("[data-ok]", sh).onclick = () => { cb($("#tv").value.trim()); closeSheet(); };
  }
  function choiceSheet(title, sub, items, cur, cb) {
    const sh = sheet(`<h3>${esc(title)}</h3><p class="sub">${esc(sub)}</p>${items.map((it) => `<button class="opt" data-v="${esc(it[0])}"><div class="tx"><b>${esc(it[1])}</b></div>${String(it[0]) === String(cur) ? ic("check") : ""}</button>`).join("")}`);
    $$("[data-v]", sh).forEach((b) => (b.onclick = () => { cb(b.dataset.v); closeSheet(); }));
  }

  function keySheet() {
    const st = db.settings;
    const sh = sheet(`<h3>Free Gemini AI key</h3><p class="sub">Memora uses Google's free Gemini AI to transcribe and write your notes. The key stays on this phone.</p>
      <ol class="steps"><li>Tap <b>Open Google AI Studio</b> below and sign in with your Google account.</li><li>Tap <b>Create API key</b> (choose any project / create one).</li><li>Copy the key (starts with <b>AIza…</b>) and paste it here.</li></ol>
      <button class="btn line block" data-open>${ic("key")} Open Google AI Studio</button>
      <div class="field" style="margin-top:16px"><label>Your key</label><input class="inp" id="kv" value="${esc(st.apiKey)}" placeholder="AIza…" autocomplete="off" autocapitalize="off" spellcheck="false"></div>
      <div id="kres" class="meta" style="margin:-6px 2px 14px;min-height:18px"></div>
      <div class="row"><button class="btn line" data-test>Test</button><button class="btn gold" data-ok>Save key</button></div>`);
    $("[data-open]", sh).onclick = () => A.openUrl("https://aistudio.google.com/apikey");
    $("[data-test]", sh).onclick = () => { $("#kres").textContent = "Testing…"; A.testKey($("#kv").value.trim(), st.model); };
    $("[data-ok]", sh).onclick = () => { st.apiKey = $("#kv").value.trim(); save(); closeSheet(); toast(st.apiKey ? "Key saved" : "Key removed"); render(); };
  }
  window.onKeyTest = (r) => { const el = $("#kres"); if (el) { el.textContent = r.msg; el.style.color = r.ok ? "var(--ok)" : "var(--warn)"; } };

  function modelSheet() {
    const st = db.settings;
    const sh = sheet(`<h3>AI model</h3><p class="sub"><b>gemini-flash-latest</b> is recommended: fast, accurate and on Google's free tier. Load the list to pick another.</p>
      <div class="field"><input class="inp" id="mv" value="${esc(st.model)}"></div>
      <div id="mlist"></div>
      <div class="row"><button class="btn line" data-load>Load models</button><button class="btn gold" data-ok>Save</button></div>`);
    $("[data-load]", sh).onclick = () => { if (!st.apiKey) { toast("Add your key first"); return; } $("#mlist").innerHTML = `<div class="meta" style="margin-bottom:12px">Loading…</div>`; A.listModels(st.apiKey); };
    $("[data-ok]", sh).onclick = () => { st.model = $("#mv").value.trim() || "gemini-flash-latest"; save(); closeSheet(); render(); };
  }
  window.onModels = (r) => {
    const el = $("#mlist"); if (!el) return;
    if (!r.ok) { el.innerHTML = `<div class="meta" style="color:var(--warn);margin-bottom:12px">${esc(r.msg)}</div>`; return; }
    const ms = r.models.filter((m) => /flash|pro/.test(m.name) && !/image|tts|live|embedding|audio/.test(m.name));
    el.innerHTML = `<div style="max-height:260px;overflow:auto;margin-bottom:12px">${ms.map((m) => `<button class="opt" data-m="${esc(m.name)}"><div class="tx"><b>${esc(m.label)}</b><span>${esc(m.name)}</span></div></button>`).join("")}</div>`;
    $$("[data-m]", el).forEach((b) => (b.onclick = () => { $("#mv").value = b.dataset.m; }));
  };

  // ------------------------------------------------------------------ player bar
  let lastPl = "";
  function drawPlayer() {
    const p = J(A.playState(), {});
    const el = $("#player");
    if (!p.path || view === "record") { el.classList.add("hidden"); lastPl = ""; return; }
    el.classList.remove("hidden");
    const key = p.path + "|" + p.playing + "|" + p.speed;
    if (key !== lastPl) {
      lastPl = key;
      el.innerHTML = `<div class="pl-top"><div class="tx"><div class="t1">${esc(p.title)}</div><div class="t2">${esc(p.subtitle)}</div></div>
        <button class="pl-speed" data-sp>${Number(p.speed).toFixed(2).replace(/0$/, "")}×</button>
        <button class="pl-btn" data-b>${ic("back15")}</button>
        <button class="pl-btn main" data-pp>${ic(p.playing ? "pause" : "play")}</button>
        <button class="pl-btn" data-f>${ic("fwd15")}</button>
        <button class="pl-btn" data-x style="width:30px">${ic("x")}</button></div>
        <input type="range" class="pl-seek" min="0" max="1000" value="0"><div class="pl-times"><span data-pos>0:00</span><span data-dur>0:00</span></div>`;
      $("[data-pp]", el).onclick = () => { A.playToggle(); setTimeout(drawPlayer, 200); };
      $("[data-b]", el).onclick = () => A.playBy(-15000);
      $("[data-f]", el).onclick = () => A.playBy(15000);
      $("[data-x]", el).onclick = () => { A.playStop(); setTimeout(drawPlayer, 200); };
      $("[data-sp]", el).onclick = () => { const seq = [1, 1.25, 1.5, 1.75, 2, 0.75]; const i = seq.indexOf(Number(p.speed)); A.playSpeed(seq[(i + 1) % seq.length]); setTimeout(drawPlayer, 200); };
      const sk = $(".pl-seek", el);
      sk.oninput = () => (sk.dataset.drag = "1");
      sk.onchange = () => { const q = J(A.playState(), {}); A.playSeek((sk.value / 1000) * (q.dur || 0)); sk.dataset.drag = ""; };
    }
    const sk = $(".pl-seek", el);
    if (sk && !sk.dataset.drag && p.dur) sk.value = Math.round((p.pos / p.dur) * 1000);
    $("[data-pos]", el).textContent = clock(p.pos || 0);
    $("[data-dur]", el).textContent = clock(p.dur || 0);
  }

  // ------------------------------------------------------------------ ticking
  let lastStatusKey = "";
  function tick(force) {
    const r = rec();
    // saving finished?
    if (stopping && r.state === "idle" && r.doneId === stopping) { const id = stopping; stopping = null; afterSaved(id, r.doneMs); return; }
    // rec pill on other screens
    const pill = $("#recpill");
    if (r.state !== "idle" && r.sid && view !== "record") {
      pill.className = "recpill" + (r.state === "paused" ? " paused" : "");
      pill.innerHTML = `<span class="recdot ${r.state === "recording" ? "pulse" : ""}"></span>${r.state === "paused" ? "On break" : "Recording"} · ${clock(r.elapsed)}`;
      pill.onclick = () => go("record", { id: r.sid });
      document.body.classList.add("recon");
    } else { pill.className = "recpill hidden"; document.body.classList.remove("recon"); }

    if (view === "record") {
      const t = $("#rtimer"); if (t) t.textContent = clock(r.elapsed || 0);
      const v = $("#recv");
      if (v) {
        const paused = r.state === "paused";
        v.classList.toggle("paused", paused);
        $("#rstate").innerHTML = paused ? `${ic("pause")} On break — tap Resume when class restarts` : r.state === "saving" ? "Saving…" : `<span class="recdot pulse"></span> Listening`;
        const rs = $("#rstate svg"); if (rs) { rs.style.width = "16px"; rs.style.height = "16px"; }
        $("#pbtn").innerHTML = ic(paused ? "mic" : "pause");
        $("#plabel").textContent = paused ? "Resume" : "Break";
        const amp = r.state === "recording" ? Math.min(1, Math.sqrt((r.amp || 0) / 18000)) : 0;
        waveData.push(amp); waveData.shift();
        const bars = $$("#wave i");
        bars.forEach((b, i) => { const a = waveData[i]; b.style.height = 6 + Math.round(a * 84) + "px"; b.style.opacity = 0.35 + a * 0.65; });
        if (r.marks !== undefined) $("#marks").innerHTML = (r.marks ? `<span class="chip gold">${ic("starf")} ${r.marks} marked important</span>` : "") + (r.skipped > 60000 ? `<span class="chip">${Math.round(r.skipped / 60000)} min silence skipped</span>` : "");
      }
      if (r.state === "idle" && !stopping && !force) {
        const s = sess(params.id);
        if (s && s.status === "recording") {
          if (r.doneId === s.id) { afterSaved(s.id, r.doneMs); return; } // ended from the notification
          if (Date.now() - startedAt > 3000) { // mic never started
            toast(r.error || "Could not start recording");
            A.deleteSession(s.id); db.sessions = db.sessions.filter((x) => x.id !== s.id); save();
            go(home()); return;
          }
        }
      }
    } else if (r.state === "idle" && r.doneId) {
      const s = sess(r.doneId);
      if (s && s.status === "recording") { // ended from the notification while on another screen
        s.durationMs = r.doneMs; s.status = "saved"; s.bookmarks = J(A.readText(s.id, "bookmarks.json"), []); save();
        maybeProcess(s); render(); return;
      }
    }
    if (view === "session") {
      const s = sess(params.id);
      if (s) {
        const st = status(s);
        const key = st.k + "|" + (st.label || "") + "|" + Math.round((st.p || 0) * 100) + "|" + (st.err || "");
        if (key !== lastStatusKey) {
          const was = lastStatusKey.split("|")[0];
          lastStatusKey = key;
          if (!force) {
            if (was !== st.k || st.k !== "proc") render();
            else {
              const c = $("#stcard"); if (c) { c.innerHTML = statusCard(s, st); bindStatus(c, s); }
              const ew = $("#expwrap"); if (ew) { ew.innerHTML = expCard(s); bindExp(ew, s); }
            }
          }
        }
      }
    } else lastStatusKey = "";
    drawPlayer();
  }
  setInterval(() => tick(false), 500);
  setInterval(() => { try { autoContinue(); } catch (e) { } }, 15000);

  window.onAppResume = () => { if (view !== "record") render(); };



  // ================================================================== CLASS EXPERIENCE (class book, replay, clean recording)
  function expCard(s) {
    const st = job(s.id);
    const busy = st.running && (st.job || "").startsWith("experience");
    const has = (f) => A.exists(s.id, f);
    const book = has("classbook.md"), qa = has("qabank.md"), rep = has("replay_audio.m4a"), cl = has("clean_audio.m4a");
    const cs = J(A.readText(s.id, "clean.json"), null);
    // live state of each step from the job's stage text, e.g. "Class Book ✓ · Replay 34% · Clean audio 60%"
    const segs = busy ? String(st.stage || "").split(" · ") : [];
    const live = (name) => { const sg = segs.find((x) => x.startsWith(name)); return sg ? sg.slice(name.length).trim() : ""; };
    const pct = (txt) => { const m = /(\d+)%/.exec(txt || ""); return m ? +m[1] : null; };
    const row = (icon, title, sub, ready, actions, what, liveName, extra) => {
      const lv = busy && !ready ? live(liveName) : "";
      const p = pct(lv);
      const state = lv ? (lv.startsWith("—") ? lv.slice(1).trim() : lv === "…" ? "Starting…" : lv === "✗" ? "Didn't finish" : p !== null ? `Making… ${p}%` : lv) : "";
      return `<div class="exrow">${ic(icon)}<div class="tx"><b>${title}</b><span>${state ? esc(state) : sub}</span>${lv && p !== null ? `<div class="bar sm"><i style="width:${Math.max(3, p)}%"></i></div>` : ""}</div>
      ${ready ? actions : extra || ""}${ready && !busy ? `<button class="iconbtn" data-exre="${what}" title="Make again">${ic("refresh")}</button>` : ""}</div>`;
    };
    const rp = J(A.readText(s.id, "replay_audio.m4a.progress.json"), null);
    const repPreview = !rep && A.exists(s.id, "replay_audio.m4a.preview.m4a") && rp ? `<button class="btn small gold" data-exprev>Play ${rp.done}/${rp.total}</button>` : "";
    const err = !st.running && st.error && (st.job || "").startsWith("experience") ? `<p class="meta" style="color:var(--warn);margin:8px 0 0">${esc(st.error)}</p>` : "";
    return `<h2 class="sec">Relive this class</h2><div class="card exp">
      ${row("book", "Class Book", book ? "The class as a step-by-step chapter · PDF" : "The whole class as a clear, step-by-step chapter", book, `<button class="btn small gold" data-exbook>Open</button>`, "book", "Class Book")}
      ${row("list", "Q&A Bank", qa ? "Every class question + discussion, exam practice · PDF" : "All questions asked in class + exam practice with answers", qa, `<button class="btn small gold" data-exqa>Open</button>`, "qa", "Q&A Bank")}
      ${row("head", "Classroom Replay", rep ? "Teacher & student voices — feel the class again" : "Re-lives the class as a teacher–student conversation", rep, `<button class="btn small gold" data-exrep>Play</button>`, "replay", "Replay", repPreview)}
      ${row("spark", "Clean recording", cl && cs ? `${dur(cs.outMs)} · removed ${dur(cs.cutMs + cs.silenceMs)} of noise, breaks & side talk` : "Original audio with noise, silences & side talk removed", cl, `<button class="btn small gold" data-excl>Play</button>`, "clean", "Clean audio")}
      ${busy && st.updated && Date.now() - st.updated > 4 * 60000 ? `<div class="stuck">${ic("bolt")}<span>No progress for ${Math.round((Date.now() - st.updated) / 60000)} min — it may be stuck.</span><button class="btn small line" data-unstick>Stop</button></div>` : ""}
      ${busy ? `<div class="status" style="margin-top:12px"><div class="spin" style="width:22px;height:22px;flex:none"></div><div><b style="font-size:13px">Overall ${Math.round((st.progress || 0) * 100)}%</b><span>${st.started ? clock(Date.now() - st.started) + " elapsed · " : ""}you can lock the phone — it keeps going</span></div></div><div class="bar"><i style="width:${Math.max(3, Math.round((st.progress || 0) * 100))}%"></i></div>`
        : !(book && qa && rep && cl) ? `<button class="btn gold block" style="margin-top:12px" data-exall>${ic("spark")} ${book || qa || rep || cl ? "Create the rest" : "Create class experience"}</button>` : ""}
      ${err}</div>`;
  }
  function bindExp(app, s) {
    const run = (w) => { A.process(s.id, "experience", w, "", false); toast("Preparing… you can leave this screen"); setTimeout(render, 300); };
    const us = $("[data-unstick]", app); if (us) us.onclick = () => { A.resetJob(s.id); toast("Stopped — tap ↻ / Create to start again"); setTimeout(render, 200); };
    const a = $("[data-exall]", app); if (a) a.onclick = () => run("all");
    $$("[data-exre]", app).forEach((b) => (b.onclick = () => confirmSheet("Make it again?", "The current version will be replaced.", "Make again", false, () => run(b.dataset.exre))));
    const bk = $("[data-exbook]", app); if (bk) bk.onclick = () => go("book", { id: s.id, doc: "classbook" });
    const qb = $("[data-exqa]", app); if (qb) qb.onclick = () => go("book", { id: s.id, doc: "qabank" });
    const rp = $("[data-exrep]", app); if (rp) rp.onclick = () => A.playLoad(`${A.sessionPath(s.id)}/replay_audio.m4a`, s.title, "Classroom replay", 0);
    const pv = $("[data-exprev]", app); if (pv) pv.onclick = () => { A.playLoad(`${A.sessionPath(s.id)}/replay_audio.m4a.preview.m4a`, s.title, "Classroom replay (first parts)", 0); toast("Playing the parts ready so far — the rest is being made"); };
    const cl = $("[data-excl]", app); if (cl) cl.onclick = () => A.playLoad(`${A.sessionPath(s.id)}/clean_audio.m4a`, s.title, "Clean recording", 0);
  }
  VIEWS.book = () => {
    const s = sess(params.id);
    if (!s) return `<button class="back" data-back>${ic("left")} Back</button><div class="empty">Deleted.</div>`;
    return `<button class="back" data-back>${ic("left")} ${esc(s.title)}</button>
      <div class="actions" style="grid-template-columns:repeat(3,1fr);margin-top:0">
        <button class="act hi" data-bpdf>${ic("file")}PDF</button>
        <button class="act" data-brep ${A.exists(s.id, "replay_audio.m4a") ? "" : "disabled"}>${ic("head")}Replay</button>
        <button class="act" data-bshare>${ic("share")}Share</button></div>
      <div class="md book" style="margin-top:16px">${mdHtml(A.readText(s.id, (params.doc || "classbook") + ".md"))}</div>`;
  };
  BIND.book = (app) => {
    const s = sess(params.id);
    $("[data-back]", app).onclick = back;
    if (!s) return;
    $$(".md [data-t]", app).forEach((b) => (b.onclick = () => playOriginal(s, Math.max(0, Number(b.dataset.t) - 3000))));
    const docName = params.doc || "classbook";
    $("[data-bpdf]", app).onclick = () => makePdf(s, "", A.readText(s.id, docName + ".md"), docName === "qabank" ? "Q&A BANK" : "CLASS BOOK");
    $("[data-brep]", app).onclick = () => A.playLoad(`${A.sessionPath(s.id)}/replay_audio.m4a`, s.title, "Classroom replay", 0);
    $("[data-bshare]", app).onclick = () => A.shareFile(s.id, docName + ".md", `${fileBase(s)} - ${docName === "qabank" ? "Q&A Bank" : "Class Book"}.md`);
  };

  // ================================================================== ASK MEMORA (separate per segment)
  let askScope = { edu: "", meet: "" }, asking = false;
  const askKey = () => segOf();
  function askThread() { db.asks = db.asks || { edu: [], meet: [] }; db.asks[askKey()] = db.asks[askKey()] || []; return db.asks[askKey()]; }
  function answerHtml(a) {
    let h = mdHtml(a || "");
    h = h.replace(/\[\[([A-Za-z0-9_\-]+)\|([^\]]+)\]\]/g, (m, id, label) => `<button class="src" data-src="${id}">${ic(segOf() === "meet" ? "list" : "book")}${label}</button>`);
    return h;
  }
  VIEWS.ask = () => {
    const meet = segOf() === "meet";
    const th = askThread();
    const scopes = meet ? seriesList().map((x) => [x, x]) : db.subjects.map((x) => [x.id, x.name]);
    const sc = askScope[askKey()];
    const sugg = meet
      ? ["What is pending, why, and whom should I follow up?", "What should I raise in my next meeting?", "What did I promise this week?", "Summarise this month for my manager"]
      : ["Explain the main topics from my last class", "What did sir say is important for the exam?", "Any assignments or deadlines?", "Quiz me on this week's classes"];
    return `<div class="top"><div class="brand">Ask Memora</div>${th.length ? `<button class="iconbtn" data-clear title="Clear">${ic("trash")}</button>` : ""}</div>
      <div class="askhint">${ic(meet ? "users" : "book")} Searching only your <b>${meet ? "meetings" : "classes"}</b>${meet ? "" : ""}</div>
      ${scopes.length ? `<div class="langs"><button class="lang ${!sc ? "on" : ""}" data-sc="">All ${meet ? "meetings" : "subjects"}</button>${scopes.map(([k, l]) => `<button class="lang ${sc === k ? "on" : ""}" data-sc="${esc(k)}">${esc(l)}</button>`).join("")}</div>` : ""}
      <div class="chat" id="chat">
        ${th.length ? th.map((m) => `<div class="msg q">${esc(m.q)}</div>${m.a ? `<div class="msg a md">${answerHtml(m.a)}</div>` : m.err ? `<div class="msg a err">${esc(m.err)}</div>` : ""}`).join("") :
          `<div class="empty" style="padding-top:18px"><div class="big">Ask anything from your ${meet ? "meetings" : "classes"}</div>Memora answers only from what was recorded, and shows where it heard it.</div>
           <div class="suggs">${sugg.map((x) => `<button class="sugg" data-sg="${esc(x)}">${esc(x)}</button>`).join("")}</div>`}
        ${asking ? `<div class="msg a typing"><i></i><i></i><i></i></div>` : ""}
      </div>
      <div class="askbar"><textarea id="askin" rows="1" placeholder="Ask about your ${meet ? "meetings" : "classes"}…"></textarea><button class="askgo" data-ask>${ic("right")}</button></div>`;
  };
  BIND.ask = (app) => {
    const send = (q) => {
      q = (q || "").trim(); if (!q || asking) return;
      const th = askThread();
      th.push({ q, a: "", at: nowISO() });
      while (th.length > 40) th.shift();
      asking = true; save(); render();
      A.ask(askKey(), askScope[askKey()], q, JSON.stringify(th.slice(0, -1)));
    };
    $("[data-ask]", app).onclick = () => send($("#askin").value);
    const ta = $("#askin", app);
    ta.oninput = () => { ta.style.height = "auto"; ta.style.height = Math.min(120, ta.scrollHeight) + "px"; };
    $$("[data-sg]", app).forEach((b) => (b.onclick = () => send(b.dataset.sg)));
    $$("[data-sc]", app).forEach((b) => (b.onclick = () => { askScope[askKey()] = b.dataset.sc; render(); }));
    $$("[data-src]", app).forEach((b) => (b.onclick = () => { if (sess(b.dataset.src)) go("session", { id: b.dataset.src }); else toast("That record was deleted"); }));
    const cl = $("[data-clear]", app); if (cl) cl.onclick = () => confirmSheet("Clear this conversation?", "Your recordings and notes are not affected.", "Clear", true, () => { db.asks[askKey()] = []; save(); render(); });
    setTimeout(() => window.scrollTo(0, document.body.scrollHeight), 30);
  };
  window.onAsk = (r) => {
    asking = false;
    const th = askThread(); const last = th[th.length - 1];
    if (last && !last.a) { if (r.ok) last.a = r.answer; else last.err = r.msg || "Something went wrong"; }
    save(); if (view === "ask") render();
  };

  // ================================================================== REVISE (quiz + flashcards)
  let rv = { sid: null, mode: "quiz", i: 0, picked: null, score: 0, flip: false };
  function reviseBody(s) {
    const st = job(s.id);
    const q = J(A.readText(s.id, "quiz.json"), null);
    if (!q) {
      const busy = st.running && (st.job || "") === "quiz";
      return `<div class="card" style="text-align:center;padding:22px 18px"><div class="big" style="font-weight:700;font-size:15px;margin-bottom:6px">Test yourself on this class</div>
        <p class="meta" style="margin:0 0 14px">10–15 exam-style questions and flashcards made only from what was taught.</p>
        <button class="btn gold block" data-mkquiz ${busy || !A.exists(s.id, "summary.md") ? "disabled" : ""}>${busy ? "Preparing…" : ic("spark") + " Create quiz & flashcards"}</button></div>`;
    }
    if (rv.sid !== s.id) rv = { sid: s.id, mode: "quiz", i: 0, picked: null, score: 0, flip: false };
    const qs = q.questions || [], cs = q.cards || [];
    const tabs = `<div class="segs" style="margin-bottom:12px"><button class="seg ${rv.mode === "quiz" ? "on" : ""}" data-rm="quiz">Quiz · ${qs.length}</button><button class="seg ${rv.mode === "cards" ? "on" : ""}" data-rm="cards">Flashcards · ${cs.length}</button></div>`;
    if (rv.mode === "quiz") {
      if (rv.i >= qs.length) return tabs + `<div class="card" style="text-align:center;padding:24px"><div style="font-size:30px;font-weight:700">${rv.score}/${qs.length}</div><p class="meta">${rv.score / qs.length >= 0.8 ? "Excellent — you've got this class." : rv.score / qs.length >= 0.5 ? "Good. Revise the ones you missed." : "Worth another listen to the voice recap."}</p><button class="btn gold block" data-again>Try again</button></div>`;
      const it = qs[rv.i];
      return tabs + `<div class="card"><div class="eyebrow" style="margin-bottom:8px">Question ${rv.i + 1} of ${qs.length} · Score ${rv.score}</div>
        <div style="font-weight:600;font-size:14.5px;line-height:1.45;margin-bottom:12px">${esc(it.q)}</div>
        ${(it.options || []).map((o, k) => {
          let cls = ""; if (rv.picked !== null) { if (k === it.answer) cls = "right"; else if (k === rv.picked) cls = "wrong"; }
          return `<button class="qopt ${cls}" data-pick="${k}" ${rv.picked !== null ? "disabled" : ""}><span>${"ABCD"[k]}</span>${esc(o)}</button>`;
        }).join("")}
        ${rv.picked !== null ? `<div class="qwhy">${rv.picked === it.answer ? "✓ Correct. " : "✗ Not quite. "}${esc(it.why || "")}</div><button class="btn gold block" style="margin-top:10px" data-next>${rv.i + 1 < qs.length ? "Next question" : "See score"}</button>` : ""}</div>`;
    }
    if (!cs.length) return tabs + `<div class="empty">No flashcards.</div>`;
    const c = cs[rv.i % cs.length];
    return tabs + `<button class="fcard ${rv.flip ? "flip" : ""}" data-flip><div class="eyebrow">${rv.flip ? "Answer" : "Card " + ((rv.i % cs.length) + 1) + " of " + cs.length}</div><div class="ftext">${esc(rv.flip ? c.back : c.front)}</div><div class="meta">${rv.flip ? "" : "Tap to reveal"}</div></button>
      <div class="row" style="margin-top:10px"><button class="btn line" data-cprev>${ic("left")} Prev</button><button class="btn gold" data-cnext>Next ${ic("right")}</button></div>`;
  }
  function bindRevise(app, s) {
    const mk = $("[data-mkquiz]", app); if (mk) mk.onclick = () => { A.process(s.id, "quiz", "", "", false); setTimeout(render, 300); };
    $$("[data-rm]", app).forEach((b) => (b.onclick = () => { rv.mode = b.dataset.rm; rv.i = 0; rv.picked = null; rv.score = 0; rv.flip = false; render(); }));
    const q = J(A.readText(s.id, "quiz.json"), { questions: [] });
    $$("[data-pick]", app).forEach((b) => (b.onclick = () => { rv.picked = +b.dataset.pick; if (rv.picked === q.questions[rv.i].answer) rv.score++; render(); }));
    const nx = $("[data-next]", app); if (nx) nx.onclick = () => { rv.i++; rv.picked = null; render(); };
    const ag = $("[data-again]", app); if (ag) ag.onclick = () => { rv.i = 0; rv.score = 0; rv.picked = null; render(); };
    const fl = $("[data-flip]", app); if (fl) fl.onclick = () => { rv.flip = !rv.flip; render(); };
    const cn = $("[data-cnext]", app); if (cn) cn.onclick = () => { rv.i++; rv.flip = false; render(); };
    const cp = $("[data-cprev]", app); if (cp) cp.onclick = () => { rv.i = Math.max(0, rv.i - 1); rv.flip = false; render(); };
  }

  // ================================================================== SUBJECT PACK (weekly recap / study guide)
  const packId = (subjectId) => "p_" + (subjectId || "general");
  function packCard(subjectId) {
    const pid = packId(subjectId);
    const st = job(pid);
    const row = (range, title, sub) => {
      const ready = A.exists(pid, `pack_${range}.md`);
      const busy = st.running && (st.job || "") === "pack:" + range;
      return `<div class="opt" style="padding:12px 0">${ic(range === "week" ? "cal" : "book")}<div class="tx"><b>${title}</b><span>${busy ? esc(st.stage || "Preparing") + " · " + Math.round((st.progress || 0) * 100) + "%" : ready ? "Ready · notes + audio" : sub}</span></div>
        ${ready && !busy ? `<button class="btn small gold" data-popen="${range}">Open</button>` : ""}
        <button class="iconbtn" data-pmake="${range}" ${busy ? "disabled" : ""} title="${ready ? "Refresh" : "Create"}">${ic(ready ? "refresh" : "spark")}</button></div>`;
    };
    const err = !st.running && st.error && (st.job || "").startsWith("pack") ? `<p class="meta" style="color:var(--warn);margin:4px 0 0">${esc(st.error)}</p>` : "";
    return `<h2 class="sec">Revision packs</h2><div class="card" style="padding:4px 16px">${row("week", "This week's recap", "Last 7 days in one note + audio")}${row("all", "Full study guide", "Every class merged by topic — for exams")}${err}</div>`;
  }
  function bindPack(app, subjectId) {
    const pid = packId(subjectId);
    $$("[data-pmake]", app).forEach((b) => (b.onclick = () => { A.process(pid, "pack", b.dataset.pmake, "", false); toast("Preparing… you can leave this screen"); setTimeout(render, 300); }));
    $$("[data-popen]", app).forEach((b) => (b.onclick = () => go("pack", { subjectId, range: b.dataset.popen })));
  }
  VIEWS.pack = () => {
    const sb = subj(params.subjectId) || GENERAL;
    const pid = packId(params.subjectId), r = params.range;
    const md = A.readText(pid, `pack_${r}.md`);
    return `<button class="back" data-back>${ic("left")} ${esc(sb.name)}</button>
      <div class="shead"><div class="eyebrow" style="color:${sb.color}">${r === "week" ? "Weekly recap" : "Study guide"}</div><h1>${esc(sb.name)}</h1></div>
      <div class="actions" style="grid-template-columns:repeat(2,1fr)"><button class="act hi" data-plisten ${A.exists(pid, `pack_audio_${r}.m4a`) ? "" : "disabled"}>${ic("head")}Listen</button><button class="act" data-ppdf>${ic("file")}PDF</button></div>
      <div class="md" style="margin-top:14px">${mdHtml(md)}</div>`;
  };
  BIND.pack = (app) => {
    const sb = subj(params.subjectId) || GENERAL;
    const pid = packId(params.subjectId), r = params.range;
    $("[data-back]", app).onclick = back;
    $("[data-plisten]", app).onclick = () => A.playLoad(`${A.sessionPath(pid)}/pack_audio_${r}.m4a`, `${sb.name} — ${r === "week" ? "This week" : "Study guide"}`, "Audio recap", 0);
    $("[data-ppdf]", app).onclick = () => makePdf({ id: pid, title: `${sb.name} — ${r === "week" ? "Weekly recap" : "Study guide"}`, date: new Date().toISOString(), dateLabel: fmtDate(new Date().toISOString()), subjectId: params.subjectId, photos: [] }, "", A.readText(pid, `pack_${r}.md`), r === "week" ? "WEEKLY RECAP" : "STUDY GUIDE");
  };

  // ================================================================== MEETING PLANS + BRIEF
  function planSheet(s) {
    const d = new Date(Date.now() + 7 * 86400000);
    const def = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(new Date(s.date).getHours())}:${pad(new Date(s.date).getMinutes())}`;
    const sh = sheet(`<h3>Plan the next meeting</h3><p class="sub">Memora reminds you 10 minutes before with a brief: open follow-ups and pending agenda${s.series ? " from “" + esc(s.series) + "”" : ""}.</p>
      <div class="field"><label>When</label><input class="inp" type="datetime-local" id="pat" value="${def}"></div>
      <div class="field"><label>Title</label><input class="inp" id="ptt" value="${esc(s.series ? `${s.series} · #${meetings().filter((m) => m.series === s.series).length + 1}` : s.title)}"></div>
      <button class="btn gold block" data-ok>Save & remind me</button>`);
    $("[data-ok]", sh).onclick = () => {
      const at = new Date($("#pat").value);
      if (isNaN(at)) { toast("Pick a date and time"); return; }
      db.plans = db.plans || [];
      db.plans.push({ id: "p" + uid(), at: at.toISOString(), title: $("#ptt").value.trim() || "Meeting", series: s.series || "", fromId: s.id, mtype: s.mtype || "Official", attendees: s.attendees || "" });
      save(); closeSheet(); toast("Planned · reminder set"); render();
    };
  }
  function pendingAgendaOf(series, fromId) {
    const last = (series ? meetings().filter((m) => m.series === series) : meetings().filter((m) => m.id === fromId))[0];
    if (!last) return [];
    return J(A.readText(last.id, "agenda.json"), []).filter((a) => a.status !== "done").map((a) => a.item);
  }
  let briefBusy = "";
  VIEWS.brief = () => {
    const p = (db.plans || []).find((x) => x.id === params.id);
    if (!p) return `<button class="back" data-back>${ic("left")} Back</button><div class="empty">This plan was removed.</div>`;
    const tasks = planTasks(p);
    const pend = pendingAgendaOf(p.series, p.fromId);
    const tp = topicsOf(p);
    const last = p.series ? meetings().filter((m) => m.series === p.series)[0] : sess(p.fromId);
    const ns = namesOf(p.attendees).map(firstName);
    const withThem = meetings().filter((m) => m !== last && ns.length && namesOf(m.attendees).some((n) => ns.includes(firstName(n)))).slice(0, 3);
    const mem = (db.memos || []).filter((m) => !m.done && ((last && m.meetingId === last.id) || withThem.some((w) => w.id === m.meetingId)));
    return `<button class="back" data-back>${ic("left")} Back</button>
      <div class="shead"><div class="eyebrow">Meeting brief${p.series ? " · " + esc(p.series) : ""}</div><h1>${esc(p.title)}</h1>
      <div class="meta"><span>${fmtDay(p.at)}, ${fmtDate(p.at)} · ${hm(p.at)}</span>${p.attendees ? `<span>${esc(p.attendees)}</span>` : ""}</div></div>
      <button class="btn gold block" style="margin-top:16px" data-startp>${ic("mic")} Start this meeting</button>
      <div class="row" style="margin-top:8px"><button class="btn line" data-editp>${ic("edit")} Edit</button><button class="btn line" data-preread>${ic("share")} Send pre-read</button></div>
      ${tp.length || pend.length ? `<h2 class="sec">To discuss</h2><div class="card" style="padding:6px 14px">${tp.map((x) => `<div class="agi"><span class="chip gold">Topic</span><div><b>${esc(x)}</b></div></div>`).join("")}${pend.filter((x) => !tp.includes(x)).map((x) => `<div class="agi"><span class="chip err">Pending</span><div><b>${esc(x)}</b><span>Not finished last time</span></div></div>`).join("")}</div>` : ""}
      <h2 class="sec">Open with them · ${tasks.length}</h2><div class="tklist">${tasks.map((t) => ticketRow(t, true)).join("") || `<div class="empty">Nothing open — clean slate.</div>`}</div>
      ${mem.length ? `<h2 class="sec">Remember</h2><div class="card" style="padding:6px 14px">${mem.map((m) => `<div class="agi"><span class="chip gold">${ic("star")}</span><div><b>${esc(m.text)}</b></div></div>`).join("")}</div>` : ""}
      <h2 class="sec">Talking points</h2>
      ${p.brief ? `<div class="card md">${mdHtml(p.brief)}</div>` : `<div class="card" style="color:var(--muted)">Memora reads your past meetings with these people and prepares what to say, what to ask and what to push for.</div>`}
      <button class="btn line block" style="margin-top:8px" data-tpts ${briefBusy ? "disabled" : ""}>${ic("spark")} ${briefBusy === p.id ? "Preparing…" : p.brief ? "Prepare again" : "Prepare talking points"}</button>
      ${last ? `<h2 class="sec">Last meeting</h2>${meetingItem(last)}` : ""}
      ${withThem.length ? `<h2 class="sec">Earlier with them</h2><div class="list">${withThem.map(meetingItem).join("")}</div>` : ""}
      <button class="btn danger block" style="margin-top:18px" data-delp>${ic("trash")} Remove from lineup</button>`;
  };
  BIND.brief = (app) => {
    $("[data-back]", app).onclick = back;
    bindOpen(app); bindTickets(app);
    const p = (db.plans || []).find((x) => x.id === params.id); if (!p) return;
    $("[data-startp]", app).onclick = () => startFromPlan(p);
    $("[data-editp]", app).onclick = () => lineupSheet(p);
    $("[data-preread]", app).onclick = () => A.shareText(preRead(p));
    $("[data-delp]", app).onclick = () => { db.plans = db.plans.filter((x) => x.id !== p.id); save(); back(); };
    $("[data-tpts]", app).onclick = () => {
      if (briefBusy) return;
      const ns = namesOf(p.attendees).map(firstName);
      const rel = meetings().filter((m) => (p.series && m.series === p.series) || m.id === p.fromId || (ns.length && namesOf(m.attendees).some((n) => ns.includes(firstName(n))))).slice(0, 6);
      const ctx = [`UPCOMING MEETING: ${p.title} | ${fmtDay(p.at)} ${fmtDate(p.at)} ${hm(p.at)} | with: ${p.attendees || "-"}`, `TOPICS I WANT TO COVER:\n${topicsOf(p).map((x) => "- " + x).join("\n") || "- (none given)"}`,
        `OPEN ITEMS WITH THEM:\n${planTasks(p).map((t) => `- ${t.text} | owner: ${t.owner || "-"} | due: ${t.due || "-"}${t.pending ? " | pending: " + (t.pending.reason || "") : ""}`).join("\n") || "- none"}`,
        ...rel.map((m) => `=== PAST MEETING ${fmtDate(m.date)} | ${m.title} | with: ${m.attendees || "-"} ===\n${A.readText(m.id, "summary.md")}`)].join("\n\n");
      const prompt = `Prepare me for this meeting. I am ${db.settings.name || "the user"}. Use ONLY the data below from my earlier recorded meetings and tasks.
Write short Markdown with these sections: '## Goal for this meeting' (one line), '## Say' (3-5 points to raise, most important first), '## Ask' (questions to ask, including status of open items), '## Push for' (decisions or commitments to get), '## Watch out' (risks, sensitivities, past promises). Be specific with names, numbers and dates. Max 180 words.`;
      briefBusy = p.id; render();
      aiGen(prompt, ctx, false).then((md) => { p.brief = md; save(); }).catch((e) => toast(e.message)).then(() => { briefBusy = ""; if (view === "brief") render(); });
    };
  };

  // ================================================================== MEETINGS PRO — AI helper, lineup, clarity, reports
  const GEN = {}; let genN = 0;
  function aiGen(prompt, text, json) {
    return new Promise((res, rej) => {
      if (!db.settings.apiKey) { rej(new Error("Add your free Gemini AI key in Settings first.")); return; }
      const id = "g" + (++genN) + uid(); GEN[id] = { res, rej };
      try { A.gen(id, prompt, text, !!json); } catch (e) { delete GEN[id]; rej(e); }
    });
  }
  window.onGen = (id, r) => { const g = GEN[id]; if (!g) return; delete GEN[id]; if (r && r.ok) g.res(r.text || ""); else g.rej(new Error((r && r.msg) || "Something went wrong")); };
  const parseJ = (raw) => { try { return JSON.parse(String(raw).slice(String(raw).indexOf("{"), String(raw).lastIndexOf("}") + 1)); } catch (e) { return null; } };
  const tsMs = (t) => { if (!t) return null; const p = String(t).replace(/[\[\]\s]/g, "").split(":").map(Number); if (!p.length || p.some(isNaN)) return null; return (p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p[0] * 60 + (p[1] || 0)) * 1000; };
  const tsBtn = (t) => { const ms = tsMs(t); return ms == null ? "" : `<button class="ts" data-t="${ms}">${esc(String(t).replace(/[\[\]]/g, ""))}</button>`; };
  const hm = (iso) => new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const firstName = (n) => String(n || "").trim().toLowerCase().split(/\s+/)[0] || "";
  const isMe = (n) => { const me = firstName(db.settings.name); const x = firstName(n); return !!x && (x === "me" || x === "myself" || x === "i" || (!!me && x === me)); };
  const namesOf = (str) => String(str || "").split(/,|;|\/|&|\band\b/i).map((x) => x.trim()).filter((x) => x.length > 1 && !isMe(x));
  const isPending = (t) => t.status === "open" && !!t.pending;
  const isMineT = (t) => !!t.mine || (t.owner ? isMe(t.owner) : false);
  const chaseWho = (t) => (t.pending && t.pending.followWith) || (!isMineT(t) ? t.owner : "") || "";
  const uniq = (a) => Array.from(new Set(a.map((x) => String(x).trim()).filter(Boolean)));
  function weekStart(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; }
  const plain = (md) => String(md || "").replace(/^#+.*$/gm, "").replace(/[*_`>|#-]/g, " ").replace(/\[\d{1,2}:\d{2}(:\d{2})?\]/g, "").replace(/\s+/g, " ").trim();

  // ---------- lineup (planned meetings)
  function nearPlan() {
    const now = Date.now();
    return (db.plans || []).filter((p) => { const t = new Date(p.at).getTime(); return t > now - 60 * 60000 && t < now + 45 * 60000; })
      .sort((a, b) => Math.abs(new Date(a.at) - now) - Math.abs(new Date(b.at) - now))[0] || null;
  }
  function planTasks(p) {
    const ns = namesOf(p.attendees).map(firstName);
    const hit = (x) => !!x && ns.some((n) => firstName(x) === n);
    return db.tickets.filter((t) => t.status === "open" && ((p.series && t.series === p.series) || (p.fromId && t.meetingId === p.fromId) || hit(t.owner) || hit(t.pending && t.pending.followWith)));
  }
  const topicsOf = (p) => String(p.topics || "").split("\n").map((x) => x.replace(/^[-•\d.\s]+/, "").trim()).filter(Boolean);
  function lineup() {
    const now = new Date(); const t1 = new Date(now); t1.setHours(24, 0, 0, 0);
    const w1 = weekStart(now); w1.setDate(w1.getDate() + 7); const w2 = new Date(w1); w2.setDate(w2.getDate() + 7);
    const d0 = new Date(now); d0.setHours(0, 0, 0, 0);
    const b = { today: [], week: [], next: [], later: [] };
    (db.plans || []).slice().sort((a, c) => a.at.localeCompare(c.at)).forEach((p) => {
      const t = new Date(p.at);
      if (t < d0) return;
      if (t < t1) b.today.push(p); else if (t < w1) b.week.push(p); else if (t < w2) b.next.push(p); else b.later.push(p);
    });
    return b;
  }
  function planItem(p) {
    const n = planTasks(p).length, tp = topicsOf(p).length;
    const past = new Date(p.at).getTime() < Date.now() - 15 * 60000;
    return `<button class="item" data-brief="${p.id}"><div class="ic lt"><b>${esc(hm(p.at).replace(/\s?[AP]M/i, ""))}</b><span>${new Date(p.at).getHours() < 12 ? "AM" : "PM"}</span></div>
      <div class="tx"><div class="t1">${esc(p.title)}</div><div class="t2">${fmtDay(p.at)}, ${fmtDate(p.at)}${p.attendees ? " · " + esc(p.attendees) : ""}</div></div>
      ${past ? `<span class="chip">Missed?</span>` : n ? `<span class="chip err">${n} open</span>` : tp ? `<span class="chip gold">${tp} topics</span>` : `<span class="chip gold">Brief</span>`}</button>`;
  }
  function lineupSheet(p, defaults) {
    const isNew = !p;
    const d0 = new Date(Date.now() + 86400000); d0.setHours(11, 0, 0, 0);
    const d = p || Object.assign({ id: "p" + uid(), at: d0.toISOString(), title: "", attendees: "", topics: "", series: "", mtype: "Official" }, defaults || {});
    const loc = (iso) => { const x = new Date(iso); return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`; };
    const series = seriesList();
    const sh = sheet(`<h3>${isNew ? "Add to lineup" : "Edit meeting plan"}</h3><p class="sub">Memora reminds you 10 minutes before with a brief of everything open with these people.</p>
      <div class="field"><label>Meeting</label><input class="inp" id="lt" placeholder="e.g. JBP review with operator" value="${esc(d.title)}"></div>
      <div class="field"><label>When</label><input class="inp" type="datetime-local" id="lat" value="${loc(d.at)}"></div>
      <div class="field"><label>Who you are meeting</label><input class="inp" id="lw" placeholder="Names, comma separated" value="${esc(d.attendees || "")}"></div>
      <div class="field"><label>Topics to discuss</label><textarea class="inp" id="ltp" placeholder="One per line">${esc(d.topics || "")}</textarea></div>
      <div class="row"><div class="field"><label>Series (optional)</label><input class="inp" id="lse" list="lserl" value="${esc(d.series || "")}" placeholder="One-off"><datalist id="lserl">${series.map((x) => `<option value="${esc(x)}">`).join("")}</datalist></div>
      <div class="field"><label>Type</label><select class="inp" id="lty">${["Official", "Personal"].map((x) => `<option ${x === d.mtype ? "selected" : ""}>${x}</option>`).join("")}</select></div></div>
      <button class="btn gold block" data-ok>${isNew ? "Add to lineup" : "Save"}</button>
      ${isNew ? "" : `<button class="btn danger block" style="margin-top:8px" data-del>${ic("trash")} Remove</button>`}`);
    $("[data-ok]", sh).onclick = () => {
      const at = new Date($("#lat").value);
      if (isNaN(at)) { toast("Pick a date and time"); return; }
      d.title = $("#lt").value.trim() || ($("#lw").value.trim() ? "Meeting with " + $("#lw").value.trim() : "Meeting");
      d.at = at.toISOString(); d.attendees = $("#lw").value.trim(); d.topics = $("#ltp").value.trim(); d.series = $("#lse").value.trim(); d.mtype = $("#lty").value;
      db.plans = db.plans || [];
      if (isNew) db.plans.push(d);
      save(); closeSheet(); toast(isNew ? "Added · reminder set" : "Saved"); render();
    };
    const dl = $("[data-del]", sh); if (dl) dl.onclick = () => { db.plans = db.plans.filter((x) => x.id !== d.id); save(); closeSheet(); if (view === "brief") back(); else render(); };
  }
  function startFromPlan(p) {
    const tasks = planTasks(p);
    const agenda = uniq(topicsOf(p).concat(pendingAgendaOf(p.series, p.fromId)).concat(tasks.length ? ["Review open follow-ups (" + tasks.length + ")"] : []));
    db.plans = db.plans.filter((x) => x.id !== p.id); save();
    startMeeting({ title: p.title, mtype: p.mtype || "Official", series: p.series || "", attendees: p.attendees || "", agenda: agenda.join("\n"), planId: p.id, plannedAt: p.at });
  }
  function quickMeeting() {
    const p = nearPlan();
    if (p) { startFromPlan(p); return; }
    startMeeting({ title: `Meeting · ${hm(nowISO())}`, titleAuto: true, mtype: "Official", series: "", attendees: "", agenda: "" });
  }
  function preRead(p) {
    const tasks = planTasks(p), tp = topicsOf(p).concat(pendingAgendaOf(p.series, p.fromId));
    const lines = [`Hi${p.attendees ? " " + namesOf(p.attendees).join(", ") : " all"},`, "", `Ahead of our meeting “${p.title}” on ${fmtDay(p.at)}, ${fmtDate(p.at)} at ${hm(p.at)}:`];
    if (tp.length) { lines.push("", "Agenda:"); uniq(tp).forEach((x, i) => lines.push(`${i + 1}. ${x}`)); }
    if (tasks.length) { lines.push("", "Open items — please bring an update:"); tasks.forEach((t) => lines.push(`- ${t.text}${t.owner ? " (" + t.owner + ")" : ""}${t.due ? " · due " + fmtDue(t.due) : ""}${t.pending ? " · pending: " + (t.pending.reason || "") : ""}`)); }
    lines.push("", "Thanks,", db.settings.name || "");
    return lines.join("\n");
  }

  // ---------- activity data (for reports, clarity, briefs)
  function activity(from, to) {
    const inR = (iso) => !!iso && new Date(iso) >= from && new Date(iso) < to;
    const ms = meetings().filter((m) => inR(m.date)).slice().reverse();
    const out = [];
    let mins = 0;
    ms.forEach((m) => {
      mins += Math.round((m.durationMs || 0) / 60000);
      const sum = A.readText(m.id, "summary.md") || "";
      const one = ((/##\s*In one line\s*\n+([^\n]+)/i.exec(sum) || [])[1] || plain(sum).slice(0, 280)).trim();
      const mx = J(A.readText(m.id, "meeting.json"), {});
      const dec = (mx.decisions || []).map((x) => (x && x.text) || x).filter(Boolean).slice(0, 6);
      out.push(`MEETING | ${fmtDay(m.date)} ${fmtDate(m.date)} | ${m.title} | with: ${m.attendees || "-"} | ${dur(m.durationMs || 0)}\n  Outcome: ${one || "-"}\n  Decisions: ${dec.join("; ") || "-"}\n  Insight: ${(mx.insights && mx.insights.clarity) || "-"}`);
    });
    const tl = (t) => `- ${t.text} | owner: ${t.owner || "-"} | due: ${t.due || "-"}${t.pending ? ` | pending: ${t.pending.reason || "-"} | chasing: ${t.pending.followWith || "-"}` : ""}${t.manager ? " | needs manager" : ""}${t.priority === "high" ? " | HIGH" : ""}`;
    const created = db.tickets.filter((t) => inR(t.created)), closed = db.tickets.filter((t) => t.status === "done" && inR(t.doneAt));
    const open = db.tickets.filter((t) => t.status === "open" && !t.pending), pend = db.tickets.filter(isPending), over = db.tickets.filter(isOverdue), mgr = db.tickets.filter((t) => t.manager && t.status === "open");
    const nextP = (db.plans || []).filter((p) => new Date(p.at) >= to && new Date(p.at) < new Date(to.getTime() + 7 * 86400000));
    const memos = (db.memos || []).filter((x) => !x.done);
    const text = [
      `PERIOD: ${fmtDate(from.toISOString())} to ${fmtDate(new Date(to.getTime() - 1).toISOString())}`,
      `NUMBERS: ${ms.length} meetings, ${Math.round(mins / 6) / 10} hours in meetings, ${created.length} tasks created, ${closed.length} closed, ${open.length} open, ${pend.length} pending, ${over.length} overdue`,
      "", "MEETINGS:", out.join("\n") || "- none",
      "", "TASKS CLOSED IN PERIOD:", closed.map(tl).join("\n") || "- none",
      "", "TASKS CREATED IN PERIOD:", created.map(tl).join("\n") || "- none",
      "", "STILL OPEN:", open.slice(0, 60).map(tl).join("\n") || "- none",
      "", "PENDING / BLOCKED:", pend.map(tl).join("\n") || "- none",
      "", "OVERDUE:", over.map(tl).join("\n") || "- none",
      "", "NEEDS MANAGER ALIGNMENT:", mgr.map(tl).join("\n") || "- none",
      "", "UPCOMING MEETINGS (next 7 days):", nextP.map((p) => `- ${fmtDay(p.at)} ${fmtDate(p.at)} ${hm(p.at)} | ${p.title} | with: ${p.attendees || "-"} | topics: ${topicsOf(p).join("; ") || "-"}`).join("\n") || "- none",
      "", "THINGS TO REMEMBER:", memos.map((x) => `- ${x.text}${x.date ? " (" + x.date + ")" : ""}`).join("\n") || "- none",
    ].join("\n");
    return { text, n: { meetings: ms.length, mins, created: created.length, closed: closed.length, open: open.length, pending: pend.length, overdue: over.length, manager: mgr.length } };
  }

  // ---------- clarity
  let clarBusy = false, clarErr = "";
  function clarityStats() {
    const now = new Date(), w0 = weekStart(now);
    const wk = meetings().filter((m) => new Date(m.date) >= w0);
    const d30 = new Date(Date.now() - 30 * 86400000).toISOString();
    const recent = db.tickets.filter((t) => (t.created || "") >= d30);
    const done30 = recent.filter((t) => t.status === "done").length;
    const waiting = {};
    db.tickets.filter((t) => t.status === "open").forEach((t) => { const w = chaseWho(t); if (w) waiting[w] = (waiting[w] || 0) + 1; });
    return {
      meetings: wk.length, mins: wk.reduce((a, m) => a + Math.round((m.durationMs || 0) / 60000), 0),
      closedWeek: db.tickets.filter((t) => t.status === "done" && t.doneAt && new Date(t.doneAt) >= w0).length,
      rate: recent.length ? Math.round((done30 / recent.length) * 100) : null,
      open: db.tickets.filter((t) => t.status === "open" && !t.pending).length, pending: db.tickets.filter(isPending).length,
      overdue: db.tickets.filter(isOverdue).length, manager: db.tickets.filter((t) => t.manager && t.status === "open").length,
      waiting: Object.entries(waiting).sort((a, b) => b[1] - a[1]).slice(0, 5),
    };
  }
  function makeClarity(silent) {
    if (clarBusy) return;
    if (!db.settings.apiKey) { if (!silent) toast("Add your Gemini key in Settings first"); return; }
    if (!meetings().length && !db.tickets.length) { if (!silent) toast("Record a meeting first"); return; }
    clarBusy = true; clarErr = ""; if (view === "clarity" || view === "meetings") render();
    const act = activity(new Date(Date.now() - 14 * 86400000), new Date(Date.now() + 60000));
    const prompt = `You are my chief of staff. Today is ${fmtDay(nowISO())}, ${fmtDate(nowISO())}. I am ${db.settings.name || "the user"}.
Using ONLY my meeting and task data below (from my recordings), give me a clear line of sight on my work: where it stands, what to do next, and the direction to take. Be specific (names, dates, numbers), practical and brief. No generic advice.
Return ONLY JSON: {"headline": one sentence on where my work stands right now, "focus": [the 3 most important things to do next, each one line with the reason], "openLoops": [items at risk of being forgotten or slipping], "followUps": [{"person": name, "about": what to chase them for}], "risks": [short bullets], "direction": [2 to 4 lines of guidance on direction and approach, based on patterns across my meetings], "pattern": one honest observation about my working pattern with one practical suggestion}`;
    aiGen(prompt, act.text, true).then((raw) => {
      const d = parseJ(raw); if (!d) throw new Error("Could not read the AI answer. Try again.");
      db.clarity = { at: nowISO(), data: d }; save();
    }).catch((e) => { clarErr = e.message; if (!silent) toast(e.message); })
      .then(() => { clarBusy = false; if (view === "clarity" || view === "meetings") render(); });
  }
  const clarityFresh = () => db.clarity && Date.now() - new Date(db.clarity.at).getTime() < 12 * 3600000;
  VIEWS.clarity = () => {
    const s = clarityStats(), c = (db.clarity && db.clarity.data) || null;
    const li = (a) => (a || []).map((x) => `<li>${esc(typeof x === "string" ? x : JSON.stringify(x))}</li>`).join("");
    return `<button class="back" data-back>${ic("left")} Home</button>
      <div class="shead"><div class="eyebrow">${ic("spark")} My clarity</div><h1>${c ? esc(c.headline || "Where your work stands") : "Where your work stands"}</h1>
      <div class="meta"><span>${db.clarity ? "Updated " + fmtDate(db.clarity.at) + " · " + hm(db.clarity.at) : "Built from your recordings and tasks"}</span></div></div>
      <div class="stats four" style="margin-top:14px">
        <div class="stat"><b>${s.meetings}</b><span>Meetings this week</span></div>
        <div class="stat"><b>${Math.round(s.mins / 6) / 10}h</b><span>In meetings</span></div>
        <div class="stat"><b>${s.closedWeek}</b><span>Closed this week</span></div>
        <div class="stat"><b>${s.rate == null ? "—" : s.rate + "%"}</b><span>Done rate · 30 days</span></div>
      </div>
      <div class="stats four">
        <button class="stat" data-tk="open"><b>${s.open}</b><span>Open</span></button>
        <button class="stat ${s.pending ? "warn" : ""}" data-tk="pending"><b>${s.pending}</b><span>Pending</span></button>
        <button class="stat ${s.overdue ? "warn" : ""}" data-tk="open"><b>${s.overdue}</b><span>Overdue</span></button>
        <button class="stat" data-tk="follow"><b>${s.manager}</b><span>For manager</span></button>
      </div>
      ${clarBusy ? `<div class="card status" style="margin-top:12px">${ic("spark")}<div><b>Reading all your meetings and tasks…</b><span>About 20 seconds</span></div></div>` : ""}
      ${clarErr && !clarBusy ? `<div class="card" style="margin-top:12px;color:var(--rec)">${esc(clarErr)}</div>` : ""}
      ${c ? `
        <h2 class="sec">Focus next</h2><div class="card"><ol class="ol">${li(c.focus)}</ol></div>
        ${(c.followUps || []).length ? `<h2 class="sec">Follow up with</h2><div class="card">${c.followUps.map((f) => `<div class="agi"><span class="chip gold">${esc(f.person || "")}</span><div><b>${esc(f.about || "")}</b></div></div>`).join("")}</div>` : ""}
        ${(c.openLoops || []).length ? `<h2 class="sec">Open loops</h2><div class="card"><ul class="ol">${li(c.openLoops)}</ul></div>` : ""}
        ${(c.direction || []).length ? `<h2 class="sec">Direction</h2><div class="card"><ul class="ol">${li(c.direction)}</ul></div>` : ""}
        ${(c.risks || []).length ? `<h2 class="sec">Risks</h2><div class="card"><ul class="ol">${li(c.risks)}</ul></div>` : ""}
        ${c.pattern ? `<h2 class="sec">Your working pattern</h2><div class="card insq">${esc(c.pattern)}</div>` : ""}` : ""}
      ${s.waiting.length ? `<h2 class="sec">Waiting on people</h2><div class="card">${s.waiting.map(([n, k]) => `<div class="agi"><span class="chip">${k}</span><div><b>${esc(n)}</b></div></div>`).join("")}</div>` : ""}
      <button class="btn ${c ? "line" : "gold"} block" style="margin-top:16px" data-clar ${clarBusy ? "disabled" : ""}>${ic("refresh")} ${c ? "Update clarity" : "Build my clarity"}</button>`;
  };
  BIND.clarity = (app) => {
    $("[data-back]", app).onclick = back;
    $("[data-clar]", app).onclick = () => makeClarity(false);
    $$("[data-tk]", app).forEach((b) => (b.onclick = () => { taskTab = b.dataset.tk; go("tasks"); }));
    if (!clarityFresh() && !clarBusy && !clarErr && db.settings.apiKey && meetings().some((m) => A.exists(m.id, "summary.md"))) makeClarity(true);
  };

  // ---------- reports (weekly manager update + 4-week monthly)
  let repBusy = "", repErr = "", repOpen = "";
  function repRange(kind) {
    const now = new Date();
    if (kind === "week") { const from = weekStart(now); const to = new Date(now.getTime() + 60000); return { from, to, label: `${fmtDate(from.toISOString())} – ${fmtDate(now.toISOString())}` }; }
    const to = new Date(now.getTime() + 60000); const from = weekStart(now); from.setDate(from.getDate() - 21);
    return { from, to, label: `4 weeks · ${fmtDate(from.toISOString())} – ${fmtDate(now.toISOString())}` };
  }
  function makeReport(kind) {
    if (repBusy) return;
    if (!db.settings.apiKey) { toast("Add your Gemini key in Settings first"); return; }
    const r = repRange(kind), me = db.settings.name || "", mgr = db.settings.managerName || "";
    let data;
    if (kind === "week") data = activity(r.from, r.to).text;
    else {
      const weeks = [];
      for (let i = 0; i < 4; i++) {
        const a = new Date(r.from); a.setDate(a.getDate() + i * 7); const b = new Date(a); b.setDate(b.getDate() + 7);
        const act = activity(a, b < r.to ? b : r.to);
        weeks.push(`===== WEEK ${i + 1} (${fmtDate(a.toISOString())} – ${fmtDate(new Date(Math.min(b, r.to) - 1).toISOString())}) =====\n${act.text}`);
      }
      const prev = (db.reports || []).filter((x) => x.kind === "week" && new Date(x.at) >= r.from).map((x) => `--- weekly update sent ${fmtDate(x.at)} ---\n${x.body}`).join("\n\n");
      data = weeks.join("\n\n") + (prev ? "\n\n===== WEEKLY UPDATES ALREADY WRITTEN =====\n" + prev : "");
    }
    const common = `I am ${me || "the sender"}${mgr ? `; my manager is ${mgr}` : ""}. Use ONLY the activity data below (my meetings, tasks and follow-ups, captured by Memora from my recordings). Never invent numbers, clients or results; if a section has nothing, write "None this period".
Style: crisp, professional and confident; plain-text email with simple "-" bullets (no markdown, no bold); specific names, numbers and dates; a busy manager must understand it in 60 seconds.`;
    const prompt = kind === "week"
      ? `Write my WEEKLY update email to my manager for ${r.label}.\n${common}\nBody structure:\n1. Greeting and a one-line headline of the week\n2. Key meetings & outcomes (one line each: with whom, what was decided)\n3. Completed this week\n4. In progress (owner, due date)\n5. Pending / blockers: why each is pending and who I am following up with\n6. Need your support / alignment\n7. Plan for next week (upcoming meetings and priorities)\n8. Sign-off with my name\nReturn ONLY JSON: {"subject": "...", "body": "...", "highlights": [3 to 5 one-line highlights]}`
      : `Write my MONTHLY report email to my manager covering the last 4 weeks (${r.label}), built week by week.\n${common}\nBody structure:\n1. Greeting and a one-line headline of the month\n2. Numbers at a glance (meetings, hours in meetings, tasks created vs closed, completion %)\n3. Week by week: Week 1 to Week 4, 2–4 lines each with the main meetings, outcomes and closures\n4. Top achievements of the month\n5. People / accounts engaged most and where each relationship stands\n6. Pending items and risks, with reasons and owners\n7. Support / alignment I need\n8. Focus for next month\n9. Sign-off with my name\nReturn ONLY JSON: {"subject": "...", "body": "...", "highlights": [3 to 5 one-line highlights]}`;
    repBusy = kind; repErr = ""; render();
    aiGen(prompt, data, true).then((raw) => {
      const d = parseJ(raw); if (!d || !d.body) throw new Error("Could not read the AI answer. Try again.");
      db.reports = db.reports || [];
      const rep = { id: "r" + uid(), kind, at: nowISO(), from: r.from.toISOString(), to: r.to.toISOString(), label: r.label, subject: d.subject || (kind === "week" ? "Weekly update" : "Monthly report"), body: d.body, highlights: d.highlights || [] };
      db.reports.push(rep); while (db.reports.length > 60) db.reports.shift();
      repOpen = rep.id; save(); toast(kind === "week" ? "Weekly update ready" : "Monthly report ready");
    }).catch((e) => { repErr = e.message; }).then(() => { repBusy = ""; if (view === "reports") render(); });
  }
  VIEWS.reports = () => {
    const st = db.settings, reps = (db.reports || []).slice().sort((a, b) => b.at.localeCompare(a.at));
    const cur = reps.find((x) => x.id === repOpen) || reps[0] || null;
    const card = (kind, title, sub) => {
      const r = repRange(kind), a = activity(r.from, r.to).n, busy = repBusy === kind;
      return `<div class="card rcard"><div class="eyebrow">${ic(kind === "week" ? "cal" : "list")} ${title}</div>
        <div class="meta" style="margin:6px 0 10px">${esc(r.label)}</div>
        <div class="mini"><span><b>${a.meetings}</b> meetings</span><span><b>${a.closed}</b> closed</span><span><b>${a.pending}</b> pending</span><span><b>${a.manager}</b> for manager</span></div>
        <p class="sub" style="margin:8px 0 12px">${sub}</p>
        <button class="btn ${busy ? "line" : "gold"} block" data-rep="${kind}" ${repBusy ? "disabled" : ""}>${busy ? "Writing from all your meetings…" : ic("spark") + " Create " + (kind === "week" ? "weekly update" : "monthly report")}</button></div>`;
    };
    return `<div class="top"><div class="brand">Reports</div></div>
      <div class="card" style="padding:12px 14px"><div class="row"><div class="field" style="margin:0"><label>Manager name</label><input class="inp" id="mgn" value="${esc(st.managerName || "")}" placeholder="Optional"></div>
      <div class="field" style="margin:0"><label>Manager email</label><input class="inp" id="mge" value="${esc(st.managerEmail || "")}" placeholder="Optional"></div></div></div>
      ${card("week", "Weekly update", "Everything you did this week — meetings, outcomes, closed and pending tasks, blockers and support needed — as a mail draft for your manager.")}
      ${card("month", "Monthly report", "The last 4 weeks combined, week by week, with numbers, achievements, risks and next month's focus.")}
      ${repErr ? `<div class="card" style="margin-top:10px;color:var(--rec)">${esc(repErr)}</div>` : ""}
      ${cur ? `<h2 class="sec">${cur.kind === "week" ? "Weekly update" : "Monthly report"} · ${esc(cur.label || fmtDate(cur.at))}</h2>
        ${(cur.highlights || []).length ? `<div class="card insq" style="margin-bottom:10px"><ul class="ol">${cur.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ul></div>` : ""}
        <div class="field"><label>To</label><input class="inp" id="rto" value="${esc(cur.to_ || st.managerEmail || "")}" placeholder="manager@company.com"></div>
        <div class="field"><label>Subject</label><input class="inp" id="rsub" value="${esc(cur.subject)}"></div>
        <div class="field"><label>Message</label><textarea class="inp" id="rbody" style="height:380px;line-height:1.55">${esc(cur.body)}</textarea></div>
        <div class="row"><button class="btn line" data-rcopy>${ic("copy")} Copy</button><button class="btn line" data-rshare>${ic("share")} Share</button></div>
        <button class="btn gold block" style="margin-top:8px" data-rsend>${ic("mail")} Open in email app</button>
        <p class="tip">Edits are saved automatically.</p>` : `<div class="card empty" style="margin-top:14px"><div class="big">No reports yet</div>Record your meetings — Memora turns them into your weekly and monthly manager updates.</div>`}
      ${reps.length > 1 ? `<h2 class="sec">Earlier reports</h2><div class="list">${reps.filter((x) => !cur || x.id !== cur.id).slice(0, 12).map((x) => `<button class="item" data-ropen="${x.id}"><div class="ic" style="color:var(--gold)">${ic(x.kind === "week" ? "cal" : "list")}</div><div class="tx"><div class="t1">${esc(x.subject)}</div><div class="t2">${x.kind === "week" ? "Weekly" : "Monthly"} · ${fmtDate(x.at)}</div></div></button>`).join("")}</div>` : ""}`;
  };
  BIND.reports = (app) => {
    const st = db.settings;
    $("#mgn", app).onchange = (e) => { st.managerName = e.target.value.trim(); save(); };
    $("#mge", app).onchange = (e) => { st.managerEmail = e.target.value.trim(); save(); };
    $$("[data-rep]", app).forEach((b) => (b.onclick = () => makeReport(b.dataset.rep)));
    $$("[data-ropen]", app).forEach((b) => (b.onclick = () => { repOpen = b.dataset.ropen; render(); window.scrollTo(0, 0); }));
    const reps = (db.reports || []).slice().sort((a, b) => b.at.localeCompare(a.at));
    const cur = reps.find((x) => x.id === repOpen) || reps[0];
    if (!cur) return;
    const keep = () => { cur.subject = $("#rsub").value; cur.body = $("#rbody").value; cur.to_ = $("#rto").value.trim(); save(); };
    ["#rto", "#rsub", "#rbody"].forEach((k) => ($(k, app).onchange = keep));
    $("[data-rcopy]", app).onclick = () => { keep(); A.copyText(`Subject: ${cur.subject}\n\n${cur.body}`); toast("Copied"); };
    $("[data-rshare]", app).onclick = () => { keep(); A.shareText(`${cur.subject}\n\n${cur.body}`); };
    $("[data-rsend]", app).onclick = () => { keep(); A.composeEmail(cur.to_ || "", cur.subject, cur.body); };
  };

  // ---------- meeting insights tab
  function insightsBody(s) {
    const mx = J(A.readText(s.id, "meeting.json"), {}), ins = mx.insights || {};
    if (!Object.keys(mx).length) return `<div class="empty"><div class="big">Insights appear here</div>People, decisions, direction, risks and what to remember — from the recording.</div>`;
    const li = (a) => (a || []).map((x) => `<li>${esc(typeof x === "string" ? x : x.text || "")}</li>`).join("");
    const memos = (db.memos || []).filter((m) => m.meetingId === s.id);
    const nm = mx.nextMeeting || {};
    const planned = (db.plans || []).find((p) => p.fromId === s.id);
    return `${ins.clarity ? `<div class="card insq"><div class="eyebrow" style="margin-bottom:6px">${ic("spark")} Clarity</div>${esc(ins.clarity)}</div>` : ""}
      ${(ins.direction || []).length ? `<h2 class="sec">Direction</h2><div class="card"><ul class="ol">${li(ins.direction)}</ul></div>` : ""}
      <div class="pgrid">${(ins.risks || []).length ? `<div class="card"><div class="eyebrow" style="color:var(--rec)">Risks</div><ul class="ol">${li(ins.risks)}</ul></div>` : ""}
      ${(ins.opportunities || []).length ? `<div class="card"><div class="eyebrow" style="color:var(--ok)">Opportunities</div><ul class="ol">${li(ins.opportunities)}</ul></div>` : ""}</div>
      ${(mx.people || []).length ? `<h2 class="sec">People</h2><div class="card">${mx.people.filter((p) => p && !isMe(p.name)).map((p) => `<div class="person"><div class="av">${esc((p.name || "?").charAt(0).toUpperCase())}</div><div><b>${esc(p.name || "")}${p.role ? `<span class="rl"> · ${esc(p.role)}</span>` : ""}</b>${p.points ? `<span>${esc(p.points)}</span>` : ""}${p.commitments ? `<span class="cm">Promised: ${esc(p.commitments)}</span>` : ""}</div></div>`).join("")}</div>` : ""}
      ${(mx.decisions || []).length ? `<h2 class="sec">Decisions</h2><div class="card">${mx.decisions.map((d) => `<div class="agi"><span class="chip ok">${ic("check")}</span><div><b>${esc(d.text || d)}</b> ${tsBtn(d.at)}</div></div>`).join("")}</div>` : ""}
      ${memos.length ? `<h2 class="sec">Remember</h2><div class="card">${memos.map((m) => `<div class="agi"><button class="chip ${m.done ? "ok" : "gold"}" data-memo="${m.id}">${m.done ? "Done" : m.date ? fmtDue(m.date) : "Note"}</button><div><b>${esc(m.text)}</b></div></div>`).join("")}</div>` : ""}
      ${nm.date || (nm.topics || []).length ? `<h2 class="sec">Next meeting</h2><div class="card"><div class="agi"><span class="chip gold">${nm.date ? fmtDue(nm.date) + (nm.time ? " · " + nm.time : "") : "Date not fixed"}</span><div><b>${esc(nm.with || s.attendees || "")}</b>${(nm.topics || []).length ? `<span>${esc(nm.topics.join(" · "))}</span>` : ""}</div></div>
        ${planned ? `<button class="btn line block small" style="margin-top:8px" data-brief="${planned.id}">${ic("cal")} In your lineup · open brief</button>` : `<button class="btn line block small" style="margin-top:8px" data-addnext>${ic("plus")} Add to lineup</button>`}</div>` : ""}
      ${ins.myShare != null || ins.tone ? `<div class="mini" style="margin-top:14px">${ins.myShare != null ? `<span>You spoke <b>~${esc(ins.myShare)}%</b></span>` : ""}${ins.tone ? `<span>Tone <b>${esc(ins.tone)}</b></span>` : ""}</div>` : ""}`;
  }

  // ---------- follow-up area (tasks grouped by person to chase)
  function followGroups() {
    const g = {};
    db.tickets.filter((t) => t.status === "open").forEach((t) => {
      const w = chaseWho(t) || (isMineT(t) ? "Me" : "Unassigned");
      (g[w] = g[w] || []).push(t);
    });
    return Object.entries(g).sort((a, b) => (a[0] === "Me") - (b[0] === "Me") || b[1].length - a[1].length);
  }
  function followMsg(person, list) {
    return [`Hi ${person},`, "", "Quick follow-up on these:", ...list.map((t) => `- ${t.text}${t.due ? " (due " + fmtDue(t.due) + ")" : ""}${t.pending && t.pending.reason ? " — " + t.pending.reason : ""}`), "", "Could you share the latest status? Thanks!", db.settings.name || ""].join("\n");
  }

  // ================================================================== REMINDERS
  let remT;
  function scheduleReminders() {
    clearTimeout(remT);
    remT = setTimeout(() => {
      const st = db.settings, out = [], now = Date.now();
      if (st.remClass !== false) {
        for (let d = 0; d < 7; d++) {
          const day = new Date(); day.setDate(day.getDate() + d);
          slotsToday(day).forEach(({ s, sl }) => {
            const [h, m] = sl.start.split(":").map(Number);
            const at = new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m).getTime() - 5 * 60000;
            if (at > now) out.push({ id: `c_${s.id}_${at}`, at, title: `${s.name} starts in 5 min`, text: `Tap to start recording Class ${nextClassNo(s.id)}${s.teacher ? " · " + s.teacher : ""}`, action: `class:${s.id}` });
          });
        }
      }
      if (st.remTask !== false) {
        db.tickets.filter((t) => t.status === "open" && t.due).forEach((t) => {
          const [y, mo, dd] = t.due.split("-").map(Number);
          const at = new Date(y, mo - 1, dd, 9, 0).getTime();
          if (at > now) out.push({ id: `t_${t.id}`, at, title: `Due today: ${t.text.slice(0, 60)}`, text: `${t.owner ? "Owner: " + t.owner + " · " : ""}Tap to update the task`, action: `task:${t.id}` });
        });
      }
      if (st.remTask !== false) {
        (db.memos || []).filter((m) => !m.done && m.date).forEach((m) => {
          const [y, mo, dd] = m.date.split("-").map(Number);
          const at = new Date(y, mo - 1, dd, 9, 30).getTime();
          if (at > now) out.push({ id: `n_${m.id}`, at, title: `Remember: ${m.text.slice(0, 70)}`, text: "From your meeting · tap to open", action: `memo:${m.id}` });
        });
        db.tickets.filter((t) => isPending(t) && t.pending.next).forEach((t) => {
          const [y, mo, dd] = t.pending.next.split("-").map(Number);
          const at = new Date(y, mo - 1, dd, 10, 0).getTime();
          if (at > now) out.push({ id: `f_${t.id}`, at, title: `Follow up${t.pending.followWith ? " with " + t.pending.followWith : ""}`, text: t.text.slice(0, 90), action: `task:${t.id}` });
        });
      }
      if (st.remReport !== false && db.sessions.some(isMeet)) {
        const f = new Date(); f.setDate(f.getDate() + ((5 - f.getDay() + 7) % 7)); f.setHours(17, 0, 0, 0);
        if (f.getTime() <= now) f.setDate(f.getDate() + 7);
        out.push({ id: "rep_week", at: f.getTime(), title: "Your weekly update is ready to write", text: "Tap — Memora drafts your manager mail from this week's meetings", action: "report:week" });
      }
      if (st.remMeet !== false) {
        (db.plans || []).forEach((p) => {
          const at = new Date(p.at).getTime() - 10 * 60000;
          const n = p.series ? openTasks(p.series).length : 0;
          if (at > now) out.push({ id: `p_${p.id}`, at, title: `${p.title} in 10 min`, text: `${n ? n + " open follow-ups · " : ""}Tap for the brief and to start recording`, action: `brief:${p.id}` });
        });
      }
      out.sort((a, b) => a.at - b.at);
      try { A.setReminders(JSON.stringify(out.slice(0, 100))); } catch (e) { }
    }, 400);
  }

  // ================================================================== QUICK ACTIONS (tile, shortcuts, notifications)
  window.onAction = (a) => {
    if (!a) return;
    const start = () => {
      if (segOf() === "meet") { go("meetings"); quickMeeting(); return; }
      const det = detectClass();
      if (det && det.kind === "now") startClass(det.s.id);
      else { go("today"); pickSubject((id) => startClass(id), "Start a class", "Which subject is this class for?"); }
    };
    if (rec().state !== "idle") { go("record", { id: rec().sid }); return; }
    if (a === "quick") start();
    else if (a === "quickclass") { db.settings.segment = "edu"; save(); start(); }
    else if (a === "quickmeeting") { db.settings.segment = "meet"; save(); start(); }
    else if (a === "ask") go("ask");
    else if (a.startsWith("class:")) { db.settings.segment = "edu"; save(); startClass(a.slice(6)); }
    else if (a.startsWith("task:")) { db.settings.segment = "meet"; save(); go("tasks"); const t = db.tickets.find((x) => x.id === a.slice(5)); if (t) ticketSheet(t); }
    else if (a.startsWith("brief:")) { db.settings.segment = "meet"; save(); go("brief", { id: a.slice(6) }); }
    else if (a.startsWith("report:")) { db.settings.segment = "meet"; save(); go("reports"); makeReport(a.slice(7) || "week"); }
    else if (a.startsWith("memo:")) { db.settings.segment = "meet"; save(); go("meetings"); }
  };

  // ================================================================== BACKUP
  function backupSheet() {
    const sh = sheet(`<h3>Back up Memora</h3><p class="sub">Creates one .zip in Downloads/Memora. Then save it to Google Drive so nothing is lost if the phone changes.</p>
      <button class="opt" data-b="0">${ic("file")}<div class="tx"><b>Notes only</b><span>Notes, minutes, tasks, transcripts, settings — small file</span></div></button>
      <button class="opt" data-b="1">${ic("head")}<div class="tx"><b>Everything incl. audio</b><span>Also recordings and voice recaps — large file</span></div></button>`);
    $$("[data-b]", sh).forEach((b) => (b.onclick = () => { closeSheet(); overlay("Creating backup", "Please keep Memora open…"); A.backup(b.dataset.b === "1"); }));
  }
  window.onBackup = (r) => {
    overlay(null);
    if (!r.ok) { toast("Backup failed: " + (r.msg || "")); return; }
    db.settings.lastBackup = nowISO(); save(); render();
    const sh = sheet(`<h3>Backup ready ✓</h3><p class="sub">${esc(r.name)} · ${(r.size / 1048576).toFixed(1)} MB<br>Saved to Downloads/Memora.</p>
      <button class="btn gold block" data-drive>${ic("upload")} Save to Google Drive</button><p class="tip">In the share menu choose “Drive”.</p>`);
    $("[data-drive]", sh).onclick = () => { closeSheet(); A.shareBackup(); };
  };
  window.onRestored = (r) => {
    overlay(null);
    if (!r.ok) { toast("Restore failed: " + (r.msg || "")); return; }
    toast("Restored ✓"); setTimeout(() => location.reload(), 600);
  };

  // ------------------------------------------------------------------ app lock
  const lockSt = () => J(A.lockState ? A.lockState() : "{}", {});
  const MK = `<div class="mk"><svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 17V9.5c0-1.4 1.1-1.7 1.9-.8L12 14l5.1-5.3c.8-.9 1.9-.6 1.9.8V17"/><circle cx="19.2" cy="4.8" r="1.9" fill="#FF8A7A" stroke="none"/></svg></div>`;
  let lockEl = null;
  // opts: {title, sub, bio, cancel, onPin(pin) -> true (close) | false (wrong) | {title, sub} (next step)}
  function pinScreen(opts) {
    closePin();
    let buf = "", busyUntil = 0;
    const el = document.createElement("div");
    el.className = "lock";
    el.innerHTML = `${MK}<h2 data-t></h2><p data-s></p><div class="pins">${"<i></i>".repeat(4)}</div>
      <div class="keys">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button class="key" data-k="${n}">${n}</button>`).join("")}
      ${opts.bio ? `<button class="key flat" data-bio>${ic("fp")}</button>` : `<span></span>`}
      <button class="key" data-k="0">0</button><button class="key flat" data-del>${ic("del")}</button></div>
      ${opts.cancel ? `<button class="lnk" data-cancel>Cancel</button>` : `<button class="lnk" data-forgot>Forgot PIN?</button>`}`;
    document.body.appendChild(el);
    lockEl = el;
    const T = $("[data-t]", el), S = $("[data-s]", el), dots = $$(".pins i", el), pins = $(".pins", el);
    const setText = (t, s, err) => { T.textContent = t; S.textContent = s || ""; S.className = err ? "err" : ""; };
    setText(opts.title, opts.sub);
    const draw = () => dots.forEach((d, i) => d.classList.toggle("on", i < buf.length));
    const press = (k) => {
      if (Date.now() < busyUntil || buf.length >= 4) return;
      buf += k; draw();
      if (buf.length === 4) setTimeout(() => {
        const r = opts.onPin(buf);
        if (r === true) { closePin(); return; }
        if (r && typeof r === "object") { buf = ""; draw(); setText(r.title, r.sub, r.err); return; }
        pins.classList.add("shake"); if (navigator.vibrate) navigator.vibrate(80);
        setTimeout(() => { pins.classList.remove("shake"); buf = ""; draw(); }, 420);
        if (typeof r === "string") { setText(T.textContent, r, true); if (/wait/i.test(r)) busyUntil = Date.now() + 30000; }
      }, 120);
    };
    $$("[data-k]", el).forEach((b) => (b.onclick = () => press(b.dataset.k)));
    $("[data-del]", el).onclick = () => { buf = buf.slice(0, -1); draw(); };
    const bio = $("[data-bio]", el); if (bio) bio.onclick = () => A.biometric(true);
    const c = $("[data-cancel]", el); if (c) c.onclick = () => { closePin(); if (opts.onCancel) opts.onCancel(); };
    const f = $("[data-forgot]", el); if (f) f.onclick = () => setText(opts.title, opts.bio ? "Use your fingerprint to unlock, then change the PIN in Settings." : "Without the PIN, the only way in is Android Settings → Apps → Memora → Clear data (this deletes your classes).", true);
    el._setText = setText;
    return el;
  }
  function closePin() { if (lockEl) { lockEl.remove(); lockEl = null; } }

  let fails = 0;
  function showUnlock() {
    if (lockEl && lockEl.dataset.unlock) return;
    const st = lockSt();
    if (!st.on) return;
    const useBio = st.bio && st.bioAvail;
    const el = pinScreen({
      title: "Enter your PIN", sub: useBio ? "or use your fingerprint" : "", bio: useBio,
      onPin: (p) => {
        if (A.checkPin(p)) { fails = 0; return true; }
        fails++;
        return fails >= 5 ? (fails = 0, "Too many tries — wait 30 seconds") : "Wrong PIN, try again";
      },
    });
    el.dataset.unlock = "1";
    if (useBio) setTimeout(() => A.biometric(true), 350);
  }
  window.showLock = showUnlock;
  window.onBio = (ok, msg) => {
    if (ok) { if (lockEl && lockEl.dataset.unlock) closePin(); else if (bioCb) { const f = bioCb; bioCb = null; f(); } return; }
    bioCb = null;
    if (msg && lockEl && lockEl._setText) lockEl._setText("Enter your PIN", msg, true);
  };
  let bioCb = null;

  function createPin(done) {
    let first = null;
    pinScreen({
      title: "Create a 4-digit PIN", sub: "You'll use it to open Memora", cancel: true,
      onPin: (p) => {
        if (!first) { first = p; return { title: "Confirm your PIN", sub: "Enter the same PIN again" }; }
        if (p !== first) { first = null; return { title: "Create a 4-digit PIN", sub: "PINs didn't match — try again", err: true }; }
        A.setPin(p); done && done(); return true;
      },
    });
  }
  function verifyPin(title, done) {
    const st = lockSt();
    const useBio = st.bio && st.bioAvail;
    pinScreen({ title, sub: "Enter your current PIN", cancel: true, bio: useBio, onPin: (p) => (A.checkPin(p) ? (setTimeout(done, 50), true) : "Wrong PIN") });
    if (useBio) bioCb = () => { closePin(); done(); };
  }

  // ------------------------------------------------------------------ boot
  (function boot() {
    // recover recordings interrupted by a crash / reboot
    const r = rec();
    db.sessions.forEach((s) => {
      if (s.status === "recording" && !(r.sid === s.id && r.state !== "idle")) { s.status = "recovering"; A.recRecover(s.id); }
      if (s.status === "importing") s.status = "saved";
    });
    save();
    view = home();
    if (r.state !== "idle" && r.sid) { view = "record"; params = { id: r.sid }; }
    window.__memReady = true;
    render();
    if (lockSt().needed) showUnlock();
    scheduleReminders();
    setTimeout(() => { try { autoContinue(); } catch (e) { } }, 4000);
    const act = A.takeAction ? A.takeAction() : "";
    if (act) setTimeout(() => window.onAction(act), 300);
    const pend = A.checkPending();
    if (pend) window.onImportReady(pend);
    if (!db.settings.name && !db.sessions.length) {
      const sh = sheet(`<h3>Welcome to Memora</h3><p class="sub">Record your classes, and get detailed notes, a PDF and a voice recap — in any language. What should we call you?</p>
        <div class="field"><input class="inp" id="wn" placeholder="Your name"></div><button class="btn gold block" data-ok>Continue</button>`);
      $("[data-ok]", sh).onclick = () => { db.settings.name = $("#wn").value.trim(); save(); closeSheet(); render(); };
    }
  })();
})();
