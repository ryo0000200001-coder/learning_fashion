/*
 * データ層：data/*.js の内容を読み込み、編集内容をブラウザに下書きとして保存し、
 * GitHub の API でリポジトリにコミットする。
 * window.AN として app.js / editor.js から使う。
 */
(function () {
  "use strict";

  const DRAFT_KEY = "archive-notes-draft-v1";
  const GH_KEY = "archive-notes-github-v1";
  const DEFAULT_REPO = { owner: "ryo0000200001-coder", repo: "learning_fashion" };
  const DEFAULT_BRANCH = "main"; // GitHub Pages で公開しているブランチ
  const HEADER = "// このファイルはサイトの「編集」画面からも書き換えられます。手で編集する場合は JSON の形を崩さないでください（README 参照）。\n";
  const FILES = {
    brands:    { path: "data/brands.js",    name: "BRANDS",    label: "ブランド" },
    designers: { path: "data/designers.js", name: "DESIGNERS", label: "デザイナー" },
    glossary:  { path: "data/glossary.js",  name: "GLOSSARY",  label: "用語集" }
  };
  const KINDS = Object.keys(FILES);

  const clone = (x) => JSON.parse(JSON.stringify(x));
  const hash = (s) => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0; return h.toString(36) + ":" + s.length; };
  const ls = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } }
  };

  // ファイルから読み込まれたデータ（公開中の内容）
  const served = { brands: window.BRANDS || [], designers: window.DESIGNERS || {}, glossary: window.GLOSSARY || [] };
  const servedStr = {};
  KINDS.forEach((k) => (servedStr[k] = JSON.stringify(served[k])));

  // 下書き: { data, base: {kind: hash}, pushed: {kind: hash}, log: [], updatedAt }
  let draft = ls.get(DRAFT_KEY);
  if (draft && draft.data) {
    // 公開中の内容が下書きと同じになっていたら（GitHub に保存→反映済み）、下書きは不要
    if (KINDS.every((k) => JSON.stringify(draft.data[k]) === servedStr[k])) { ls.del(DRAFT_KEY); draft = null; }
  } else draft = null;

  const data = draft ? clone(draft.data) : clone(served);

  function status(kind) {
    const s = JSON.stringify(data[kind]);
    if (s === servedStr[kind]) return "clean";
    if (draft && draft.pushed && draft.pushed[kind] === hash(s)) return "pushed";
    return "dirty";
  }

  function commitLocal(message) {
    if (!draft) {
      draft = { base: {}, pushed: {}, log: [] };
      KINDS.forEach((k) => (draft.base[k] = hash(servedStr[k])));
    }
    draft.data = data;
    draft.updatedAt = new Date().toISOString();
    if (message) draft.log.unshift({ at: draft.updatedAt, message, pushed: false });
    draft.log = draft.log.slice(0, 50);
    const ok = ls.set(DRAFT_KEY, draft);
    if (KINDS.every((k) => status(k) === "clean")) { ls.del(DRAFT_KEY); draft = null; }
    return ok;
  }

  function discard() {
    ls.del(DRAFT_KEY);
    draft = null;
    KINDS.forEach((k) => { data[k] = clone(served[k]); });
  }

  function serialize(kind) {
    const f = FILES[kind];
    return HEADER + "window." + f.name + " = " + JSON.stringify(data[kind], null, 2) + ";\n";
  }

  function parseFile(text) {
    const i = text.indexOf("=");
    const body = text.slice(i + 1).trim().replace(/;\s*$/, "");
    return JSON.parse(body);
  }

  // ---------- GitHub ----------
  function detectRepo() {
    const h = location.hostname;
    if (/\.github\.io$/.test(h)) {
      const owner = h.replace(/\.github\.io$/, "");
      const seg = location.pathname.split("/").filter(Boolean)[0];
      return { owner, repo: seg && !/\.html$/.test(seg) ? seg : owner + ".github.io" };
    }
    return DEFAULT_REPO;
  }
  function getSettings() {
    const s = ls.get(GH_KEY) || {};
    const d = detectRepo();
    return { owner: s.owner || d.owner, repo: s.repo || d.repo, branch: s.branch || DEFAULT_BRANCH, token: s.token || "" };
  }
  function setSettings(s) { return ls.set(GH_KEY, s); }

  const b64encode = (str) => {
    const bytes = new TextEncoder().encode(str);
    let bin = "";
    for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
    return btoa(bin);
  };
  const b64decode = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g, "")), (c) => c.charCodeAt(0)));

  async function gh(path, opts) {
    const s = getSettings();
    if (!s.token) throw new Error("GitHub のトークンが設定されていません（「設定」から登録してください）");
    const res = await fetch("https://api.github.com" + path, Object.assign({}, opts, {
      headers: Object.assign({ Authorization: "Bearer " + s.token, Accept: "application/vnd.github+json" }, (opts && opts.headers) || {})
    }));
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = body && body.message ? body.message : res.statusText;
      const e = new Error(`GitHub API エラー (${res.status}): ${msg}`);
      e.status = res.status;
      throw e;
    }
    return body;
  }

  async function testConnection() {
    const s = getSettings();
    const repo = await gh(`/repos/${s.owner}/${s.repo}`);
    return { defaultBranch: repo.default_branch, canPush: !!(repo.permissions && repo.permissions.push), fullName: repo.full_name };
  }

  async function resolveBranch() {
    const s = getSettings();
    if (s.branch) return s.branch;
    const repo = await gh(`/repos/${s.owner}/${s.repo}`);
    return repo.default_branch;
  }

  // 変更のあるファイルを GitHub にコミットする。confirmOverwrite(kind) が false を返したら中止。
  async function saveToGitHub(message, onProgress, confirmOverwrite) {
    const s = getSettings();
    const branch = await resolveBranch();
    const changed = KINDS.filter((k) => status(k) === "dirty");
    if (!changed.length) return { committed: [], branch };
    const committed = [];
    for (const kind of changed) {
      const f = FILES[kind];
      const url = `/repos/${s.owner}/${s.repo}/contents/${f.path}`;
      onProgress && onProgress(`${f.label}（${f.path}）を確認中…`);
      const cur = await gh(`${url}?ref=${encodeURIComponent(branch)}`);
      const remoteText = b64decode(cur.content || "");
      let remoteHash = null;
      try { remoteHash = hash(JSON.stringify(parseFile(remoteText))); } catch (e) { /* 形式が違う */ }
      const newStr = JSON.stringify(data[kind]);
      if (remoteHash === hash(newStr)) { committed.push(kind); continue; }
      const known = draft && [draft.base && draft.base[kind], draft.pushed && draft.pushed[kind]];
      if (remoteHash && known && !known.includes(remoteHash)) {
        if (confirmOverwrite && !confirmOverwrite(kind)) throw new Error("保存を中止しました");
      }
      onProgress && onProgress(`${f.label}（${f.path}）を保存中…`);
      await gh(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `${message}（${f.label}）`, content: b64encode(serialize(kind)), sha: cur.sha, branch })
      });
      committed.push(kind);
      if (!draft) commitLocal();
      draft.pushed = draft.pushed || {};
      draft.pushed[kind] = hash(newStr);
    }
    if (draft) {
      draft.log.forEach((l) => (l.pushed = true));
      ls.set(DRAFT_KEY, draft);
    }
    return { committed, branch };
  }

  window.AN = {
    data, FILES, KINDS, served,
    status, commitLocal, discard, serialize,
    hasDraft: () => !!draft,
    draftLog: () => (draft ? draft.log : []),
    getSettings, setSettings, testConnection, saveToGitHub
  };
})();
