/* Archive Notes — シングルページの学習サイト（ビルド不要） */
(function () {
  "use strict";

  const AN = window.AN;
  let BRANDS, DESIGNERS, GLOSSARY, byId, careers;
  const NOW = new Date().getFullYear();
  const app = document.getElementById("app");

  // ---------- utilities ----------
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const dName = (k) => (DESIGNERS[k] ? DESIGNERS[k].ja : k);
  const dEn = (k) => (DESIGNERS[k] ? DESIGNERS[k].en : "");
  const yrs = (t) => `${t.from}–${t.to == null ? "現在" : t.to}`;
  const endYear = (t) => (t.to == null ? NOW : t.to);
  const hue = (key) => { let h = 0; for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % 360; return h; };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const originLabel = (o) => (o === "domestic" ? "国内" : "海外");

  // データを読み直して索引を作る（編集のたびに呼ぶ）
  function reindex() {
    BRANDS = AN.data.brands;
    DESIGNERS = AN.data.designers;
    GLOSSARY = AN.data.glossary;
    byId = Object.fromEntries(BRANDS.map((b) => [b.id, b]));
    // デザイナー → 在任リスト（全ブランド横断）
    careers = {};
    BRANDS.forEach((b) => (b.designers || []).forEach((t) => {
      (careers[t.d] = careers[t.d] || []).push({ ...t, brand: b });
    }));
    Object.values(careers).forEach((list) => list.sort((a, b) => a.from - b.from));
  }
  reindex();

  // ---------- storage (失敗しても動くように) ----------
  const KEY = "archive-notes-v1";
  let store = { learned: {}, notes: {} };
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
    seasons: renderSeasons,
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
    renderDraftBar();
    view(parts[1], parts[2]);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  // 未保存の変更があるときに画面上部へ出す帯
  function renderDraftBar() {
    const bar = document.getElementById("draftbar");
    if (!bar) return;
    const dirty = AN.KINDS.filter((k) => AN.status(k) === "dirty");
    const pushed = AN.KINDS.filter((k) => AN.status(k) === "pushed");
    if (dirty.length) {
      bar.innerHTML = `<div class="wrap">このブラウザに<b>GitHubへ未保存の変更</b>があります（${dirty.map((k) => AN.FILES[k].label).join("・")}）。<a href="#/edit">編集画面で保存する →</a></div>`;
      bar.hidden = false;
    } else if (pushed.length) {
      bar.innerHTML = `<div class="wrap">GitHubに保存済みです。公開サイトへの反映には少し時間がかかります（反映されるまでこのブラウザでは保存した内容を表示しています）。</div>`;
      bar.hidden = false;
    } else bar.hidden = true;
  }
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
        <div class="stat"><b>${BRANDS.reduce((n, b) => n + (b.collections || []).length, 0)}</b><span>シーズン（コレクション）</span></div>
      </div>

      <h2>学び方</h2>
      <div class="cards-3">
        <a class="link-card" href="#/brands"><h3>1. ブランドを読む</h3><p>歴史・デザイナー・代表アイテム・古着で見るポイント。読み終えたら「学習済み」に。</p></a>
        <a class="link-card" href="#/timeline"><h3>2. 変遷年表で俯瞰する</h3><p>誰がいつどこにいたか。同じデザイナーは同じ色で表示されるので移籍が一目でわかる。</p></a>
        <a class="link-card" href="#/seasons"><h3>3. シーズンで引く</h3><p>タグや値札のシーズン表記から、そのコレクションのタイトルとテーマを調べる。</p></a>
        <a class="link-card" href="#/edit"><h3>4. 自分で書き足す</h3><p>ブランドの追加や知識の修正を画面から。GitHubに保存すればサイトに反映される。</p></a>
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

  // よく使われているタグ（ジャンル的に使う）
  function topTags() {
    const count = {};
    BRANDS.forEach((b) => (b.tags || []).forEach((t) => (count[t] = (count[t] || 0) + 1)));
    const featured = ["アルチザン", "アントワープ", "裏原宿", "アーカイブ"];
    const rest = Object.keys(count).filter((t) => !featured.includes(t)).sort((a, b) => count[b] - count[a]).slice(0, 10);
    return featured.filter((t) => count[t]).concat(rest);
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
      <div class="chips" id="chips">${topTags().map((t) => `<button class="chip ${ui.tag === t ? "on" : ""}" data-t="${esc(t)}">${esc(t)}</button>`).join("")}</div>
      <p class="muted small" id="count"></p>
      <div class="grid" id="list"></div>
    `;
    document.getElementById("chips").addEventListener("click", (e) => {
      const t = e.target.dataset && e.target.dataset.t; if (t == null) return;
      ui.tag = ui.tag === t ? "" : t;
      document.getElementById("tag").value = ui.tag;
      e.currentTarget.querySelectorAll(".chip").forEach((c) => c.classList.toggle("on", c.dataset.t === ui.tag));
      draw();
    });
    const draw = () => {
      const q = ui.q.trim().toLowerCase();
      const list = BRANDS.filter((b) => {
        if (ui.origin !== "all" && b.origin !== ui.origin) return false;
        if (ui.tag && !(b.tags || []).includes(ui.tag)) return false;
        if (ui.hideLearned && store.learned[b.id]) return false;
        if (!q) return true;
        const hay = [b.name, b.ja, b.country, b.summary, ...(b.tags || []),
          ...(b.designers || []).flatMap((t) => [dName(t.d), dEn(t.d)]),
          ...(b.items || []).map((i) => i.name),
          ...(b.collections || []).flatMap((c) => [c.title, c.alias])].join(" ").toLowerCase();
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
    document.getElementById("tag").addEventListener("change", (e) => {
      ui.tag = e.target.value;
      document.querySelectorAll("#chips .chip").forEach((c) => c.classList.toggle("on", c.dataset.t === ui.tag));
      draw();
    });
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
        <div>${(b.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}
          <a class="btn ghost small" href="#/edit/brand/${encodeURIComponent(b.id)}">✎ 編集</a></div>
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
        ${(b.history || []).map((h) => `<li><span class="y">${esc(h.year)}</span>${esc(h.text)}${h.unverified ? ' <span class="unv">未確認</span>' : ""}</li>`).join("")}
      </ul>

      ${(b.collections || []).length ? `<h2>コレクション（シーズン）<span class="h2sub">${b.collections.length}シーズン</span></h2>
      <div class="ctable">${b.collections.map((c) => collectionRow(c, false)).join("")}</div>` : ""}

      ${(b.items || []).length ? `<h2>代表的なアイテム</h2>
      <div class="items">
        ${b.items.map((i) => `<div class="item"><div class="yr">${esc(i.year || "")}${i.unverified ? ' <span class="unv">未確認</span>' : ""}</div><h3>${esc(i.name)}</h3><p>${esc(i.desc || "")}</p></div>`).join("")}
      </div>` : ""}

      ${(b.archive || []).length ? `<h2>古着・アーカイブで見るポイント</h2><ul class="tips">${b.archive.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}

      ${(b.sources || []).length ? `<h2>出典</h2><ul class="sources">${b.sources.map((x) => `<li><a href="${esc(x.u)}" target="_blank" rel="noopener noreferrer">${esc(x.t)}</a></li>`).join("")}</ul>` : ""}

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
      <div class="muted">${esc(d.en)} <a class="btn ghost small" href="#/edit/designer/${encodeURIComponent(key)}">✎ 編集</a></div>
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

  // ---------- seasons index ----------
  function renderSeasons() {
    document.title = "シーズン索引 — Archive Notes";
    const rows = BRANDS.flatMap((b) => (b.collections || []).map((c) => ({ ...c, brand: b })));
    const brandsWith = BRANDS.filter((b) => (b.collections || []).length);
    app.innerHTML = `
      <p class="eyebrow">Seasons</p>
      <h1>シーズン索引</h1>
      <p class="lead">タグや古着屋の値札に書かれたシーズン（例: 2004-05AW、AW04、2003SS）やタイトルから、コレクションを引けます。年だけ（例: 2004）でも検索できます。</p>
      <div class="toolbar">
        <input type="search" id="sq" placeholder="年・シーズン・タイトル・通称で検索（例: 2004 / SCAB / カート期）">
        <select id="sb" aria-label="ブランド">
          <option value="">ブランド: すべて</option>
          ${brandsWith.map((b) => `<option value="${b.id}">${esc(b.name)}</option>`).join("")}
        </select>
      </div>
      <p class="muted small" id="scount"></p>
      <div id="slist"></div>`;
    const norm = (x) => String(x || "").toLowerCase().replace(/[\s\-\/]/g, "");
    const draw = () => {
      const q = norm(document.getElementById("sq").value);
      const bid = document.getElementById("sb").value;
      const list = rows.filter((r) => (!bid || r.brand.id === bid) &&
        (!q || norm([r.season, seasonAliases(r.season), r.title, r.alias, r.note, r.brand.name, r.brand.ja].join(" ")).includes(q)));
      document.getElementById("scount").textContent = `${list.length} 件`;
      document.getElementById("slist").innerHTML = list.length
        ? `<div class="ctable">${list.map((r) => collectionRow(r, true)).join("")}</div>`
        : `<p class="empty">該当するシーズンがありません。</p>`;
    };
    document.getElementById("sq").addEventListener("input", draw);
    document.getElementById("sb").addEventListener("change", draw);
    draw();
  }

  // "2004-05AW" → "AW04 FW04 04AW ...", "2003SS" → "SS03 03SS" のような別表記も検索対象にする
  function seasonAliases(season) {
    const out = [];
    String(season).replace(/(\d{4})(?:-\d{2,4})?\s*(SS|AW)/gi, (m, y, t) => {
      const yy = y.slice(2);
      t = t.toUpperCase();
      out.push(t + yy, yy + t, t + y);
      if (t === "AW") out.push("FW" + yy, yy + "FW", "FW" + y);
      return m;
    });
    return out.join(" ");
  }

  function collectionRow(c, withBrand) {
    return `<div class="crow">
      <div class="cseason">${esc(c.season)}${c.city ? `<span class="ccity">${esc(c.city)}</span>` : ""}</div>
      <div>
        ${withBrand ? `<a class="cbrand" href="#/brand/${c.brand.id}">${esc(c.brand.name)}</a>` : ""}
        <div class="ctitle">${esc(c.title)}${c.alias ? ` <span class="calias">通称「${esc(c.alias)}」</span>` : ""}${c.unverified ? ' <span class="unv">未確認</span>' : ""}</div>
        ${c.note ? `<div class="cnote">${esc(c.note)}</div>` : ""}
      </div>
    </div>`;
  }

  function renderGlossary() {
    document.title = "用語集 — Archive Notes";
    app.innerHTML = `
      <p class="eyebrow">Glossary</p>
      <h1>用語集</h1>
      <p class="lead">アーカイブや古着を語るときによく出てくる言葉。 <a class="btn ghost small" href="#/edit/glossary">✎ 用語集を編集</a></p>
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

  // editor.js から使う
  AN.app = { routes, route, reindex, esc, dName, dEn, yrs, el: app, renderDraftBar };
  document.addEventListener("DOMContentLoaded", route);
})();
