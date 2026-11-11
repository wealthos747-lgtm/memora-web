/* Memora Web — AI pipeline (port of the phone app's Job.java), runs inside this browser tab. */
(function () {
  "use strict";
  const W = window.MemoraWeb;
  const { text, K, setText, setBlob, remove, getBlob, has, settings, sessionOf, subjectOf, listFiles, segments, mainAudio, mimeFor, fmtTime, durationOf, generate, generateFast, upload, tts, ttsDaily, friendly, ApiError, textPart, filePart, mp3Encoder, sleep, J, dbObj } = W;
  const active = new Map(); // sid -> job key
  const call = (fn, ...a) => { try { window[fn] && window[fn](...a); } catch (e) { console.error(e); } };

  class Job {
    constructor(sid, job) {
      this.sid = sid; this.job = job;
      this.s = settings(); this.key = (this.s.apiKey || "").trim(); this.model = (this.s.model || "gemini-flash-latest").trim();
      this.lo = 0; this.hi = 1; this.stage = ""; this.started = Date.now(); this.voiceNote = null;
      this.steps = new Map(); this.fracs = new Map();
    }
    get dir() { return this.sid; }
    f(n) { return text.get(K(this.sid, n)) || ""; }
    has(n) { return has(this.sid, n); }
    w(n, v) { return setText(K(this.sid, n), v); }
    status(running, prog, stage, error) {
      this.w("status.json", JSON.stringify({ job: this.job, running, progress: prog, stage, error: error || null, updated: Date.now(), started: this.started }));
    }
    prog(f, stg) { this.stage = stg; this.status(true, this.lo + (this.hi - this.lo) * Math.max(0, Math.min(1, f)), stg, null); }
    note(m) { this.status(true, this.lo, this.stage + " · " + m, null); }
    phase(a, b, stg) { this.lo = a; this.hi = b; this.stage = stg; this.status(true, a, stg, null); }
    get progress() { return { progress: (f, s) => this.prog(f, s), note: (m) => this.note(m) }; }
    isMeeting() { return sessionOf(this.sid).segment === "meeting"; }
    gen(model, parts, temp, json) { return generate(this.key, model, parts, temp, json, (m) => this.note(m)); }

    ctxBlock() {
      const s = sessionOf(this.sid);
      if (s.segment === "meeting") {
        let m = `Meeting title: ${s.title || "Meeting"}\nMeeting type: ${s.mtype || "Official"}\n`;
        if (s.series) m += `Recurring meeting series: ${s.series}\n`;
        if (s.attendees) m += `Attendees: ${s.attendees}\n`;
        if (s.dateLabel) m += `Date: ${s.dateLabel}\n`;
        if ((s.agenda || "").trim()) m += `Planned agenda:\n${s.agenda.trim()}\n`;
        if (s.durationMs) m += `Recording length: ${fmtTime(s.durationMs)}\n`;
        return m;
      }
      const sb = subjectOf(s.subjectId);
      let b = `Class title: ${s.title || "Class"}\n`;
      if (sb.name) b += `Subject: ${sb.name}\n`;
      if (sb.teacher) b += `Teacher: ${sb.teacher}\n`;
      if (s.dateLabel) b += `Date: ${s.dateLabel}\n`;
      if (s.durationMs) b += `Recording length: ${fmtTime(s.durationMs)}\n`;
      return b;
    }
    bookmarksBlock() {
      const a = J(this.f("bookmarks.json"), []);
      if (!a.length) return "";
      return "The student tapped IMPORTANT at these moments of the recording (timestamps match the transcript):\n" + a.map((o) => `- [${fmtTime(o.t)}]${o.note ? " student note: " + o.note : ""}`).join("\n") + "\n";
    }
    openTasksBlock() {
      const ts = dbObj().tickets || []; const series = sessionOf(this.sid).series || "";
      return ts.filter((t) => t.status === "open" && t.meetingId !== this.sid && (!series || t.series === series)).slice(-40)
        .map((t) => `- [${t.id}] ${t.text}${t.owner ? ` (owner: ${t.owner})` : ""}${t.due ? ` (due: ${t.due})` : ""}`).join("\n");
    }

    async buildParts() {
      let files = segments(this.sid);
      if (!files.length) { const a = mainAudio(this.sid); if (!a) throw new Error("No audio found for this recording."); files = [a]; }
      const parts = []; let t = 0;
      for (let i = 0; i < files.length; i++) {
        const name = files[i];
        let d = +(this.f(name + ".ms") || 0);
        if (!d) d = await durationOf(getBlob(this.sid, name));
        parts.push({ name, idx: i + 1, startMs: t, durMs: d });
        t += d;
      }
      return parts;
    }
    partsLayout(parts) { return parts.map((p) => `PART ${p.idx} starts at ${fmtTime(p.startMs)} of the recording and lasts ${fmtTime(p.durMs)}.`).join("\n") + "\n"; }
    async uploadAll(parts) {
      const ups = J(this.f("uploads.json"), {}); let done = 0;
      await pool(parts, 3, async (p) => {
        const u = ups[p.name];
        if (u && !u.inline && Date.now() - u.at < 40 * 3600000) { p.up = u; return; }
        p.up = await upload(this.key, getBlob(this.sid, p.name), mimeFor(p.name), p.name);
        if (!p.up.inline) { ups[p.name] = p.up; this.w("uploads.json", JSON.stringify(ups)); }
        this.prog(++done / parts.length, this.stage);
      });
    }
    absoluteTimes(t, batch) {
      return t.replace(/\[\s*P(?:ART)?\s*(\d+)\s+(\d{1,2}):(\d{2})(?::(\d{2}))?\s*\]/gi, (m, pi, a, b, c) => {
        const secs = c != null ? +a * 3600 + +b * 60 + +c : +a * 60 + +b;
        const p = batch[+pi - 1] || batch[0];
        return "[" + fmtTime(p.startMs + secs * 1000) + "]";
      });
    }
    cleanSpoken(s) { return s.replace(/^\s*[#>*\-•]+\s*/gm, "").replace(/\*\*/g, "").replace(/__/g, "").replace(/\[(\d{1,2}:)?\d{1,2}:\d{2}\]/g, "").trim(); }
    audioParts(parts) {
      const a = [textPart(Prompts.fromAudio(this.partsLayout(parts)))];
      for (const p of parts) { a.push(textPart("PART " + p.idx + ":")); a.push(filePart(p.up)); }
      return a;
    }
    async transcribe(parts) {
      const batches = []; let cur = [], ms = 0;
      for (const p of parts) { if (cur.length && ms + p.durMs > 40 * 60000) { batches.push(cur); cur = []; ms = 0; } cur.push(p); ms += p.durMs; }
      if (cur.length) batches.push(cur);
      await pool(batches.map((b, i) => [b, i]), 3, async ([batch, i]) => {
        if (this.has("batch_" + i + ".md")) return;
        const req = [textPart(this.isMeeting() ? Prompts.transcribeMeeting(this.ctxBlock(), batch.length) : Prompts.transcribe(this.ctxBlock(), batch.length))];
        batch.forEach((p, k) => { req.push(textPart("PART " + (k + 1) + ":")); req.push(filePart(p.up)); });
        const t = await this.gen(this.model, req, 0.1);
        await this.w("batch_" + i + ".md", this.absoluteTimes(t, batch));
      });
      await this.w("transcript.md", batches.map((_, i) => this.f("batch_" + i + ".md")).join("\n\n"));
    }

    // ---------------------------------------------------------------- summary / meeting outputs
    async runSummary(force) {
      if (!this.key) throw new Error("Add your free Gemini AI key in Settings first.");
      if (force) for (const n of ["transcript.md", "summary.md", "narration.txt", "summary_audio.m4a", "mom.md", "email.json", "actions.json", "followups.json", "agenda.json", "meta.json", "meeting.json", ...listFiles(this.sid).filter((x) => x.startsWith("batch_"))]) await remove(K(this.sid, n));
      const lang = this.s.summaryLang || "English";
      let parts = null;
      if (!this.has("summary.md") || !this.has("transcript.md")) {
        parts = await this.buildParts();
        this.phase(0.02, 0.2, parts.length > 1 ? `Uploading audio (${parts.length} parts)` : "Uploading audio");
        await this.uploadAll(parts);
      }
      // without Google's upload service (browser), long recordings go transcript-first
      const inline = parts && parts.some((p) => p.up && p.up.inline);
      const totalInline = parts ? parts.reduce((a, p) => a + (p.up && p.up.inline ? p.up.inline.length : 0), 0) : 0;
      const thorough = this.isMeeting() || this.s.quality === "thorough" || (inline && totalInline > 14e6);
      let tPromise = null;
      if (!thorough && parts && !this.has("transcript.md")) tPromise = this.transcribe(parts).catch((e) => e);
      if (!this.has("summary.md")) {
        if (thorough && !this.has("transcript.md")) { this.phase(0.2, 0.55, this.isMeeting() ? "Listening to every word" : "Transcribing class"); await this.transcribe(parts); }
        this.phase(thorough ? 0.55 : 0.2, 0.85, this.isMeeting() ? "Writing minutes, tasks & email" : "Writing detailed class notes");
        const src = this.has("transcript.md") ? [textPart("FULL TRANSCRIPT:\n\n" + this.f("transcript.md"))] : this.audioParts(parts);
        if (this.isMeeting()) await this.meetingOutputs(src, parts);
        else {
          let notes = await this.gen(this.model, [textPart(Prompts.summary(this.ctxBlock(), this.bookmarksBlock(), lang)), ...src], 0.3);
          if (parts) notes = this.absoluteTimes(notes, parts);
          await this.w("summary.md", notes);
        }
      }
      const wantRecap = this.isMeeting() || this.s.autoRecap;
      if (wantRecap && !this.has("narration.txt")) await this.makeNarration(lang);
      if (!tPromise && parts && !this.has("transcript.md")) tPromise = this.transcribe(parts).catch((e) => e);
      if (wantRecap && !this.has("summary_audio.m4a")) { this.phase(0.85, 0.97, "Recording voice summary"); await this.speak(this.f("narration.txt"), this.s.voice || "en-IN", lang, "summary_audio.m4a"); }
      if (tPromise) { this.phase(0.97, 1, "Finishing the transcript"); const r = await tPromise; if (r instanceof Error) throw new Error("Notes are ready ✓. The full transcript failed: " + friendly(r) + " Tap Retry to finish it."); }
    }
    async meetingOutputs(src, parts) {
      const lang = this.s.summaryLang || "English";
      const s = sessionOf(this.sid);
      const today = new Date(s.date || Date.now()).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
      let out = null;
      for (let a = 0; a < 2 && !out; a++) {
        let raw = await this.gen(this.model, [textPart(Prompts.meeting(this.ctxBlock(), this.bookmarksBlock(), this.openTasksBlock(), lang, this.s.name || "", today)), ...src], 0.3, true);
        if (parts) raw = this.absoluteTimes(raw, parts);
        try { out = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)); } catch (e) { if (a === 1) { await this.w("summary.md", raw); return; } }
      }
      await this.w("mom.md", out.mom || "");
      await this.w("email.json", JSON.stringify(out.email || {}));
      await this.w("actions.json", JSON.stringify(out.actions || []));
      await this.w("followups.json", JSON.stringify(out.followups || []));
      await this.w("agenda.json", JSON.stringify(out.agenda || []));
      await this.w("meta.json", JSON.stringify({ title: out.title || "", titles: out.titles || [] }));
      const extra = {}; for (const k of ["people", "decisions", "remember", "nextMeeting", "insights", "titles", "wins"]) if (out[k] !== undefined) extra[k] = out[k];
      await this.w("meeting.json", JSON.stringify(extra));
      await this.w("summary.md", out.summary || "");
    }
    async makeNarration(lang) {
      this.phase(0.8, 0.85, "Writing the audio script");
      const lite = "gemini-flash-lite-latest";
      const script = this.isMeeting()
        ? await this.gen(lite, [textPart(Prompts.narrationMeeting(lang)), textPart("SUMMARY:\n\n" + this.f("summary.md") + "\n\nMINUTES:\n\n" + this.f("mom.md"))], 0.5)
        : await this.gen(lite, [textPart(Prompts.narration(lang)), textPart("CLASS NOTES:\n\n" + this.f("summary.md"))], 0.5);
      await this.w("narration.txt", this.cleanSpoken(script));
    }

    // ---------------------------------------------------------------- voice (studio only on the web)
    async speak(txt, langTag, langName, outName, prog, speakers) {
      if (!this.key) throw new Error("Add your Gemini key to make voice audio.");
      const v = this.s.studioVoice || "Aoede";
      const style = speakers
        ? `TTS the following classroom conversation between Teacher and Student. Teacher: warm, clear, engaging; Student: curious and natural${langName === "English" ? ", natural Indian English" : ""}:`
        : `Read aloud in a warm, clear, friendly teacher voice${langTag.startsWith("en") || langTag === "ta-Latn" ? ", natural Indian English" : langName ? ", natural " + langName : ""}, steady normal pace:`;
      await this.synthStudio(txt, v, style, outName, prog || this.progress, speakers);
    }
    async synthStudio(txt, voice, style, outName, prog, speakers) {
      const lines = txt.replace(/\r/g, "").split(/\n+/).map((x) => x.trim()).filter(Boolean);
      const max = speakers ? 1800 : 2000; const chunks = []; let cur = "";
      for (const l of lines) { if (cur && cur.length + l.length + 1 > max) { chunks.push(cur); cur = ""; } cur += (cur ? "\n" : "") + l; }
      if (cur) chunks.push(cur);
      const n = chunks.length;
      const tmp = (i) => `tts_${outName}_${i}.mp3`;
      const sig = String(hashStr(voice + style + (speakers || "") + txt));
      if (this.f(`tts_${outName}.sig`) !== sig) { for (const x of listFiles(this.sid).filter((x) => x.startsWith(`tts_${outName}_`))) await remove(K(this.sid, x)); await this.w(`tts_${outName}.sig`, sig); }
      const done = new Array(n).fill(false), startT = new Array(n).fill(0); let waitMsg = null;
      for (let i = 0; i < n; i++) if (getBlob(this.sid, tmp(i))) done[i] = true;
      const ticker = setInterval(() => {
        let f = 0, ready = 0; const now = Date.now();
        for (let i = 0; i < n; i++) { if (done[i]) { f++; ready++; } else if (startT[i]) f += Math.min(0.92, (now - startT[i]) / Math.max(25000, chunks[i].length * 22)); }
        prog.progress(f / n, waitMsg || `Recording voice · part ${Math.min(n, ready + 1)} of ${n}`);
      }, 1000);
      try {
        await pool(chunks.map((c, i) => i), 3, async (i) => {
          if (done[i]) return;
          startT[i] = Date.now();
          const r = await tts(this.key, chunks[i], voice, style, speakers, (secs) => { waitMsg = secs ? `Google free limit reached, continuing in ${secs}s` : null; if (secs) startT[i] = Date.now() + secs * 1000; });
          waitMsg = null;
          const enc = mp3Encoder(r.rate, 64); enc.push(r.pcm); enc.push(new Int16Array(Math.round(r.rate * 0.45)));
          await setBlob(K(this.sid, tmp(i)), enc.finish());
          done[i] = true;
          let k = 0; while (k < n && done[k]) k++;
          if (k < n && k > 0) await setBlob(K(this.sid, outName + ".preview.m4a"), new Blob(Array.from({ length: k }, (_, j) => getBlob(this.sid, tmp(j))), { type: "audio/mpeg" }));
          await this.w(outName + ".progress.json", JSON.stringify({ done: k, ready: done.filter(Boolean).length, total: n }));
        });
      } finally { clearInterval(ticker); }
      await setBlob(K(this.sid, outName), new Blob(chunks.map((_, i) => getBlob(this.sid, tmp(i))), { type: "audio/mpeg" }));
      for (let i = 0; i < n; i++) await remove(K(this.sid, tmp(i)));
      await remove(K(this.sid, outName + ".preview.m4a")); await remove(K(this.sid, outName + ".progress.json"));
    }

    // ---------------------------------------------------------------- translate, audio, quiz, pack
    async runTranslate(code, langName, audioOnly) {
      if (!this.has("summary.md")) throw new Error("Create the summary first.");
      const tSum = `summary_${code}.md`, tNar = `narration_${code}.txt`, tAud = `summary_audio_${code}.m4a`;
      if (!audioOnly) {
        if (!this.has(tSum)) { this.phase(0.02, 0.45, "Translating notes to " + langName); await this.w(tSum, await this.gen(this.model, [textPart(Prompts.translateNotes(langName)), textPart(this.f("summary.md"))], 0.2)); }
        if (!this.has(tNar)) {
          this.phase(0.45, 0.7, "Translating audio script");
          if (!this.has("narration.txt")) await this.makeNarration(this.s.summaryLang || "English");
          await this.w(tNar, this.cleanSpoken(await this.gen(this.model, [textPart(Prompts.translateScript(langName)), textPart(this.f("narration.txt"))], 0.3)));
        }
      }
      if (!this.has(tNar)) throw new Error("Translate first.");
      this.phase(audioOnly ? 0.05 : 0.7, 1, `Recording ${langName} voice summary`);
      await this.speak(this.f(tNar), code, langName, tAud);
    }
    async runAudio() {
      if (!this.has("narration.txt")) { if (!this.has("summary.md")) return this.runSummary(false); await this.makeNarration(this.s.summaryLang || "English"); }
      await remove(K(this.sid, "summary_audio.m4a"));
      this.phase(0.05, 1, "Recording voice summary");
      await this.speak(this.f("narration.txt"), this.s.voice || "en-IN", this.s.summaryLang || "English", "summary_audio.m4a");
    }
    async runQuiz() {
      if (!this.has("summary.md")) throw new Error("Create the notes first.");
      this.phase(0.1, 0.95, "Preparing your quiz & flashcards");
      const raw = await this.gen(this.model, [textPart(Prompts.quiz()), textPart("NOTES:\n" + this.f("summary.md") + "\n\nTRANSCRIPT:\n" + this.f("transcript.md").slice(0, 200000))], 0.5, true);
      await this.w("quiz.json", JSON.stringify(JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1))));
    }
    async runPack(range) {
      const subjectId = this.sid.slice(2);
      const name = subjectOf(subjectId).name || "General";
      const cutoff = new Date(Date.now() - 7 * 86400000).toISOString();
      const list = (dbObj().sessions || []).filter((s) => s.segment !== "meeting" && ((s.subjectId || "") === subjectId || (subjectId === "general" && !s.subjectId)) && (range !== "week" || s.date >= cutoff) && has(s.id, "summary.md")).sort((a, b) => a.date.localeCompare(b.date));
      if (!list.length) throw new Error(range === "week" ? "No classes with notes in the last 7 days." : "No classes with notes yet.");
      const b = list.map((s) => `\n\n=== ${s.title} | ${s.dateLabel} ===\n` + (text.get(K(s.id, "summary.md")) || "")).join("");
      this.phase(0.05, 0.55, range === "week" ? "Writing this week's recap" : "Writing the study guide");
      await this.w(`pack_${range}.md`, await this.gen(this.model, [textPart(Prompts.pack(name, range, list.length)), textPart(b)], 0.3));
      this.phase(0.55, 0.7, "Writing the audio script");
      const lang = this.s.summaryLang || "English";
      await this.w(`narration_${range}.txt`, this.cleanSpoken(await this.gen("gemini-flash-lite-latest", [textPart(Prompts.narration(lang)), textPart("CLASS NOTES:\n\n" + this.f(`pack_${range}.md`))], 0.5)));
      this.phase(0.7, 1, "Recording the audio recap");
      await this.speak(this.f(`narration_${range}.txt`), this.s.voice || "en-IN", lang, `pack_audio_${range}.m4a`);
    }

    // ---------------------------------------------------------------- class experience (parallel)
    step(k, f, label) {
      this.steps.set(k, label); this.fracs.set(k, f);
      let sum = 0; for (const v of this.fracs.values()) sum += v;
      this.status(true, this.lo + (this.hi - this.lo) * (sum / Math.max(1, this.fracs.size)), [...this.steps.values()].join(" · "), null);
    }
    sub(k, name) { return { progress: (f, stg) => this.step(k, f, stg && stg.includes("limit") ? `${name} — ${stg.replace(" — ", ", ")}` : `${name} ${Math.round(f * 100)}%`), note: () => { } }; }
    async runExperience(what) {
      if (!this.key && what !== "clean") throw new Error("Add your free Gemini AI key in Settings first.");
      const all = !what || what === "all"; const lang = this.s.summaryLang || "English";
      let made = false;
      if (!this.has("transcript.md") && this.key) { made = true; this.phase(0.02, 0.3, "Preparing the full transcript"); const parts = await this.buildParts(); await this.uploadAll(parts); await this.transcribe(parts); }
      const tr = this.f("transcript.md"); const meeting = this.isMeeting();
      this.lo = made ? 0.3 : 0.03; this.hi = 1;
      const matN = this.f("materials.md");
      const trm = matN ? tr + "\n\n=== STUDENT'S OWN NOTES AND THE PROFESSOR'S SLIDES FOR THIS CLASS (also cover these points; anything not said in class is marked as from the notes/slides) ===\n\n" + matN : tr;
      const tasks = []; const errors = [];
      const task = (k, label, fn) => { this.step(k, 0, label + "…"); tasks.push(fn().then(() => this.step(k, 1, label + " ✓")).catch((e) => { errors.push(label + ": " + friendly(e)); this.step(k, 1, label + " ✗"); })); };
      if (!meeting && (all || what === "book")) {
        if (what === "book") { await remove(K(this.sid, "classbook.md")); await remove(K(this.sid, "qabank.md")); }
        if (!this.has("classbook.md")) task("book", "Class Book", async () => this.w("classbook.md", await this.gen(this.model, [textPart(Prompts.classBook(this.ctxBlock(), this.bookmarksBlock(), lang)), textPart("FULL TRANSCRIPT:\n\n" + trm)], 0.4)));
      }
      if (!meeting && (all || what === "book" || what === "qa")) {
        if (what === "qa") await remove(K(this.sid, "qabank.md"));
        if (!this.has("qabank.md")) task("qa", "Q&A Bank", async () => this.w("qabank.md", await this.gen("gemini-2.5-flash", [textPart(Prompts.qaBank(this.ctxBlock(), lang)), textPart("FULL TRANSCRIPT:\n\n" + trm)], 0.4)));
      }
      if (!meeting && (all || what === "replay")) {
        if (what === "replay") { await remove(K(this.sid, "replay_script.txt")); await remove(K(this.sid, "replay_audio.m4a")); }
        if (!this.has("replay_audio.m4a")) task("replay", "Replay", async () => {
          if (!this.has("replay_script.txt")) {
            const sc = await this.gen("gemini-2.5-flash", [textPart(Prompts.replay(lang)), textPart("FULL TRANSCRIPT:\n\n" + tr)], 0.6);
            const clean = sc.replace(/\r/g, "").split("\n").map((l) => l.trim().replace(/\*\*/g, "")).filter((l) => /^(teacher|student)\s*:/i.test(l)).map((l) => l[0].toUpperCase() + l.slice(1)).join("\n");
            await this.w("replay_script.txt", clean || sc);
          }
          this.step("replay", 0.15, "Replay 15%");
          const tv = this.s.replayTeacher || "Charon", sv = this.s.replayStudent || "Leda";
          try { await this.speak(this.f("replay_script.txt"), "en", lang, "replay_audio.m4a", this.sub("replay", "Replay"), ["Teacher", tv, "Student", sv]); }
          catch (e) {
            if (e.code === 429) {
              const daily = ttsDaily();
              this.w("retry.json", JSON.stringify({ what: "replay", at: Date.now() + (daily ? 3 * 3600000 : 20 * 60000) }));
              throw new Error(`Google's free voice limit is used up ${daily ? "for today" : "for the moment"}. Parts already made are saved — Memora continues the Replay automatically ${daily ? "in a few hours" : "in about 20 minutes"} while this page is open.`);
            }
            const plain = this.f("replay_script.txt").replace(/^Teacher\s*:\s*/gm, "").replace(/^Student\s*:\s*/gm, "Student asks: ");
            this.voiceNote = "Two-voice replay unavailable (" + friendly(e) + ") — made it with one studio voice.";
            await this.speak(plain, "en", lang, "replay_audio.m4a", this.sub("replay", "Replay"));
          }
        });
      }
      if (all || what === "clean") {
        if (what === "clean") await remove(K(this.sid, "clean_audio.m4a"));
        if (mainAudio(this.sid) && !this.has("clean_audio.m4a")) task("clean", "Clean audio", async () => {
          let cuts = [];
          if (tr && this.key) {
            try {
              const raw = await this.gen("gemini-flash-lite-latest", [textPart(Prompts.cuts(meeting)), textPart(tr)], 0.1, true);
              const arr = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1)).cuts || [];
              await this.w("cuts.json", JSON.stringify(arr));
              cuts = arr.map((o) => [parseTs(o.start), parseTs(o.end)]).filter(([a, b]) => a >= 0 && b > a + 4000).map(([a, b]) => [a + 700, b - 700]);
            } catch (e) { }
          }
          const r = await cleanAudio(this.sid, cuts, this.sub("clean", "Clean audio"));
          await this.w("clean.json", JSON.stringify(r));
        });
      }
      await Promise.all(tasks);
      if (errors.length) throw new Error("Some parts didn't finish — tap Retry: " + errors.join(" "));
    }
  }

  const parseTs = (t) => { try { const p = String(t).replace(/[\[\]≈ ]/g, "").split(":").map(Number); if (p.some(isNaN)) return -1; return p.reduce((a, x) => a * 60 + x, 0) * 1000; } catch (e) { return -1; } };
  function hashStr(s) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; }
  async function pool(items, n, fn) {
    const queue = items.slice(); const errs = [];
    await Promise.all(Array.from({ length: Math.min(n, queue.length) }, async () => { while (queue.length) { const it = queue.shift(); try { await fn(it); } catch (e) { errs.push(e); } } }));
    if (errs.length) throw errs[0];
  }

  // ---------------------------------------------------------------- clean recording (port of AudioCleaner)
  async function decodePart(blob) {
    const buf = await blob.arrayBuffer();
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    let decoded;
    try { decoded = await ac.decodeAudioData(buf); } finally { ac.close(); }
    const len = Math.ceil(decoded.duration * 16000);
    const off = new OfflineAudioContext(1, len, 16000);
    const src = off.createBufferSource(); src.buffer = decoded; src.connect(off.destination); src.start();
    const out = await off.startRendering();
    return out.getChannelData(0);
  }
  async function cleanAudio(sid, cuts, prog) {
    const segs = segments(sid); const files = segs.length ? segs : [mainAudio(sid)];
    const enc = mp3Encoder(16000, 48);
    const P = new Processor(16000, cuts, (i16) => enc.push(i16));
    let partIdx = 0;
    for (const n of files) {
      const blob = getBlob(sid, n);
      if (!segs.length && blob.size > 60 * 1024 * 1024) throw new Error("This imported file is very large for the browser — make the clean recording in the phone app.");
      const pcm = await decodePart(blob);
      const CH = 16000 * 20;
      for (let o = 0; o < pcm.length; o += CH) {
        P.push(pcm.subarray(o, Math.min(pcm.length, o + CH)));
        prog.progress((partIdx + o / pcm.length) / files.length, "");
        await sleep(0);
      }
      partIdx++;
    }
    P.finish();
    const blob = enc.finish();
    await setBlob(K(sid, "clean_audio.m4a"), blob);
    return { inMs: Math.round(P.inSamples / 16), outMs: Math.round(P.outSamples / 16), cutMs: Math.round(P.cutSamples / 16), silenceMs: Math.round(P.silenceSamples / 16), cuts: cuts.length };
  }
  class Processor {
    constructor(sr, cuts, out) {
      this.sr = sr; this.cuts = cuts || []; this.out = out; this.N = 512; this.H = 256;
      const N = this.N; this.win = new Float64Array(N); for (let i = 0; i < N; i++) this.win[i] = Math.sqrt(0.5 - 0.5 * Math.cos(2 * Math.PI * i / N));
      this.inBuf = new Float64Array(N); this.ola = new Float64Array(N); this.re = new Float64Array(N); this.im = new Float64Array(N);
      const B = N / 2 + 1; this.sm = new Float64Array(B); this.minCur = new Float64Array(B).fill(1e18); this.minPrev = new Float64Array(B).fill(1e18); this.gPrev = new Float64Array(B).fill(1);
      this.fill = 0; this.inSamples = 0; this.cutSamples = 0; this.silenceSamples = 0; this.outSamples = 0; this.frameNo = 0;
      this.noise = 200; this.gain = 1; this.silent = 0; this.pending = [];
      const bs = this.H / sr; this.minSil = Math.floor(0.9 / bs);
      this.resetEvery = Math.max(1, Math.floor(1.5 * sr / this.H));
    }
    inCut(pos) { const ms = pos * 1000 / this.sr; for (const c of this.cuts) if (ms >= c[0] && ms < c[1]) return true; return false; }
    push(f32) {
      for (let i = 0; i < f32.length; i++) {
        const pos = this.inSamples++;
        if (this.cuts.length && (pos & 255) === 0) this._cut = this.inCut(pos);
        if (this._cut) { this.cutSamples++; continue; }
        this.inBuf[this.fill++] = f32[i] * 32767;
        if (this.fill === this.N) { this.frame(); this.inBuf.copyWithin(0, this.H); this.fill = this.N - this.H; }
      }
    }
    frame() {
      const { N, H, re, im, win, sr } = this;
      for (let i = 0; i < N; i++) { re[i] = this.inBuf[i] * win[i]; im[i] = 0; }
      fft(re, im, false);
      const B = N / 2 + 1; this.frameNo++;
      const reset = this.frameNo % this.resetEvery === 0;
      for (let k = 0; k < B; k++) {
        const pw = re[k] * re[k] + im[k] * im[k];
        this.sm[k] = this.frameNo === 1 ? pw : 0.85 * this.sm[k] + 0.15 * pw;
        if (this.sm[k] < this.minCur[k]) this.minCur[k] = this.sm[k];
        if (reset) { this.minPrev[k] = this.minCur[k]; this.minCur[k] = this.sm[k]; }
        const noise = Math.min(this.minCur[k], this.minPrev[k]) * 2.6;
        let g = pw > 0 ? 1 - noise / pw : 0; if (g < 0.12) g = 0.12;
        g = 0.55 * g + 0.45 * this.gPrev[k]; this.gPrev[k] = g;
        const fq = k * sr / N;
        if (fq < 90) g *= 0.15; else if (fq >= 1700 && fq <= 4500) g *= 1.35; else if (fq > 7500) g *= 0.75;
        re[k] *= g; im[k] *= g;
        if (k > 0 && k < N / 2) { re[N - k] = re[k]; im[N - k] = -im[k]; }
      }
      fft(re, im, true);
      for (let i = 0; i < N; i++) this.ola[i] += re[i] * win[i];
      const block = new Int16Array(H);
      for (let i = 0; i < H; i++) block[i] = Math.max(-32768, Math.min(32767, this.ola[i]));
      this.ola.copyWithin(0, H); this.ola.fill(0, N - H);
      this.stage2(block);
    }
    stage2(b) {
      let sum = 0; for (let i = 0; i < b.length; i++) sum += b[i] * b[i];
      const rms = Math.sqrt(sum / b.length);
      if (rms < this.noise * 1.6) this.noise = this.noise * 0.99 + rms * 0.01; else this.noise = this.noise * 0.9995 + rms * 0.0005;
      this.noise = Math.max(30, Math.min(this.noise, 3000));
      const speech = rms > Math.max(this.noise * 2.5, 120);
      if (speech) { const t = Math.max(1, Math.min(4, 3800 / Math.max(rms, 1))); this.gain += (t - this.gain) * (t < this.gain ? 0.3 : 0.05); this.silent = 0; } else this.silent++;
      const g = speech ? this.gain : (this.silent > 3 ? 0.35 : 0.7);
      if (g > 1.01 || g < 0.99) for (let i = 0; i < b.length; i++) { let v = b[i] * g; if (v > 26000) v = 26000 + (v - 26000) * 0.15; if (v < -26000) v = -26000 + (v + 26000) * 0.15; b[i] = Math.max(-32768, Math.min(32767, v)); }
      if (this.silent > this.minSil) { this.silenceSamples += b.length; return; }
      if (this.silent === 0) this.flush();
      if (this.silent > 0) { this.pending.push(b); return; }
      this.write(b);
    }
    write(b) { this.out(b); this.outSamples += b.length; }
    flush() { while (this.pending.length) this.write(this.pending.shift()); }
    finish() { if (this.fill > 0) { this.inBuf.fill(0, this.fill); this.frame(); } this.flush(); }
  }
  function fft(re, im, inv) {
    const n = re.length;
    for (let i = 1, j = 0; i < n; i++) { let bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { let t = re[i]; re[i] = re[j]; re[j] = t; t = im[i]; im[i] = im[j]; im[j] = t; } }
    for (let len = 2; len <= n; len <<= 1) {
      const ang = 2 * Math.PI / len * (inv ? 1 : -1), wr = Math.cos(ang), wi = Math.sin(ang);
      for (let i = 0; i < n; i += len) {
        let cr = 1, ci = 0;
        for (let k = 0; k < len / 2; k++) {
          const a = i + k, b = a + len / 2;
          const xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr;
          re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi;
          const nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr;
        }
      }
    }
    if (inv) for (let i = 0; i < n; i++) { re[i] /= n; im[i] /= n; }
  }

  // ---------------------------------------------------------------- Ask Memora
  async function ask(segment, scope, q, historyJson) {
    try {
      const st = settings(); const key = (st.apiKey || "").trim();
      if (!key) throw new Error("Add your free Gemini AI key in Settings first.");
      const meet = segment === "meet"; const db = dbObj();
      const list = (db.sessions || []).filter((s) => (s.segment === "meeting") === meet && (!scope || (meet ? s.series === scope : s.subjectId === scope))).sort((a, b) => b.date.localeCompare(a.date));
      let ctx = "", used = 0, count = 0; const trs = [];
      for (const s of list) {
        const sum = text.get(K(s.id, "summary.md")) || "", mom = meet ? text.get(K(s.id, "mom.md")) || "" : "";
        if (!sum && !mom) continue;
        let h = `\n\n=== RECORD id=${s.id} | ${s.title} | ${s.dateLabel}`;
        if (!meet) { const sb = subjectOf(s.subjectId); if (sb.name) h += ` | subject: ${sb.name}${sb.teacher ? ` (teacher: ${sb.teacher})` : ""}`; }
        else { if (s.series) h += ` | series: ${s.series}`; if (s.attendees) h += ` | attendees: ${s.attendees}`; }
        const block = h + " ===\n" + (meet ? "MINUTES:\n" + mom + "\n\nSUMMARY:\n" + sum : "NOTES:\n" + sum);
        if (used + block.length > 420000) break;
        ctx += block; used += block.length; count++;
        const tr = text.get(K(s.id, "transcript.md")); if (tr) trs.push([s.id, s.title, tr]);
      }
      for (const [id, t, tr] of trs) { const b = `\n\n=== TRANSCRIPT of id=${id} | ${t} ===\n${tr}`; if (used + b.length > 420000) continue; ctx += b; used += b.length; }
      if (meet && (db.tickets || []).length) ctx += "\n\n=== TASK TRACKER ===\n" + db.tickets.filter((t) => !scope || t.series === scope).slice(0, 300).map((t) => `- [${t.pending && t.status === "open" ? "pending" : t.status}] ${t.text} | owner: ${t.owner || "-"} | due: ${t.due || "-"}${t.pending ? ` | pending because: ${t.pending.reason || "-"} | follow up with: ${t.pending.followWith || "-"}` : ""}${t.manager ? " | needs manager alignment" : ""} | from meeting id=${t.meetingId}`).join("\n");
      if (meet && (db.plans || []).length) ctx += "\n\n=== UPCOMING MEETINGS (lineup) ===\n" + db.plans.map((p) => `- ${p.at} | ${p.title} | with: ${p.attendees || "-"} | topics: ${p.topics || "-"}`).join("\n");
      if (meet && (db.memos || []).length) ctx += "\n\n=== THINGS TO REMEMBER ===\n" + db.memos.map((m) => `- ${m.text}${m.date ? " (remind: " + m.date + ")" : ""} | from meeting id=${m.meetingId || "-"}`).join("\n");
      if (!count) return call("onAsk", { ok: true, answer: meet ? "I don't have any processed meetings yet." : "I don't have any processed classes yet." });
      const hist = J(historyJson, []).slice(-6).map((m) => (m.q ? "User: " + m.q + "\n" : "") + (m.a ? "Memora: " + m.a + "\n" : "")).join("");
      const instr = `You are Memora, the user's personal memory for their ${meet ? "MEETINGS (official and personal)" : "CLASSES (education)"}.\nAnswer ONLY from the records below (${count} ${meet ? "meetings" : "classes"}). Never use outside knowledge to fill gaps${meet ? "" : " — but you may explain a concept more simply if the user asks, as long as you say what was taught in class"}.\nIf the answer is not in the records, say clearly that you couldn't find it.\nBe specific: names, numbers, dates, who said it. Prefer short paragraphs and bullet points.\nAfter each fact, cite its source as [[ID|Title · date]] using the record id and title. Add the timestamp inside the label when known.\nReply in the same language and style the user writes in (English, Tamil or Tanglish).\n`;
      const ans = await generate(key, st.model || "gemini-flash-latest", [textPart(instr + (hist ? "\nRecent conversation:\n" + hist : "") + "\nUser question: " + q), textPart("RECORDS:\n" + ctx)], 0.3, false);
      call("onAsk", { ok: true, answer: ans });
    } catch (e) { call("onAsk", { ok: false, msg: friendly(e) }); }
  }

  // ---------------------------------------------------------------- public
  async function gen(id, prompt, txt, json, fast) {
    try {
      const st = settings(); const key = (st.apiKey || "").trim();
      if (!key) throw new Error("Add your free Gemini AI key in Settings first.");
      const parts = [textPart(prompt), textPart(txt)];
      const out = fast ? await generateFast(key, parts, 0.3, !!json) : await generate(key, st.model || "gemini-flash-latest", parts, 0.35, !!json);
      call("onGen", id, { ok: true, text: out });
    } catch (e) { call("onGen", id, { ok: false, msg: friendly(e) }); }
  }
  async function shrink(blob, max) {
    try {
      const bmp = await createImageBitmap(blob); const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
      const c = document.createElement("canvas"); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
      c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      return await new Promise((r) => c.toBlob((b) => r(b || blob), "image/jpeg", 0.85));
    } catch (e) { return blob; }
  }
  async function pptxText(blob) {
    const z = await JSZip.loadAsync(blob); const out = [];
    const names = Object.keys(z.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));
    for (const n of names) {
      const xml = await z.file(n).async("string"); const no = n.match(/(\d+)\.xml/)[1];
      const txt = xml.replace(/<\/a:p>/g, "\n").replace(/<a:t>([^<]*)<\/a:t>|<[^>]+>/g, (m, t) => t || "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/\n{2,}/g, "\n").trim();
      const nf = z.file(`ppt/notesSlides/notesSlide${no}.xml`);
      const notes = nf ? (await nf.async("string")).replace(/<\/a:p>/g, "\n").replace(/<a:t>([^<]*)<\/a:t>|<[^>]+>/g, (m, t) => t || "").trim() : "";
      if (txt || notes) out.push(`--- Slide ${no} ---\n${txt}${notes ? "\n  Speaker notes: " + notes : ""}`);
    }
    return out.join("\n") || "(no text found on the slides)";
  }
  const upCache = new Map();
  async function genWith(id, prompt, txt, json, sid, filesJson, fast) {
    try {
      const st = settings(); const key = (st.apiKey || "").trim();
      if (!key) throw new Error("Add your free Gemini AI key in Settings first.");
      const prep = await Promise.all(JSON.parse(filesJson || "[]").map(async (it) => {
        const b = getBlob(sid, it.file); if (!b) return [];
        const label = it.label || it.file, ln = it.file.toLowerCase(), ck = sid + "/" + it.file;
        if (ln.endsWith(".pptx")) return [textPart(label + " (slide text):\n" + await pptxText(b))];
        if (ln.endsWith(".ppt")) return [textPart(label + ": old .ppt format could not be read — mention that it should be saved as PDF or PPTX.")];
        let up = upCache.get(ck);
        if (!up || Date.now() - up.at > 40 * 3600000) {
          up = ln.endsWith(".pdf") ? await upload(key, b, "application/pdf", it.file) : await upload(key, await shrink(b, 1600), "image/jpeg", it.file);
          up.at = Date.now(); upCache.set(ck, up);
        }
        return [textPart(label + ":"), filePart(up)];
      }));
      const parts = [textPart(prompt)].concat(...prep, [textPart(txt)]);
      const out = fast ? await generateFast(key, parts, 0.3, !!json) : await generate(key, st.model || "gemini-flash-latest", parts, 0.3, !!json);
      call("onGen", id, { ok: true, text: out });
    } catch (e) { call("onGen", id, { ok: false, msg: friendly(e) }); }
  }
  window.MemoraJobs = {
    gen, genWith,
    busy: () => active.size > 0,
    status(sid) {
      const o = J(text.get(K(sid, "status.json")), {});
      if (o.running && !active.has(sid)) { o.running = false; if (!o.error) o.error = "Stopped before finishing. Tap Retry."; }
      return JSON.stringify(o);
    },
    reset(sid) { active.delete(sid); setText(K(sid, "status.json"), JSON.stringify({ running: false, progress: 0, stage: "Stopped", error: "Stopped. Tap Retry / ↻ to start again — finished parts are kept." })); },
    ask,
    start(sid, type, code, langName, force) {
      const key = sid + "|" + type + "|" + code;
      if ([...active.values()].includes(key)) return;
      active.set(sid, key);
      (async () => {
        const j = new Job(sid, type + (code ? ":" + code : ""));
        try {
          j.status(true, 0.01, "Starting", null);
          if (type === "summary") await j.runSummary(force);
          else if (type === "translate") await j.runTranslate(code, langName, false);
          else if (type === "taudio") await j.runTranslate(code, langName, true);
          else if (type === "audio") await j.runAudio();
          else if (type === "quiz") await j.runQuiz();
          else if (type === "pack") await j.runPack(code || "all");
          else if (type === "experience") await j.runExperience(code);
          j.status(false, 1, "Ready", j.voiceNote);
          if (type === "summary" && !j.isMeeting() && j.s.autoExperience !== false) {
            const e = new Job(sid, "experience:all");
            try { e.status(true, 0.02, "Preparing Class Book, Q&A, replay & clean audio", null); await e.runExperience("all"); e.status(false, 1, "Ready", e.voiceNote); }
            catch (x) { e.status(false, e.lo, e.stage, friendly(x)); }
          }
        } catch (e) { console.error(e); j.status(false, j.lo, j.stage, friendly(e)); }
        finally { active.delete(sid); }
      })();
    },
  };
})();
