/* Archive Notes — シングルページの学習サイト（ビルド不要） */
(function () {
  "use strict";

  const BRANDS = window.BRANDS || [];
  const DESIGNERS = window.DESIGNERS || {};
  const GLOSSARY = window.GLOSSARY || [];
  const NOW = new Date().getFullYear();
  const app = document.getElementById("app");

  // ---------- utilities ----------
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = Object.fromEntries(BRANDS.map((b) => [b.id, b]));
  const dName = (k) => (DESIGNERS[k] ? DESIGNERS[k].ja : k);
  const dEn = (k) => (DESIGNERS[k] ? DESIGNERS[k].en : "");
  const yrs = (t) => `${t.from}–${t.to == null ? "現在" : t.to}`;
  const endYear = (t) => (t.to == null ? NOW : t.to);
  const hue = (key) => { let h = 0; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; };
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const originLabel = (o) => (o === "domestic" ? "国内" : "海外");

  // デザイナー → 在任リスト（全ブランド横断）
  const careers = {};
  BRANDS.forEach((b) => (b.designers || []).forEach((t) => {
    (careers[t.d] = careers[t.d] || []).push({ ...t, brand: b });
  }));
  Object.values(careers).forEach((list) => list.sort((a, b) => a.from - b.from));

  // ---------- storage (失敗しても動くように) ----------
  const KEY = "archive-notes-v1";
  let store = { learned: {}, notes: {}, quizBest: 0 };
  try { store = Object.assign(store, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { /* ignore */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignore */ } };
  const ui = { origin: "all", tag: "", q: "", hideLearned: false, tlOrigin: "all", tlFrom: 1980 };

  // ---------- router ----------
  const routes = {
    "": renderHome,
    brands: renderBrands,
    brand: renderBrand,
    designers: renderDesigners,
    designer: renderDesigner,
    timeline: renderTimeline,
    quiz: renderQuiz,
    glossary: renderGlossary
  };
  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
    const view = routes[parts[0]] || renderHome;
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const n = a.dataset.nav;
      a.classList.toggle("active", parts[0] === n || parts[0] === n.replace(/s$/, ""));
    });
    document.querySelector(".nav").classList.remove("open");
    view(parts[1]);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  document.querySelector(".nav-toggle").addEventListener("click", (e) => {
    const nav = document.querySelector(".nav");
    nav.classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", nav.classList.contains("open"));
  });

  // ---------- views ----------
  function renderHome() {
    const learned = BRANDS.filter((b) => store.learned[b.id]).length;
    const pct = BRANDS.length ? Math.round((learned / BRANDS.length) * 100) : 0;
    const dom = BRANDS.filter((b) => b.origin === "domestic").length;
    const featured = pick(BRANDS);
    const nextUp = BRANDS.filter((b) => !store.learned[b.id]).slice(0, 3);
    document.title = "Archive Notes";
    app.innerHTML = `
      <section class="hero">
        <p class="eyebrow">Designer &amp; Archive Study Notes</p>
        <h1>服の向こうにいる、<br>デザイナーを知る。</h1>
        <p class="lead">古着屋で手に取った一着が「誰の」「いつの」服なのか。ブランドの歴史、デザイナーの移り変わり、代表的なアイテムを、国内・海外ブランド横断で学ぶためのノートです。</p>
      </section>
      <div class="stats">
        <div class="stat"><b>${BRANDS.length}</b><span>ブランド（国内 ${dom} / 海外 ${BRANDS.length - dom}）</span></div>
        <div class="stat"><b>${Object.keys(careers).length}</b><span>デザイナー</span></div>
        <div class="stat"><b>${learned}<small class="muted" style="font-size:14px"> / ${BRANDS.length}</small></b><span>学習済み</span><div class="progress"><i style="width:${pct}%"></i></div></div>
        <div class="stat"><b>${store.quizBest || 0}<small class="muted" style="font-size:14px"> / 10</small></b><span>クイズ最高点</span></div>
      </div>

      <h2>学び方</h2>
      <div class="cards-3">
        <a class="link-card" href="#/brands"><h3>1. ブランドを読む</h3><p>歴史・デザイナー・代表アイテム・古着で見るポイント。読み終えたら「学習済み」に。</p></a>
        <a class="link-card" href="#/timeline"><h3>2. 変遷年表で俯瞰する</h3><p>誰がいつどこにいたか。同じデザイナーは同じ色で表示されるので移籍が一目でわかる。</p></a>
        <a class="link-card" href="#/quiz"><h3>3. クイズで定着させる</h3><p>データから毎回ランダムに10問。デザイナー、年代、アイテムを問う。</p></a>
      </div>

      ${featured ? `<h2>今日の一冊</h2>
      <a class="link-card" href="#/brand/${featured.id}">
        <p class="eyebrow">${originLabel(featured.origin)} · ${esc(featured.country)} · ${featured.founded}</p>
        <h3 style="font-size:22px">${esc(featured.name)}</h3>
        <p>${esc(featured.summary)}</p>
      </a>` : ""}

      ${nextUp.length ? `<h2>次に読む</h2><div class="grid">${nextUp.map(brandCard).join("")}</div>` : ""}
    `;
  }

  function brandCard(b) {
    const cur = (b.designers || []).filter((t) => t.to == null).map((t) => dName(t.d));
    return `<a class="brand-card ${store.learned[b.id] ? "learned" : ""}" href="#/brand/${b.id}">
      <h3>${esc(b.name)}</h3>
      <span class="ja">${esc(b.ja)}</span>
      <div class="meta">
        <span class="tag ${b.origin === "domestic" ? "origin-domestic" : ""}">${originLabel(b.origin)}</span>
        ${esc(b.country)} · ${b.founded}年
        ${cur.length ? `<br>現在: ${esc(cur.join(" / "))}` : ""}
      </div>
    </a>`;
  }

  function renderBrands() {
    document.title = "ブランド — Archive Notes";
    const tags = [...new Set(BRANDS.flatMap((b) => b.tags || []))].sort((a, b) => a.localeCompare(b, "ja"));
    app.innerHTML = `
      <p class="eyebrow">Brands</p>
      <h1>ブランド</h1>
      <div class="toolbar">
        <input type="search" id="q" placeholder="ブランド名・デザイナー名・アイテムで検索" value="${esc(ui.q)}">
        <div class="seg" id="origin">
          ${[["all", "すべて"], ["domestic", "国内"], ["import", "海外"]].map(([v, l]) => `<button data-v="${v}" class="${ui.origin === v ? "on" : ""}">${l}</button>`).join("")}
        </div>
        <select id="tag" aria-label="タグ">
          <option value="">タグ: すべて</option>
          ${tags.map((t) => `<option ${ui.tag === t ? "selected" : ""}>${esc(t)}</option>`).join("")}
        </select>
        <label class="check"><input type="checkbox" id="hide" ${ui.hideLearned ? "checked" : ""}> 学習済みを隠す</label>
      </div>
      <p class="muted small" id="count"></p>
      <div class="grid" id="list"></div>
    `;
    const draw = () => {
      const q = ui.q.trim().toLowerCase();
      const list = BRANDS.filter((b) => {
        if (ui.origin !== "all" && b.origin !== ui.origin) return false;
        if (ui.tag && !(b.tags || []).includes(ui.tag)) return false;
        if (ui.hideLearned && store.learned[b.id]) return false;
        if (!q) return true;
        const hay = [b.name, b.ja, b.country, b.summary, ...(b.tags || []),
          ...(b.designers || []).flatMap((t) => [dName(t.d), dEn(t.d)]),
          ...(b.items || []).map((i) => i.name)].join(" ").toLowerCase();
        return hay.includes(q);
      });
      document.getElementById("count").textContent = `${list.length} 件`;
      document.getElementById("list").innerHTML = list.length ? list.map(brandCard).join("") : `<p class="empty">該当するブランドがありません。</p>`;
    };
    document.getElementById("q").addEventListener("input", (e) => { ui.q = e.target.value; draw(); });
    document.getElementById("origin").addEventListener("click", (e) => {
      const v = e.target.dataset && e.target.dataset.v; if (!v) return;
      ui.origin = v;
      e.currentTarget.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.v === v));
      draw();
    });
    document.getElementById("tag").addEventListener("change", (e) => { ui.tag = e.target.value; draw(); });
    document.getElementById("hide").addEventListener("change", (e) => { ui.hideLearned = e.target.checked; draw(); });
    draw();
  }

  function miniBar(b) {
    const ts = b.designers || [];
    if (!ts.length) return "";
    const start = Math.min(...ts.map((t) => t.from));
    const end = NOW + 1;
    const span = end - start;
    // ロール（メンズ/ウィメンズ等）が重なる場合は段を分ける
    const lanes = [];
    ts.forEach((t) => {
      let lane = lanes.findIndex((l) => l.every((o) => endYear(o) <= t.from || o.from >= endYear(t)));
      if (lane < 0) { lanes.push([]); lane = lanes.length - 1; }
      lanes[lane].push(t);
    });
    return `<div class="minibar" style="height:${lanes.length * 26 + 4}px">
      ${lanes.map((l, li) => l.map((t) => {
        const left = ((t.from - start) / span) * 100;
        const width = Math.max(((endYear(t) - t.from + (t.to == null ? 1 : 0)) / span) * 100, 1.2);
        return `<span class="seg-bar" title="${esc(dName(t.d))} ${yrs(t)} ${esc(t.role)}" style="--h:${hue(t.d)};left:${left}%;width:${width}%;top:${li * 26 + 3}px;bottom:auto;height:22px">${esc(dName(t.d))}</span>`;
      }).join("")).join("")}
    </div>
    <div class="minibar-axis"><span>${start}</span><span>${Math.round((start + end) / 2)}</span><span>${NOW}</span></div>`;
  }

  function renderBrand(id) {
    const b = byId[id];
    if (!b) { app.innerHTML = `<p class="empty">ブランドが見つかりません。<a href="#/brands">一覧へ</a></p>`; return; }
    document.title = `${b.name} — Archive Notes`;
    const ts = (b.designers || []).slice().sort((x, y) => x.from - y.from);
    const related = (b.related || []).map((r) => byId[r]).filter(Boolean);

    app.innerHTML = `
      <a class="back" href="#/brands">← ブランド一覧</a>
      <div class="detail-head">
        <div>
          <p class="eyebrow">${originLabel(b.origin)} · ${esc(b.country)}</p>
          <h1>${esc(b.name)}</h1>
          <div class="ja">${esc(b.ja)}</div>
        </div>
        <div>${(b.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      </div>

      <dl class="facts">
        <div><dt>創業</dt><dd>${b.founded}年</dd></div>
        <div><dt>拠点</dt><dd>${esc(b.city || b.country)}</dd></div>
        <div><dt>創業者 / 初代</dt><dd>${ts[0] ? esc(dName(ts[0].d)) : "—"}</dd></div>
        <div><dt>現在のデザイン</dt><dd>${esc(ts.filter((t) => t.to == null).map((t) => dName(t.d)).join(" / ") || "—")}</dd></div>
      </dl>

      <p>${esc(b.summary)}</p>
      ${b.note ? `<p class="note">${esc(b.note)}</p>` : ""}

      <h2>デザイナーの変遷</h2>
      ${miniBar(b)}
      <ol class="succession">
        ${ts.map((t) => {
          const elsewhere = (careers[t.d] || []).filter((c) => c.brand.id !== b.id);
          return `<li>
            <div class="yrs">${yrs(t)}</div>
            <div>
              <div class="who"><a href="#/designer/${encodeURIComponent(t.d)}">${esc(dName(t.d))}</a> <span class="muted small">${esc(dEn(t.d))}</span></div>
              <div class="role">${esc(t.role)}</div>
              ${elsewhere.length ? `<div class="also">他のブランド: ${elsewhere.map((c) => `<a href="#/brand/${c.brand.id}">${esc(c.brand.name)}</a>（${yrs(c)}）`).join("、")}</div>` : ""}
            </div>
          </li>`;
        }).join("")}
      </ol>

      <h2>歴史</h2>
      <ul class="history">
        ${(b.history || []).map((h) => `<li><span class="y">${h.year}</span>${esc(h.text)}</li>`).join("")}
      </ul>

      <h2>代表的なアイテム</h2>
      <div class="items">
        ${(b.items || []).map((i) => `<div class="item"><div class="yr">${esc(i.year || "")}</div><h3>${esc(i.name)}</h3><p>${esc(i.desc || "")}</p></div>`).join("")}
      </div>

      ${(b.archive || []).length ? `<h2>古着・アーカイブで見るポイント</h2><ul class="tips">${b.archive.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}

      ${related.length ? `<h2>関連ブランド</h2><div class="grid">${related.map(brandCard).join("")}</div>` : ""}

      <section class="study">
        <div class="row">
          <h3>自分のメモ</h3>
          <label class="check"><input type="checkbox" id="learned" ${store.learned[b.id] ? "checked" : ""}> 学習済みにする</label>
        </div>
        <textarea id="note" placeholder="古着屋で見た個体、相場、タグの特徴、気になったシーズンなど">${esc(store.notes[b.id] || "")}</textarea>
        <span class="saved" id="saved">保存しました</span>
      </section>
    `;
    document.getElementById("learned").addEventListener("change", (e) => {
      if (e.target.checked) store.learned[b.id] = true; else delete store.learned[b.id];
      save();
    });
    let timer;
    document.getElementById("note").addEventListener("input", (e) => {
      store.notes[b.id] = e.target.value;
      clearTimeout(timer);
      timer = setTimeout(() => {
        save();
        const s = document.getElementById("saved");
        if (s) { s.classList.add("show"); setTimeout(() => s.classList.remove("show"), 1200); }
      }, 400);
    });
  }

  function renderDesigners() {
    document.title = "デザイナー — Archive Notes";
    const keys = Object.keys(careers).sort((a, b) => careers[b].length - careers[a].length || dName(a).localeCompare(dName(b), "ja"));
    app.innerHTML = `
      <p class="eyebrow">Designers</p>
      <h1>デザイナー</h1>
      <p class="lead">複数のブランドを渡り歩いたデザイナーほど上に表示されます。デザイナーを軸に見ると、ブランドの「つながり」が見えてきます。</p>
      <div class="toolbar"><input type="search" id="dq" placeholder="名前で検索（日本語・英語）"></div>
      <div class="dlist" id="dlist"></div>
    `;
    const draw = (q) => {
      q = (q || "").toLowerCase();
      const list = keys.filter((k) => !q || (dName(k) + " " + dEn(k)).toLowerCase().includes(q));
      document.getElementById("dlist").innerHTML = list.map((k) => {
        const bs = [...new Set(careers[k].map((c) => c.brand.name))];
        return `<a class="dcard" href="#/designer/${encodeURIComponent(k)}">
          ${bs.length > 1 ? `<span class="count">${bs.length}ブランド</span>` : ""}
          <strong>${esc(dName(k))}</strong>
          <div class="en">${esc(dEn(k))}</div>
          <div class="brands">${esc(bs.join(" → "))}</div>
        </a>`;
      }).join("") || `<p class="empty">該当なし</p>`;
    };
    document.getElementById("dq").addEventListener("input", (e) => draw(e.target.value));
    draw("");
  }

  function renderDesigner(key) {
    const d = DESIGNERS[key];
    const list = careers[key];
    if (!d || !list) { app.innerHTML = `<p class="empty">デザイナーが見つかりません。<a href="#/designers">一覧へ</a></p>`; return; }
    document.title = `${d.ja} — Archive Notes`;
    const start = Math.min(...list.map((c) => c.from));
    const end = NOW + 1;
    const span = Math.max(end - start, 1);
    app.innerHTML = `
      <a class="back" href="#/designers">← デザイナー一覧</a>
      <p class="eyebrow" style="margin-top:8px">Designer</p>
      <h1>${esc(d.ja)}</h1>
      <div class="muted">${esc(d.en)}</div>
      ${d.bio ? `<p>${esc(d.bio)}</p>` : ""}

      <h2>キャリア</h2>
      <div class="minibar" style="height:${list.length * 26 + 4}px">
        ${list.map((c, i) => {
          const left = ((c.from - start) / span) * 100;
          const width = Math.max(((endYear(c) - c.from + (c.to == null ? 1 : 0)) / span) * 100, 1.5);
          return `<span class="seg-bar" style="--h:${hue(c.brand.id)};left:${left}%;width:${width}%;top:${i * 26 + 3}px;bottom:auto;height:22px">${esc(c.brand.name)}</span>`;
        }).join("")}
      </div>
      <div class="minibar-axis"><span>${start}</span><span>${NOW}</span></div>

      <ol class="succession" style="margin-top:16px">
        ${list.map((c) => {
          const bt = (c.brand.designers || []).slice().sort((x, y) => x.from - y.from);
          const sameRole = (t) => t.role.replace(/（.*?）/g, "") === c.role.replace(/（.*?）/g, "");
          const idx = bt.indexOf(bt.find((t) => t.d === c.d && t.from === c.from));
          const prev = bt.slice(0, idx).reverse().find((t) => t.d !== c.d && sameRole(t));
          const next = bt.slice(idx + 1).find((t) => t.d !== c.d && sameRole(t));
          return `<li>
            <div class="yrs">${yrs(c)}</div>
            <div>
              <div class="who"><a href="#/brand/${c.brand.id}">${esc(c.brand.name)}</a></div>
              <div class="role">${esc(c.role)}</div>
              <div class="also">${prev ? `前任: <a href="#/designer/${encodeURIComponent(prev.d)}">${esc(dName(prev.d))}</a>` : ""}${prev && next ? " ／ " : ""}${next ? `後任: <a href="#/designer/${encodeURIComponent(next.d)}">${esc(dName(next.d))}</a>` : ""}</div>
            </div>
          </li>`;
        }).join("")}
      </ol>
    `;
  }

  function renderTimeline() {
    document.title = "変遷年表 — Archive Notes";
    app.innerHTML = `
      <p class="eyebrow">Timeline</p>
      <h1>デザイナー変遷年表</h1>
      <p class="lead">各ブランドのデザイナー在任期間を並べた年表です。同じデザイナーは同じ色。バーにカーソルを乗せると、そのデザイナーの他ブランドでの在任も強調されます。</p>
      <div class="toolbar">
        <div class="seg" id="tlo">${[["all", "すべて"], ["domestic", "国内"], ["import", "海外"]].map(([v, l]) => `<button data-v="${v}" class="${ui.tlOrigin === v ? "on" : ""}">${l}</button>`).join("")}</div>
        <div class="seg" id="tlf">${[[1940, "1940〜"], [1980, "1980〜"], [2000, "2000〜"]].map(([v, l]) => `<button data-v="${v}" class="${ui.tlFrom === v ? "on" : ""}">${l}</button>`).join("")}</div>
      </div>
      <div class="tl-wrap"><div class="tl" id="tl"></div></div>
      <p class="legend">横にスクロールできます。名前をクリックするとブランドページへ移動します。</p>
    `;
    const draw = () => {
      const from = ui.tlFrom, to = NOW + 1, span = to - from;
      const rows = BRANDS.filter((b) => ui.tlOrigin === "all" || b.origin === ui.tlOrigin)
        .map((b) => ({ b, ts: (b.designers || []).filter((t) => endYear(t) >= from) }))
        .filter((r) => r.ts.length)
        .sort((x, y) => Math.min(...x.ts.map((t) => t.from)) - Math.min(...y.ts.map((t) => t.from)));
      const step = span > 60 ? 10 : 5;
      const ticks = [];
      for (let y = Math.ceil(from / step) * step; y < to; y += step) ticks.push(y);
      const pos = (y) => ((Math.max(y, from) - from) / span) * 100;
      document.getElementById("tl").innerHTML = `
        <div class="tl-axis"><div class="tl-name"></div><div class="tl-track">${ticks.map((y) => `<span class="tl-tick" style="left:${pos(y)}%">${y}</span>`).join("")}</div></div>
        ${rows.map(({ b, ts }) => {
          const lanes = [];
          ts.forEach((t) => {
            let lane = lanes.findIndex((l) => l.every((o) => endYear(o) <= t.from || o.from >= endYear(t)));
            if (lane < 0) { lanes.push([]); lane = lanes.length - 1; }
            lanes[lane].push(t);
          });
          const h = lanes.length * 26 + 8;
          return `<div class="tl-row" style="min-height:${h}px">
            <div class="tl-name"><a href="#/brand/${b.id}">${esc(b.name)}</a></div>
            <div class="tl-track">
              ${ticks.map((y) => `<span class="tl-grid" style="left:${pos(y)}%"></span>`).join("")}
              ${lanes.map((l, li) => l.map((t) => {
                const left = pos(t.from);
                const width = Math.max(pos(endYear(t) + (t.to == null ? 1 : 0)) - left, 0.8);
                return `<a class="tl-bar" data-d="${esc(t.d)}" href="#/designer/${encodeURIComponent(t.d)}" title="${esc(dName(t.d))}（${yrs(t)}）${esc(t.role)}" style="--h:${hue(t.d)};left:${left}%;width:${width}%;top:${li * 26 + 4}px">${esc(dName(t.d))}</a>`;
              }).join("")).join("")}
            </div>
          </div>`;
        }).join("")}
      `;
    };
    const tl = document.getElementById("tl");
    tl.addEventListener("mouseover", (e) => {
      const bar = e.target.closest(".tl-bar"); if (!bar) return;
      tl.querySelectorAll(`.tl-bar[data-d="${CSS.escape(bar.dataset.d)}"]`).forEach((x) => x.classList.add("hl"));
    });
    tl.addEventListener("mouseout", () => tl.querySelectorAll(".tl-bar.hl").forEach((x) => x.classList.remove("hl")));
    const bindSeg = (id, setter) => document.getElementById(id).addEventListener("click", (e) => {
      const v = e.target.dataset && e.target.dataset.v; if (!v) return;
      setter(v);
      e.currentTarget.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.v === v));
      draw();
    });
    bindSeg("tlo", (v) => (ui.tlOrigin = v));
    bindSeg("tlf", (v) => (ui.tlFrom = Number(v)));
    draw();
  }

  // ---------- quiz ----------
  function makeQuestion() {
    const allTenures = BRANDS.flatMap((b) => (b.designers || []).map((t) => ({ ...t, brand: b })));
    const designerKeys = Object.keys(careers);
    const types = ["tenure", "tenure", "career", "item", "founded", "origin"];
    for (let attempt = 0; attempt < 30; attempt++) {
      const type = pick(types);
      if (type === "tenure") {
        const t = pick(allTenures);
        const pool = shuffle(designerKeys.filter((k) => k !== t.d && !(t.brand.designers || []).some((x) => x.d === k && x.from <= t.from && endYear(x) >= endYear(t))));
        // 同じブランドの他デザイナーを優先的に混ぜると難しくなる
        const sameBrand = shuffle((t.brand.designers || []).map((x) => x.d).filter((k) => k !== t.d));
        const distract = [...new Set([...sameBrand, ...pool])].filter((k) => k !== t.d).slice(0, 3);
        if (distract.length < 3) continue;
        return {
          q: `${t.brand.name} で ${yrs(t)} に「${t.role}」を務めたのは？`,
          opts: shuffle([t.d, ...distract]).map((k) => ({ label: dName(k), ok: k === t.d })),
          explain: `${dName(t.d)}（${dEn(t.d)}）。`,
          link: `#/brand/${t.brand.id}`
        };
      }
      if (type === "career") {
        const k = pick(designerKeys.filter((x) => new Set(careers[x].map((c) => c.brand.id)).size >= 2));
        if (!k) continue;
        const mine = new Set(careers[k].map((c) => c.brand.id));
        const ans = pick(careers[k]);
        const distract = shuffle(BRANDS.filter((b) => !mine.has(b.id))).slice(0, 3);
        return {
          q: `${dName(k)} がデザインに関わったことのあるブランドは？`,
          opts: shuffle([ans.brand, ...distract]).map((b) => ({ label: b.name, ok: b.id === ans.brand.id })),
          explain: `${dName(k)} の経歴: ${careers[k].map((c) => `${c.brand.name}（${yrs(c)}）`).join(" → ")}`,
          link: `#/designer/${encodeURIComponent(k)}`
        };
      }
      if (type === "item") {
        const b = pick(BRANDS.filter((x) => (x.items || []).length));
        const it = pick(b.items);
        const distract = shuffle(BRANDS.filter((x) => x.id !== b.id)).slice(0, 3);
        return {
          q: `代表的なアイテム「${it.name}」はどのブランド？`,
          opts: shuffle([b, ...distract]).map((x) => ({ label: x.name, ok: x.id === b.id })),
          explain: `${b.name}。${it.desc || ""}`,
          link: `#/brand/${b.id}`
        };
      }
      if (type === "founded") {
        const b = pick(BRANDS);
        const set = new Set([b.founded]);
        const deltas = shuffle([-12, -7, -4, -2, 3, 5, 9, 14]);
        for (const d of deltas) { if (set.size >= 4) break; set.add(b.founded + d); }
        return {
          q: `${b.name} の創業（設立）年は？`,
          opts: shuffle([...set]).map((y) => ({ label: `${y}年`, ok: y === b.founded })),
          explain: `${b.founded}年。${(b.history || [])[0] ? b.history[0].text : ""}`,
          link: `#/brand/${b.id}`
        };
      }
      if (type === "origin") {
        const b = pick(BRANDS);
        const founder = (b.designers || []).slice().sort((x, y) => x.from - y.from)[0];
        if (!founder || founder.from !== b.founded) continue;
        const distract = shuffle(designerKeys.filter((k) => k !== founder.d)).slice(0, 3);
        return {
          q: `${b.name} を始めた（${b.founded}年）のは？`,
          opts: shuffle([founder.d, ...distract]).map((k) => ({ label: dName(k), ok: k === founder.d })),
          explain: `${dName(founder.d)}（${dEn(founder.d)}）。`,
          link: `#/brand/${b.id}`
        };
      }
    }
    return null;
  }

  function renderQuiz() {
    document.title = "クイズ — Archive Notes";
    const TOTAL = 10;
    let n = 0, score = 0, current = null;
    const seen = new Set();
    app.innerHTML = `
      <div class="quiz">
        <p class="eyebrow">Quiz</p>
        <h1>クイズ</h1>
        <p class="lead">データから毎回ランダムに${TOTAL}問出題されます。最高点: <b id="best">${store.quizBest || 0}</b> / ${TOTAL}</p>
        <div id="qbox"></div>
      </div>`;
    const box = document.getElementById("qbox");
    const next = () => {
      if (n >= TOTAL) {
        if (score > (store.quizBest || 0)) { store.quizBest = score; save(); }
        box.innerHTML = `<div class="quiz-card">
          <p class="eyebrow">結果</p>
          <div class="quiz-q">${score} / ${TOTAL} 問正解</div>
          <p class="muted">${score >= 9 ? "素晴らしい。年表を見ながら細部まで覚えましょう。" : score >= 6 ? "いい調子。間違えたブランドのページを読み直しましょう。" : "まずはブランドページと変遷年表を一通り読んでみましょう。"}</p>
          <div class="quiz-foot"><a class="btn ghost" href="#/timeline">年表を見る</a><button class="btn" id="again">もう一度</button></div>
        </div>`;
        document.getElementById("again").addEventListener("click", renderQuiz);
        return;
      }
      let q;
      for (let i = 0; i < 20; i++) { q = makeQuestion(); if (q && !seen.has(q.q)) break; }
      if (!q) { box.innerHTML = `<p class="empty">問題を作れませんでした。データを増やしてください。</p>`; return; }
      seen.add(q.q);
      current = q; n++;
      box.innerHTML = `<div class="quiz-card">
        <p class="eyebrow">Q${n} / ${TOTAL} ・ 正解 ${score}</p>
        <div class="quiz-q">${esc(q.q)}</div>
        <div class="opts">${q.opts.map((o, i) => `<button class="opt" data-i="${i}">${esc(o.label)}</button>`).join("")}</div>
        <div id="after"></div>
      </div>`;
      box.querySelector(".opts").addEventListener("click", (e) => {
        const btn = e.target.closest(".opt"); if (!btn || btn.disabled) return;
        const chosen = current.opts[Number(btn.dataset.i)];
        if (chosen.ok) score++;
        box.querySelectorAll(".opt").forEach((b, i) => {
          b.disabled = true;
          if (current.opts[i].ok) b.classList.add("correct");
          else if (b === btn) b.classList.add("wrong");
        });
        document.getElementById("after").innerHTML = `
          <p class="explain">${chosen.ok ? "正解！" : "不正解。"} ${esc(current.explain)} <a href="${current.link}">詳しく見る →</a></p>
          <div class="quiz-foot"><span class="muted small">正解 ${score} / ${n}</span><button class="btn" id="nextq">${n >= TOTAL ? "結果を見る" : "次へ"}</button></div>`;
        document.getElementById("nextq").addEventListener("click", next);
        document.getElementById("nextq").focus();
      });
    };
    next();
  }

  function renderGlossary() {
    document.title = "用語集 — Archive Notes";
    app.innerHTML = `
      <p class="eyebrow">Glossary</p>
      <h1>用語集</h1>
      <p class="lead">アーカイブや古着を語るときによく出てくる言葉。</p>
      <div class="toolbar"><input type="search" id="gq" placeholder="用語を検索"></div>
      <dl class="gloss" id="gl"></dl>`;
    const draw = (q) => {
      q = (q || "").toLowerCase();
      document.getElementById("gl").innerHTML = GLOSSARY
        .filter((g) => !q || (g.term + g.reading + g.desc).toLowerCase().includes(q))
        .map((g) => `<dt>${esc(g.term)}${g.reading ? `<small>${esc(g.reading)}</small>` : ""}</dt><dd>${esc(g.desc)}</dd>`).join("") || `<p class="empty">該当なし</p>`;
    };
    document.getElementById("gq").addEventListener("input", (e) => draw(e.target.value));
    draw("");
  }

  route();
})();
