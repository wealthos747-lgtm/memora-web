/* Memora Web — browser implementation of the Android bridge (window.Android).
   Everything stays in this browser: IndexedDB for files, your Gemini key in your own settings. */
(async function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const J = (s, d) => { try { return s ? JSON.parse(s) : d; } catch (e) { return d; } };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const call = (fn, ...args) => { try { if (typeof window[fn] === "function") window[fn](...args); } catch (e) { console.error(e); } };

  // ------------------------------------------------------------------ storage (IndexedDB + sync in-memory cache)
  const idb = await new Promise((res, rej) => {
    const r = indexedDB.open("memora-web", 1);
    r.onupgradeneeded = () => r.result.createObjectStore("f");
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
  const text = new Map(), blobs = new Map();
  await new Promise((res) => {
    const tx = idb.transaction("f", "readonly").objectStore("f").openCursor();
    tx.onsuccess = () => {
      const c = tx.result;
      if (!c) return res();
      if (typeof c.value === "string") text.set(c.key, c.value);
      else if (c.value instanceof Blob) blobs.set(c.key, { blob: c.value, url: URL.createObjectURL(c.value) });
      c.continue();
    };
    tx.onerror = () => res();
  });
  try { navigator.storage && navigator.storage.persist && navigator.storage.persist(); } catch (e) { }
  const put = (k, v) => new Promise((res) => { const t = idb.transaction("f", "readwrite"); t.objectStore("f").put(v, k); t.oncomplete = res; t.onerror = res; });
  const del = (k) => new Promise((res) => { const t = idb.transaction("f", "readwrite"); t.objectStore("f").delete(k); t.oncomplete = res; t.onerror = res; });
  const K = (sid, n) => sid + "/" + n;
  const setText = (k, s) => { text.set(k, s); return put(k, s); };
  const setBlob = (k, b) => { const o = blobs.get(k); if (o) URL.revokeObjectURL(o.url); blobs.set(k, { blob: b, url: URL.createObjectURL(b) }); return put(k, b); };
  const remove = (k) => { const o = blobs.get(k); if (o) URL.revokeObjectURL(o.url); blobs.delete(k); text.delete(k); return del(k); };
  const getBlob = (sid, n) => (blobs.get(K(sid, n)) || {}).blob || null;
  const has = (sid, n) => (text.has(K(sid, n)) && text.get(K(sid, n)).length > 0) || (blobs.has(K(sid, n)) && blobs.get(K(sid, n)).blob.size > 0);
  const dbObj = () => J(text.get("db"), {});
  const settings = () => dbObj().settings || {};
  const sessionOf = (sid) => (dbObj().sessions || []).find((s) => s.id === sid) || {};
  const subjectOf = (id) => (dbObj().subjects || []).find((s) => s.id === id) || {};
  const listFiles = (sid) => { const p = sid + "/"; const out = []; for (const k of text.keys()) if (k.startsWith(p)) out.push(k.slice(p.length)); for (const k of blobs.keys()) if (k.startsWith(p)) out.push(k.slice(p.length)); return out; };
  const segments = (sid) => listFiles(sid).filter((n) => /^seg_\d+\.(mp3|webm|m4a)$/.test(n)).sort();
  const mainAudio = (sid) => listFiles(sid).find((n) => /^audio\./.test(n) && getBlob(sid, n)) || "";
  const mimeFor = (n) => { n = n.toLowerCase(); if (n.endsWith(".mp3")) return "audio/mpeg"; if (n.endsWith(".m4a") || n.endsWith(".mp4") || n.endsWith(".aac")) return "audio/mp4"; if (n.endsWith(".wav")) return "audio/wav"; if (n.endsWith(".ogg") || n.endsWith(".opus")) return "audio/ogg"; if (n.endsWith(".webm")) return "audio/webm"; if (n.endsWith(".flac")) return "audio/flac"; if (n.endsWith(".pdf")) return "application/pdf"; if (/\.(jpe?g)$/.test(n)) return "image/jpeg"; if (n.endsWith(".png")) return "image/png"; if (n.endsWith(".md") || n.endsWith(".txt")) return "text/plain"; return "application/octet-stream"; };
  const fmtTime = (ms) => { const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60; const p = (n) => String(n).padStart(2, "0"); return h ? `${h}:${p(m)}:${p(x)}` : `${p(m)}:${p(x)}`; };
  function durationOf(blob) {
    return new Promise((res) => {
      const a = new Audio(); const u = URL.createObjectURL(blob); a.preload = "metadata"; a.src = u;
      const done = (d) => { URL.revokeObjectURL(u); res(isFinite(d) ? Math.round(d * 1000) : 0); };
      a.onloadedmetadata = () => { if (a.duration === Infinity) { a.currentTime = 1e9; a.ontimeupdate = () => { a.ontimeupdate = null; done(a.duration); }; } else done(a.duration); };
      a.onerror = () => done(0);
      setTimeout(() => done(a.duration || 0), 15000);
    });
  }
  function download(blob, name) {
    if (blob.type === "audio/mpeg") name = name.replace(/\.m4a$/i, ".mp3");
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name.replace(/[\\/:*?"<>|]+/g, "-");
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
  }
  function pickFile(accept) {
    return new Promise((res) => {
      const i = document.createElement("input"); i.type = "file"; i.accept = accept; i.style.display = "none";
      i.onchange = () => { res(i.files[0] || null); i.remove(); };
      document.body.appendChild(i); i.click();
    });
  }
  const toastMsg = (m) => { const t = $("#toast"); if (!t) return; t.textContent = m; t.classList.add("on"); clearTimeout(toastMsg._t); toastMsg._t = setTimeout(() => t.classList.remove("on"), 2800); };
  const b64 = async (blob) => { const buf = new Uint8Array(await blob.arrayBuffer()); let s = ""; for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode.apply(null, buf.subarray(i, i + 0x8000)); return btoa(s); };

  // ------------------------------------------------------------------ MP3 helper (lamejs)
  function mp3Encoder(rate, kbps) {
    const enc = new lamejs.Mp3Encoder(1, rate, kbps); const chunks = [];
    return {
      push(int16) { for (let i = 0; i < int16.length; i += 1152 * 8) { const d = enc.encodeBuffer(int16.subarray(i, i + 1152 * 8)); if (d.length) chunks.push(new Uint8Array(d)); } },
      chunks, finish() { const d = enc.flush(); if (d.length) chunks.push(new Uint8Array(d)); return new Blob(chunks, { type: "audio/mpeg" }); },
    };
  }
  const f2i = (f) => { const o = new Int16Array(f.length); for (let i = 0; i < f.length; i++) { const v = Math.max(-1, Math.min(1, f[i])); o[i] = v < 0 ? v * 32768 : v * 32767; } return o; };

  // ------------------------------------------------------------------ recorder (mic → noise-suppressed → silence skip → MP3 segments)
  const REC = { state: "idle", sid: null, acc: 0, amp: 0, marks: [], err: "", doneId: null, doneMs: 0, skipped: 0 };
  let rec = null;
  async function recStart(sid, title) {
    const st = settings(), clean = st.noiseClean !== false, skip = st.skipSilence !== false;
    let stream;
    try { stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: clean, noiseSuppression: clean, autoGainControl: clean } }); }
    catch (e) { REC.err = "Microphone not allowed: " + e.message; REC.state = "idle"; return; }
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const src = ctx.createMediaStreamSource(stream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    const mute = ctx.createGain(); mute.gain.value = 0;
    src.connect(proc); proc.connect(mute); mute.connect(ctx.destination);
    const ratio = ctx.sampleRate / 16000;
    const existing = segments(sid).length;
    rec = { ctx, stream, src, proc, ratio, frac: 0, enc: mp3Encoder(16000, 32), segIdx: existing, segSamples: 0, written: 0, hpY: 0, hpX: 0, noise: 0.01, since: 999, frames: 0, pre: [], inSil: false, lastPersist: Date.now() };
    REC.sid = sid; REC.acc = 0; REC.marks = J(text.get(K(sid, "bookmarks.json")), []); REC.err = ""; REC.skipped = 0; REC.state = "recording";
    for (const s of segments(sid)) REC.acc += J(text.get(K(sid, s + ".ms")), 0);
    proc.onaudioprocess = (e) => { if (REC.state === "recording") onPcm(e.inputBuffer.getChannelData(0), skip); };
  }
  function onPcm(inp, skip) {
    const r = rec; const out = [];
    // resample to 16 kHz (linear)
    let pos = r.frac;
    while (pos < inp.length - 1) { const i = Math.floor(pos), f = pos - i; out.push(inp[i] * (1 - f) + inp[i + 1] * f); pos += r.ratio; }
    r.frac = pos - inp.length + 1 > 0 ? pos - (inp.length - 1) : 0;
    const FR = 320; // 20 ms frames
    for (let o = 0; o + FR <= out.length; o += FR) {
      let sum = 0; const fr = new Float32Array(FR);
      for (let i = 0; i < FR; i++) { const x = out[o + i]; r.hpY = 0.96 * (r.hpY + x - r.hpX); r.hpX = x; fr[i] = r.hpY; sum += r.hpY * r.hpY; }
      const rms = Math.sqrt(sum / FR);
      if (rms < r.noise * 1.6) r.noise = r.noise * 0.995 + rms * 0.005; else r.noise = r.noise * 0.9995 + rms * 0.0005;
      r.noise = Math.max(0.002, Math.min(r.noise, 0.12));
      const speech = rms > Math.max(r.noise * 1.8, 0.0035);
      r.since = speech ? 0 : r.since + 1; r.frames++;
      REC.amp = Math.min(32767, rms * 32767 * 2.2);
      const keep = !skip || r.since <= 200 || r.frames < 50;
      if (!keep) { r.pre.push(fr); if (r.pre.length > 15) { r.pre.shift(); REC.skipped += 20; } r.inSil = true; continue; }
      if (r.inSil) { for (const p of r.pre) encodeFrame(p); r.pre = []; r.inSil = false; }
      encodeFrame(fr);
    }
    if (Date.now() - r.lastPersist > 45000) { r.lastPersist = Date.now(); persistPartial(); }
  }
  function encodeFrame(fr) {
    const r = rec; r.enc.push(f2i(fr)); r.segSamples += fr.length; r.written += fr.length;
    if (r.segSamples >= 16000 * 60 * 15) finishSegment(); // 15-minute segments
  }
  function segName(i) { return `seg_${String(i).padStart(3, "0")}.mp3`; }
  function finishSegment() {
    const r = rec; if (!r || r.segSamples === 0) return;
    const blob = r.enc.finish(); const ms = Math.round(r.segSamples / 16);
    setBlob(K(REC.sid, segName(r.segIdx)), blob); setText(K(REC.sid, segName(r.segIdx) + ".ms"), String(ms));
    remove(K(REC.sid, "partial.mp3"));
    REC.acc += ms; r.segIdx++; r.segSamples = 0; r.enc = mp3Encoder(16000, 32);
  }
  function persistPartial() { // crash safety: what has been encoded so far
    const r = rec; if (!r || !r.enc.chunks.length) return;
    setBlob(K(REC.sid, "partial.mp3"), new Blob(r.enc.chunks, { type: "audio/mpeg" }));
    setText(K(REC.sid, "partial.ms"), String(Math.round(r.segSamples / 16)));
  }
  async function recStop() {
    if (!rec) return;
    REC.state = "saving";
    const sid = REC.sid;
    finishSegment();
    try { rec.proc.disconnect(); rec.src.disconnect(); rec.stream.getTracks().forEach((t) => t.stop()); await rec.ctx.close(); } catch (e) { }
    rec = null;
    const ms = await finalizeSession(sid);
    REC.doneId = sid; REC.doneMs = ms; REC.sid = null; REC.state = "idle";
  }
  async function finalizeSession(sid) {
    if (getBlob(sid, "partial.mp3")) { // recover an interrupted segment
      const segs = segments(sid); const i = segs.length;
      await setBlob(K(sid, segName(i)), getBlob(sid, "partial.mp3")); await setText(K(sid, segName(i) + ".ms"), text.get(K(sid, "partial.ms")) || "0");
      await remove(K(sid, "partial.mp3"));
    }
    const segs = segments(sid);
    if (segs.length) await setBlob(K(sid, "audio.mp3"), new Blob(segs.map((n) => getBlob(sid, n)), { type: "audio/mpeg" }));
    let total = 0; for (const n of segs) total += +(text.get(K(sid, n + ".ms")) || 0);
    if (!total && getBlob(sid, "audio.mp3")) total = await durationOf(getBlob(sid, "audio.mp3"));
    return total;
  }
  const elapsed = () => REC.acc + (rec && REC.state === "recording" ? Math.round(rec.segSamples / 16) : 0);

  // ------------------------------------------------------------------ player
  const audio = new Audio(); audio.preload = "auto";
  const PL = { path: null, title: "", subtitle: "", speed: 1 };
  const resolvePath = (p) => { const m = /^web:([^/]+)\/(.+)$/.exec(p || ""); return m ? (blobs.get(K(m[1], m[2])) || {}).url : null; };
  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", () => audio.play());
    navigator.mediaSession.setActionHandler("pause", () => audio.pause());
    navigator.mediaSession.setActionHandler("seekbackward", () => (audio.currentTime -= 15));
    navigator.mediaSession.setActionHandler("seekforward", () => (audio.currentTime += 15));
  }

  // ------------------------------------------------------------------ Gemini (browser)
  const BASE = "https://generativelanguage.googleapis.com";
  class ApiError extends Error { constructor(code, msg) { super(msg); this.code = code; } }
  async function http(method, url, key, body, headers, ct) {
    const h = Object.assign({}, headers || {});
    if (key) h["x-goog-api-key"] = key;
    if (ct) h["Content-Type"] = ct;
    const r = await fetch(url, { method, headers: h, body });
    const t = await r.text();
    return { code: r.status, body: t, headers: r.headers };
  }
  const errMsg = (r) => { try { const e = JSON.parse(r.body).error; if (e) return e.message; } catch (x) { } return r.body.slice(0, 300); };
  const retryAfter = (r, d) => { const m = /"retryDelay"\s*:\s*"(\d+)/.exec(r.body); return m ? Math.max(2, Math.min(60, +m[1] + 1)) : d; };
  const textPart = (t) => ({ text: t });
  const filePart = (u) => (u.inline ? { inline_data: { mime_type: u.mimeType, data: u.inline } } : { file_data: { mime_type: u.mimeType, file_uri: u.uri } });
  async function generateOne(key, model, parts, temp, json, note) {
    const body = JSON.stringify({ contents: [{ role: "user", parts }], generationConfig: Object.assign({ temperature: temp }, json ? { responseMimeType: "application/json" } : {}) });
    const m = model.startsWith("models/") ? model : "models/" + model;
    for (let attempt = 0; ; attempt++) {
      let r;
      try { r = await http("POST", `${BASE}/v1beta/${m}:generateContent`, key, body, null, "application/json"); }
      catch (e) { if (attempt < 3) { await sleep(6000 * (attempt + 1)); continue; } throw new ApiError(0, "Network problem: " + e.message); }
      if ([429, 500, 503, 504].includes(r.code)) {
        if (attempt < (r.code === 429 ? 1 : 2)) { const w = r.code === 429 ? retryAfter(r, 15) : 6 * (attempt + 1); note && note(`Google is busy — retrying in ${w}s`); await sleep(w * 1000); continue; }
        throw new ApiError(r.code, errMsg(r));
      }
      if (r.code >= 300) throw new ApiError(r.code, errMsg(r));
      const res = JSON.parse(r.body);
      const cand = (res.candidates || [])[0];
      if (!cand) throw new ApiError(500, "No answer from AI");
      const out = ((cand.content || {}).parts || []).filter((p) => !p.thought).map((p) => p.text || "").join("").trim();
      if (!out) { if (attempt < 2) continue; throw new ApiError(500, "Empty answer from AI"); }
      return out.replace(/^```[a-z]*\n?/, "").replace(/```$/, "").trim();
    }
  }
  async function generate(key, model, parts, temp, json, note) {
    const chain = [...new Set([model.replace("models/", ""), "gemini-2.5-flash", "gemini-flash-latest", "gemini-flash-lite-latest", "gemini-2.5-flash-lite"])];
    let last;
    for (const m of chain) {
      try { return await generateOne(key, m, parts, temp, json, note); }
      catch (e) { last = e; if ([429, 500, 503, 504, 404].includes(e.code)) { note && note("switching to " + m); continue; } throw e; }
    }
    throw last;
  }
  let uploadsBlocked = false; // set if the browser can't use Google's upload endpoint (CORS)
  async function upload(key, blob, mime, name) {
    if (!uploadsBlocked) {
      try {
        const start = await http("POST", `${BASE}/upload/v1beta/files`, key, JSON.stringify({ file: { display_name: name } }),
          { "X-Goog-Upload-Protocol": "resumable", "X-Goog-Upload-Command": "start", "X-Goog-Upload-Header-Content-Length": String(blob.size), "X-Goog-Upload-Header-Content-Type": mime }, "application/json");
        if (start.code >= 300) throw new ApiError(start.code, errMsg(start));
        const url = start.headers.get("x-goog-upload-url");
        if (!url) throw new Error("NOURL");
        const up = await http("POST", url, null, blob, { "X-Goog-Upload-Offset": "0", "X-Goog-Upload-Command": "upload, finalize" }, mime);
        if (up.code >= 300) throw new ApiError(up.code, errMsg(up));
        let file = JSON.parse(up.body).file; let tries = 0;
        while (file.state !== "ACTIVE") {
          if (file.state === "FAILED") throw new ApiError(500, "Google could not process this audio");
          if (tries++ > 120) throw new ApiError(500, "Audio processing timed out");
          await sleep(3000);
          const g = await http("GET", `${BASE}/v1beta/${file.name}`, key);
          if (g.code >= 300) throw new ApiError(g.code, errMsg(g));
          file = JSON.parse(g.body);
        }
        return { uri: file.uri, mimeType: file.mimeType || mime, at: Date.now() };
      } catch (e) {
        if (e instanceof ApiError && e.code >= 400 && e.code < 500 && e.code !== 404) throw e;
        uploadsBlocked = true;
      }
    }
    if (blob.size > 14 * 1024 * 1024) throw new ApiError(413, "This file is too large to send from the browser. Use the phone app, or import a smaller / MP3 file.");
    return { inline: await b64(blob), mimeType: mime, at: Date.now() };
  }
  const TTS_MODELS = ["gemini-3.1-flash-tts-preview", "gemini-2.5-flash-preview-tts"];
  const ttsBlocked = {}; let ttsRR = 0;
  const ttsDaily = () => TTS_MODELS.every((m) => ttsBlocked[m] && ttsBlocked[m] > Date.now());
  async function tts(key, txt, voice, style, speakers, waitCb) {
    const speech = speakers
      ? { multiSpeakerVoiceConfig: { speakerVoiceConfigs: [{ speaker: speakers[0], voiceConfig: { prebuiltVoiceConfig: { voiceName: speakers[1] } } }, { speaker: speakers[2], voiceConfig: { prebuiltVoiceConfig: { voiceName: speakers[3] } } }] } }
      : { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } };
    const body = JSON.stringify({ contents: [{ role: "user", parts: [{ text: style + "\n\n" + txt }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: speech } });
    let last; const dead = new Set(); let net = 0;
    for (let round = 0; round < 8; round++) {
      const start = ttsRR++; let minWait = 60, tried = false;
      for (let t = 0; t < TTS_MODELS.length; t++) {
        const m = TTS_MODELS[(start + t) % TTS_MODELS.length];
        if (dead.has(m) || (ttsBlocked[m] && ttsBlocked[m] > Date.now())) continue;
        tried = true;
        let r;
        try { r = await http("POST", `${BASE}/v1beta/models/${m}:generateContent`, key, body, null, "application/json"); }
        catch (e) { if (++net > 4) throw new ApiError(0, "Network problem"); await sleep(4000 * net); continue; }
        if (r.code === 404 || (r.code === 400 && /model/i.test(r.body))) { dead.add(m); last = new ApiError(r.code, errMsg(r)); continue; }
        if (r.code === 429) { last = new ApiError(429, errMsg(r)); if (/per.?day|daily/i.test(r.body)) ttsBlocked[m] = Date.now() + 3 * 3600000; else minWait = Math.min(minWait, retryAfter(r, 20)); continue; }
        if (r.code >= 500) { last = new ApiError(r.code, errMsg(r)); minWait = Math.min(minWait, 6); continue; }
        if (r.code >= 300) throw new ApiError(r.code, errMsg(r));
        const parts = JSON.parse(r.body).candidates[0].content.parts;
        let rate = 24000; const bufs = [];
        for (const p of parts) {
          const d = p.inlineData || p.inline_data; if (!d) continue;
          const mm = /rate=(\d+)/.exec(d.mimeType || d.mime_type || ""); if (mm) rate = +mm[1];
          const bin = atob(d.data); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); bufs.push(u);
        }
        const total = bufs.reduce((a, b) => a + b.length, 0);
        if (!total) { last = new ApiError(500, "Empty voice"); continue; }
        const all = new Uint8Array(total); let o = 0; for (const b of bufs) { all.set(b, o); o += b.length; }
        return { pcm: new Int16Array(all.buffer, 0, Math.floor(total / 2)), rate };
      }
      if (ttsDaily()) throw new ApiError(429, "daily voice limit reached");
      if (!tried && dead.size >= TTS_MODELS.length) break;
      waitCb && waitCb(minWait); await sleep(minWait * 1000); waitCb && waitCb(0);
    }
    throw last || new ApiError(500, "Voice failed");
  }
  function friendly(e) {
    const m = (e && e.message) || String(e);
    if (e && e.code === 429) return "Free AI limit reached for now. It resets within a day — tap Retry later (or use a paid key).";
    if (e && (e.code === 503 || e.code === 500)) return "Google's AI is very busy right now. Tap Retry in a few minutes — finished steps are kept.";
    if (e && e.code === 400 && /api key/i.test(m)) return "Your AI key looks invalid. Check it in Settings.";
    if (e && e.code === 403) return "Google refused the request (key not allowed for this model). Check the key / model in Settings.";
    if (e && e.code === 404) return "Model not found. Pick another model in Settings → AI model.";
    if (e && e.code) return `AI error (${e.code}): ${m}`;
    return m;
  }
  window.MemoraWeb = { text, blobs, K, setText, setBlob, remove, getBlob, has, settings, sessionOf, subjectOf, listFiles, segments, mainAudio, mimeFor, fmtTime, durationOf, download, generate, upload, tts, ttsDaily, friendly, ApiError, textPart, filePart, mp3Encoder, f2i, finalizeSession, sleep, J, dbObj, toastMsg };

  // ------------------------------------------------------------------ the bridge
  let pending = null, pendingName = "";
  let storage = "—";
  const refreshStorage = async () => { try { const e = await navigator.storage.estimate(); storage = (e.usage / 1048576).toFixed(1) + " MB"; } catch (x) { } };
  refreshStorage();
  const lockKey = "memora-web-lock";

  window.Android = {
    version: () => "web",
    readDb: () => text.get("db") || "",
    writeDb: (s) => { setText("db", s); return true; },
    readText: (sid, n) => text.get(K(sid, n)) || "",
    writeText: (sid, n, t) => { setText(K(sid, n), t); return true; },
    exists: (sid, n) => has(sid, n),
    sessionPath: (sid) => "web:" + sid,
    fileUrl: (sid, rel) => (blobs.get(K(sid, rel)) || {}).url || "",
    audioName: (sid) => mainAudio(sid),
    listFiles: (sid) => JSON.stringify(listFiles(sid)),
    deleteSession: (sid) => { for (const n of listFiles(sid)) remove(K(sid, n)); },
    storageInfo: () => { refreshStorage(); return storage; },
    hasPerm: () => true,
    requestPerms: async () => {
      try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach((t) => t.stop()); call("onPerms", { mic: true, notif: true }); }
      catch (e) { toastMsg("Allow the microphone in the browser's address bar"); call("onPerms", { mic: false, notif: true }); }
    },
    batterySettings: () => toastMsg("Not needed on the web — keep this tab open while recording"),
    ttsSettings: () => toastMsg("On the web, turn on Studio voice in Settings"),

    // recording
    recStart: (sid, title) => { recStart(sid, title); return true; },
    recPause: () => { if (REC.state === "recording") REC.state = "paused"; },
    recResume: () => { if (REC.state === "paused") REC.state = "recording"; },
    recStop: () => { recStop(); },
    recMark: (note) => { if (REC.state === "idle") return; REC.marks.push({ t: elapsed(), note: note || "" }); setText(K(REC.sid, "bookmarks.json"), JSON.stringify(REC.marks)); },
    recNoteLast: (note) => { if (!REC.marks.length) return; REC.marks[REC.marks.length - 1].note = note; setText(K(REC.sid, "bookmarks.json"), JSON.stringify(REC.marks)); },
    recState: () => JSON.stringify({ state: REC.state, sid: REC.sid, elapsed: elapsed(), amp: REC.amp, marks: REC.marks.length, error: REC.err, doneId: REC.doneId, doneMs: REC.doneMs, skipped: REC.skipped }),
    recRecover: async (sid) => { const ms = await finalizeSession(sid); call("onRecovered", sid, ms); },

    // AI jobs (run in this tab)
    process: (sid, type, code, lang, force) => window.MemoraJobs && window.MemoraJobs.start(sid, type, code, lang, force),
    jobStatus: (sid) => window.MemoraJobs ? window.MemoraJobs.status(sid) : "{}",
    resetJob: (sid) => window.MemoraJobs && window.MemoraJobs.reset(sid),
    testKey: async (key, model) => {
      try { const a = await generate(key.trim(), (model || "gemini-flash-latest").trim(), [textPart("Reply with exactly: OK")], 0, false); call("onKeyTest", { ok: true, msg: "Key works ✓ (" + a.slice(0, 20) + ")" }); }
      catch (e) { call("onKeyTest", { ok: false, msg: friendly(e) }); }
    },
    listModels: async (key) => {
      try {
        const r = await http("GET", `${BASE}/v1beta/models?pageSize=200`, key.trim());
        if (r.code >= 300) throw new ApiError(r.code, errMsg(r));
        const ms = (JSON.parse(r.body).models || []).filter((m) => (m.supportedGenerationMethods || []).includes("generateContent") && m.name.includes("gemini")).map((m) => ({ name: m.name.replace("models/", ""), label: m.displayName || m.name }));
        call("onModels", { ok: true, models: ms });
      } catch (e) { call("onModels", { ok: false, msg: friendly(e) }); }
    },
    ask: (seg, scope, q, hist) => window.MemoraJobs.ask(seg, scope, q, hist),
    gen: (id, prompt, txt, json) => window.MemoraJobs.gen(id, prompt, txt, json),

    // player
    playLoad: (path, title, sub, seek) => {
      const u = resolvePath(path); if (!u) { toastMsg("Audio not found"); return; }
      Object.assign(PL, { path, title, subtitle: sub });
      audio.src = u; audio.playbackRate = PL.speed;
      audio.onloadedmetadata = () => { if (seek) audio.currentTime = seek / 1000; audio.play().catch(() => { }); };
      if ("mediaSession" in navigator) navigator.mediaSession.metadata = new MediaMetadata({ title, artist: sub || "Memora" });
    },
    playToggle: () => { if (audio.paused) audio.play().catch(() => { }); else audio.pause(); },
    playBy: (ms) => { audio.currentTime = Math.max(0, audio.currentTime + ms / 1000); },
    playSeek: (ms) => { audio.currentTime = ms / 1000; },
    playSpeed: (s) => { PL.speed = s; audio.playbackRate = s; },
    playStop: () => { audio.pause(); audio.removeAttribute("src"); PL.path = null; },
    playState: () => JSON.stringify({ path: PL.path, title: PL.title, subtitle: PL.subtitle, playing: !audio.paused && !!PL.path, pos: Math.round((audio.currentTime || 0) * 1000), dur: isFinite(audio.duration) ? Math.round(audio.duration * 1000) : 0, speed: PL.speed }),

    // files out
    exportFile: (sid, n, display) => { const b = getBlob(sid, n) || (text.get(K(sid, n)) != null ? new Blob([text.get(K(sid, n))], { type: "text/markdown" }) : null); if (!b) { toastMsg("File not ready yet"); return ""; } download(b, display); toastMsg("Downloading…"); return "started"; },
    exportFiles: async (sid, items, folder) => {
      const list = J(items, []); let ok = 0;
      for (let i = 0; i < list.length; i++) { call("onDlProgress", i, list.length); const [n, d] = list[i]; const b = getBlob(sid, n); if (b) { download(b, d); ok++; await sleep(700); } }
      call("onExported", ok, list.length, folder);
    },
    shareFile: (sid, n, display) => window.Android.exportFile(sid, n, display),
    shareText: async (t) => { try { if (navigator.share) await navigator.share({ text: t }); else { await navigator.clipboard.writeText(t); toastMsg("Copied — paste it anywhere"); } } catch (e) { } },
    copyText: async (t) => { try { await navigator.clipboard.writeText(t); toastMsg("Copied"); } catch (e) { toastMsg("Couldn't copy"); } },
    composeEmail: (to, subject, body) => { window.location.href = `mailto:${encodeURIComponent(to || "")}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; },
    printPdf: (html) => printHtml(html),
    savePdf: (sid, html, name, folder, cbId) => {
      // quiet mode (Download all) gets a print-ready HTML file; a direct PDF request opens the browser's Save-as-PDF dialog
      if (window.__quietPdf) { download(new Blob([html], { type: "text/html" }), name.replace(/\.pdf$/, ".html")); call("onPdf", cbId, true, "Saved as a print-ready page (open it and press Ctrl+P → Save as PDF)", ""); return; }
      printHtml(html); call("onPdf", cbId, true, "In the print window choose “Save as PDF”.", "");
    },

    // files in
    pickAudio: async () => { const f = await pickFile("audio/*,video/*"); if (!f) return; pending = f; pendingName = f.name; call("onImportReady", f.name); },
    checkPending: () => "", clearPending: () => { pending = null; },
    importPending: async (sid) => {
      const f = pending; pending = null; if (!f) return;
      try {
        const ext = (/\.([a-z0-9]{2,5})$/i.exec(f.name) || [, "mp3"])[1].toLowerCase();
        for (const n of listFiles(sid)) if (n.startsWith("audio.")) await remove(K(sid, n));
        await setBlob(K(sid, "audio." + ext), f);
        call("onImported", sid, { ok: true, durationMs: await durationOf(f) });
      } catch (e) { call("onImported", sid, { ok: false, msg: "Could not import: " + e.message }); }
    },
    takePhoto: (sid) => window.Android.pickPhoto(sid),
    pickPhoto: async (sid) => { const f = await pickFile("image/*"); if (!f) return; const n = "p_" + Date.now() + ".jpg"; await setBlob(K(sid, "photos/" + n), f); call("onPhoto", sid, n); },
    deletePhoto: (sid, n) => remove(K(sid, "photos/" + n)),
    openUrl: (u) => window.open(u, "_blank", "noopener"),
    toast: (m) => toastMsg(m),
    takeAction: () => "",
    setReminders: () => { },
    exactAlarms: () => true,

    // backup
    backup: async (withAudio) => {
      try {
        const z = new JSZip();
        for (const [k, v] of text) z.file(k === "db" ? "db.json" : "sessions/" + k, v);
        if (withAudio) for (const [k, v] of blobs) z.file("sessions/" + k, v.blob);
        else for (const [k, v] of blobs) if (/photos\//.test(k)) z.file("sessions/" + k, v.blob);
        const blob = await z.generateAsync({ type: "blob" });
        const name = "Memora-backup-" + new Date().toISOString().slice(0, 16).replace(/[:T]/g, "-") + ".zip";
        download(blob, name);
        call("onBackup", { ok: true, name, size: blob.size, msg: "Downloaded" });
      } catch (e) { call("onBackup", { ok: false, msg: e.message }); }
    },
    shareBackup: () => toastMsg("The backup was downloaded — upload it to Google Drive from your Downloads folder"),
    pickBackup: async () => {
      const f = await pickFile(".zip,application/zip"); if (!f) return;
      try {
        const z = await JSZip.loadAsync(f); let n = 0, hasDb = false;
        for (const name of Object.keys(z.files)) {
          const e = z.files[name]; if (e.dir) continue;
          const key = name === "db.json" ? "db" : name.replace(/^sessions\//, "");
          if (name === "db.json") hasDb = true;
          if (/\.(json|md|txt|ms)$/.test(name) || name === "db.json") await setText(key, await e.async("string"));
          else await setBlob(key, new Blob([await e.async("uint8array")], { type: mimeFor(name) }));
          n++;
        }
        if (!hasDb) throw new Error("This is not a Memora backup file");
        call("onRestored", { ok: true, files: n });
      } catch (e) { call("onRestored", { ok: false, msg: e.message }); }
    },

    // simple PIN lock for the web (fingerprint is phone-only)
    lockState: () => { const l = J(localStorage.getItem(lockKey), null); return JSON.stringify({ on: !!l, bio: false, bioAvail: false, grace: 0, needed: !!l && !window.__unlocked }); },
    setPin: (p) => { localStorage.setItem(lockKey, JSON.stringify({ h: hash(p) })); window.__unlocked = true; return true; },
    checkPin: (p) => { const l = J(localStorage.getItem(lockKey), null); const ok = !!l && l.h === hash(p); if (ok) window.__unlocked = true; return ok; },
    disableLock: () => localStorage.removeItem(lockKey),
    setBio: () => { }, setGrace: () => { }, biometric: () => call("onBio", false, ""),
  };
  function hash(s) { let h = 2166136261; for (const c of "memora:" + s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); }
  function printHtml(html) {
    const f = document.createElement("iframe"); f.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0";
    document.body.appendChild(f);
    f.onload = () => { setTimeout(() => { try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { } setTimeout(() => f.remove(), 60000); }, 500); };
    f.srcdoc = html.replace("<head>", '<head><base href="' + location.href.replace(/[^/]*$/, "") + '">');
  }
  window.addEventListener("beforeunload", (e) => { if (REC.state !== "idle" || (window.MemoraJobs && window.MemoraJobs.busy())) { e.preventDefault(); e.returnValue = ""; } });

  // load the jobs module and the shared app
  const load = (src) => new Promise((res, rej) => { const s = document.createElement("script"); s.src = src; s.onload = res; s.onerror = rej; document.body.appendChild(s); });
  await load("prompts.js");
  await load("jobs.js");
  await load("app.js");
})();
