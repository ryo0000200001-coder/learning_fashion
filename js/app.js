/* Archive Notes — シングルページの知識帳サイト（ビルド不要） */
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
  const originLabel = (o) => (o === "domestic" ? "国内" : "海外");
  // 表記ゆれに強い検索用の正規化：全角半角・大文字小文字・カタカナ/ひらがな・アクセント・記号や空白の違いを無視する
  const fold = (s) => String(s == null ? "" : s).normalize("NFKC").normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[\u30a1-\u30f6]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60))
    .replace(/[\s・･\-‐－―_.,，、。'’"“”&＆/／()（）\[\]「」!！?？:：;；+＋*~〜]/g, "");
  const match = (q, ...xs) => { const f = fold(q); return !f || fold(xs.flat().filter(Boolean).join(" ")).includes(f); };
  const brandWords = (b) => [b.name, b.ja, b.id, b.aka || [], b.tags || []];

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
  let store = { notes: {} };
  try { store = Object.assign(store, JSON.parse(localStorage.getItem(KEY) || "{}")); } catch (e) { /* ignore */ }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(store)); } catch (e) { /* ignore */ } };
  const ui = { origin: "all", country: "", tag: "", q: "", tlOrigin: "all", tlFrom: 1980 };

  // ---------- router ----------
  const routes = {
    "": renderHome,
    brands: renderBrands,
    brand: renderBrand,
    designers: renderDesigners,
    designer: renderDesigner,
    timeline: renderTimeline,
    seasons: renderSeasons,
    glossary: renderGlossary,
    dating: renderDating,
    network: renderNetwork,
    country: (c) => { ui.country = c || ""; ui.origin = "all"; ui.tag = ""; ui.q = ""; renderBrands(); }
  };
  // 国ごとのブランド数（日本を先頭に、多い順）
  function countries() {
    const n = {};
    BRANDS.forEach((b) => { const c = b.country || "その他"; n[c] = (n[c] || 0) + 1; });
    return Object.entries(n).sort((a, b) => (a[0] === "日本" ? -1 : b[0] === "日本" ? 1 : b[1] - a[1] || a[0].localeCompare(b[0], "ja")));
  }
  const countryLink = (c) => `#/country/${encodeURIComponent(c)}`;
  function route() {
    const parts = location.hash.replace(/^#\/?/, "").split("/").map(decodeURIComponent);
    const view = routes[parts[0]] || renderHome;
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const n = a.dataset.nav;
      a.classList.toggle("active", parts[0] === n || parts[0] === n.replace(/s$/, ""));
    });
    document.querySelector(".nav").classList.remove("open");
    renderDraftBar();
    view(parts[1], parts[2], parts[3]);
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
    document.title = "Archive Notes";
    const sorted = (c) => BRANDS.filter((b) => (b.country || "その他") === c).sort((x, y) => x.name.localeCompare(y.name, "en", { sensitivity: "base" }));
    const cs = countries();
    const index = (c) => sorted(c).map((b) => `<a href="#/brand/${encodeURIComponent(b.id)}"><b>${esc(b.name)}</b><span>${esc(b.ja)} · ${esc(b.founded)}</span></a>`).join("");
    app.innerHTML = `
      <div class="home-search">
        <input type="search" id="hq" placeholder="ブランド・デザイナー・ライン・シーズン・用語を検索" autocomplete="off">
      </div>
      <div id="hres"></div>
      <div id="hindex">
        <div class="chips">${topTags().map((t) => `<a class="chip" href="#/brands" data-t="${esc(t)}">${esc(t)}</a>`).join("")}</div>
        <h2>国別</h2>
        <div class="chips country-chips">${cs.map(([c, n]) => `<a class="chip" href="${countryLink(c)}">${esc(c)} <span class="cnum">${n}</span></a>`).join("")}</div>
        ${cs.map(([c, n]) => `<h2><a href="${countryLink(c)}">${esc(c)}</a><span class="h2sub">${n}</span></h2>
        <div class="bindex">${index(c)}</div>`).join("")}
      </div>`;
    app.querySelector(".chips").addEventListener("click", (e) => {
      const t = e.target.closest(".chip"); if (t) { ui.tag = t.dataset.t; ui.country = ""; }
    });
    const q = document.getElementById("hq");
    q.addEventListener("input", () => drawHomeResults(q.value));
  }

  // ホームの全体検索
  function drawHomeResults(raw) {
    const q = raw.trim();
    const res = document.getElementById("hres");
    document.getElementById("hindex").hidden = !!q;
    if (!q) { res.innerHTML = ""; return; }
    const has = (...xs) => match(q, ...xs);
    const groups = [];
    // 名前・読み・別名で一致したものを先に、タグだけで一致したものを後に並べる
    const rank = (words) => { const f = fold(q); const w = fold(words.flat().filter(Boolean).join(" ")); return w.startsWith(f) ? 0 : w.includes(f) ? 1 : 2; };
    const brands = BRANDS.filter((b) => has(...brandWords(b))).sort((x, y) => rank([x.name, x.ja, x.aka || []]) - rank([y.name, y.ja, y.aka || []]));
    groups.push(["ブランド", brands.map((b) => [`#/brand/${encodeURIComponent(b.id)}`, b.name, `${b.ja} · ${b.founded}`])]);
    const des = Object.keys(DESIGNERS).filter((k) => has(dName(k), dEn(k), (DESIGNERS[k] || {}).aka || []));
    groups.push(["デザイナー", des.map((k) => [`#/designer/${encodeURIComponent(k)}`, dName(k), [...new Set((careers[k] || []).map((c) => c.brand.name))].join(" → ") || dEn(k)])]);
    const lines = BRANDS.flatMap((b) => (b.lines || []).filter((l) => has(l.name, l.designer)).map((l) => [`#/brand/${encodeURIComponent(b.id)}`, l.name, `${b.name}${l.from ? ` · ${l.from}〜` : ""}${l.designer ? ` · ${l.designer}` : ""}`]));
    groups.push(["ライン", lines]);
    const items = BRANDS.flatMap((b) => [
      ...(b.items || []).map((i) => [i, ""]),
      ...(b.lines || []).flatMap((l) => (l.items || []).map((i) => [i, l.name]))
    ].filter(([i]) => has(i.name)).map(([i, ln]) => [`#/brand/${encodeURIComponent(b.id)}`, i.name, `${b.name}${ln ? ` / ${ln}` : ""}${i.year ? ` · ${i.year}` : ""}`]));
    groups.push(["アイテム", items]);
    const seasons = BRANDS.flatMap((b) => [
      ...(b.collections || []).map((c) => [c, ""]),
      ...(b.lines || []).flatMap((l) => (l.collections || []).map((c) => [c, l.name]))
    ].filter(([c]) => has(c.title, c.alias, c.season)).map(([c, ln]) => [`#/brand/${encodeURIComponent(b.id)}`, `${c.season} ${c.title || ""}`, `${b.name}${ln ? ` / ${ln}` : ""}${c.alias ? ` · 通称「${c.alias}」` : ""}`]));
    groups.push(["シーズン", seasons]);
    const terms = GLOSSARY.filter((g) => has(g.term, g.reading));
    groups.push(["用語", terms.map((g) => ["#/glossary", g.term, g.desc.slice(0, 40) + (g.desc.length > 40 ? "…" : "")])]);
    const shown = groups.filter(([, rows]) => rows.length);
    res.innerHTML = shown.length
      ? shown.map(([title, rows]) => `<h2>${title}<span class="h2sub">${rows.length}</span></h2>
          <div class="hlist">${rows.slice(0, 30).map(([h, t, sub]) => `<a href="${h}"><b>${esc(t)}</b><span>${esc(sub)}</span></a>`).join("")}</div>`).join("")
      : `<p class="empty">見つかりませんでした。<a href="#/edit/brand/new">新しいブランドとして追加する →</a></p>`;
  }

  const paras = (t) => String(t || "").split(/\n+/).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join("");

  function brandCard(b) {
    const cur = (b.designers || []).filter((t) => t.to == null).map((t) => dName(t.d));
    return `<a class="brand-card" href="#/brand/${b.id}">
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
        <select id="country" aria-label="国">
          <option value="">国: すべて</option>
          ${countries().map(([c, n]) => `<option value="${esc(c)}" ${ui.country === c ? "selected" : ""}>${esc(c)}（${n}）</option>`).join("")}
        </select>
        <select id="tag" aria-label="タグ">
          <option value="">タグ: すべて</option>
          ${tags.map((t) => `<option ${ui.tag === t ? "selected" : ""}>${esc(t)}</option>`).join("")}
        </select>
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
      const q = ui.q.trim();
      const list = BRANDS.filter((b) => {
        if (ui.origin !== "all" && b.origin !== ui.origin) return false;
        if (ui.tag && !(b.tags || []).includes(ui.tag)) return false;
        if (ui.country && (b.country || "その他") !== ui.country) return false;
        if (!q) return true;
        return match(q, ...brandWords(b), b.country, b.summary, b.about, ...(b.tags || []),
          ...(b.designers || []).flatMap((t) => [dName(t.d), dEn(t.d)]),
          ...(b.items || []).map((i) => i.name),
          ...(b.collections || []).flatMap((c) => [c.title, c.alias]),
          ...(b.lines || []).flatMap((l) => [l.name, l.designer, ...(l.items || []).map((x) => x.name), ...(l.collections || []).flatMap((c) => [c.title, c.alias])]));
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
    document.getElementById("country").addEventListener("change", (e) => {
      ui.country = e.target.value;
      draw();
    });
    document.getElementById("tag").addEventListener("change", (e) => {
      ui.tag = e.target.value;
      document.querySelectorAll("#chips .chip").forEach((c) => c.classList.toggle("on", c.dataset.t === ui.tag));
      draw();
    });
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

  // 代表アイテムのカード（写真があれば表示。なければ画像検索へのリンク）
  function itemCard(b, i) {
    const q = encodeURIComponent(`${b.name} ${i.name}`);
    const credit = [i.credit, i.license].filter(Boolean).join(" / ");
    const photo = i.img
      ? `<figure class="item-img"><a href="${esc(i.imgPage || i.img)}" target="_blank" rel="noopener noreferrer"><img src="${esc(i.img)}" alt="${esc(i.name)}" loading="lazy"></a>
          ${credit ? `<figcaption>写真: ${i.imgPage ? `<a href="${esc(i.imgPage)}" target="_blank" rel="noopener noreferrer">${esc(credit)}</a>` : esc(credit)}</figcaption>` : ""}</figure>`
      : "";
    return `<div class="item ${i.img ? "has-img" : ""}">${photo}
      <div class="item-body"><div class="yr">${esc(i.year || "")}${i.unverified ? ' <span class="unv">未確認</span>' : ""}</div><h3>${esc(i.name)}</h3><p>${esc(i.desc || "")}</p>
      ${i.img ? "" : `<a class="imgsearch" href="https://www.google.com/search?tbm=isch&q=${q}" target="_blank" rel="noopener noreferrer">画像を検索 ↗</a>`}</div></div>`;
  }

  // ブランド内のライン。詳細（歴史・名作・シーズン・古着のポイント）があれば開閉できる
  function lineRow(b, l, i) {
    const yrs = l.from || l.to ? `${esc(l.from || "?")}–${l.to ? esc(l.to) : ""}` : "—";
    const head = `<div class="line-yrs">${yrs}${l.to ? '<span class="line-end">終了</span>' : ""}</div>
      <div><div class="line-name">${esc(l.name)}${l.unverified ? ' <span class="unv">未確認</span>' : ""}</div>
      ${l.designer ? `<div class="line-des">デザイン：${esc(l.designer)}</div>` : ""}
      ${l.desc ? `<div class="cnote">${esc(l.desc)}</div>` : ""}</div>`;
    const n = (l.history || []).length + (l.items || []).length + (l.collections || []).length + (l.archive || []).length;
    if (!n) return `<div class="line-row">${head}</div>`;
    const counts = [
      (l.collections || []).length ? `シーズン${l.collections.length}` : "",
      (l.items || []).length ? `名作${l.items.length}` : "",
      (l.history || []).length ? `年表${l.history.length}` : ""
    ].filter(Boolean).join("・");
    return `<details class="line-row line-detail" id="line-${i}"><summary>${head}<span class="line-more">${counts || "詳細"} ▾</span></summary>
      <div class="line-body">
        ${(l.history || []).length ? `<h4>歴史</h4><ul class="history small-history">${l.history.map((h) => `<li><span class="y">${esc(h.year)}</span>${esc(h.text)}</li>`).join("")}</ul>` : ""}
        ${(l.collections || []).length ? `<h4>名作シーズン</h4><div class="ctable">${l.collections.map((c) => collectionRow(c, false, b.name)).join("")}</div>` : ""}
        ${(l.items || []).length ? `<h4>名作アイテム</h4><div class="items">${l.items.map((it) => itemCard(b, it)).join("")}</div>` : ""}
        ${(l.archive || []).length ? `<h4>古着で見るポイント</h4><ul class="tips">${l.archive.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}
        <a class="btn ghost small" href="#/edit/line/${encodeURIComponent(b.id)}/${i}">✎ このラインを編集</a>
      </div></details>`;
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
          <p class="eyebrow">${originLabel(b.origin)} · <a href="${countryLink(b.country)}">${esc(b.country)}</a></p>
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

      <p class="lead-sum">${esc(b.summary)}</p>
      ${b.about ? `<h2>ブランドについて</h2><div class="about">${paras(b.about)}</div>` : ""}
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

      ${(b.lines || []).length ? `<h2>ライン<span class="h2sub">${b.lines.length}ライン</span></h2>
      <div class="lines">${b.lines.map((l, i) => lineRow(b, l, i)).join("")}</div>` : ""}

      <h2>歴史</h2>
      <ul class="history">
        ${(b.history || []).map((h) => `<li><span class="y">${esc(h.year)}</span>${esc(h.text)}${h.unverified ? ' <span class="unv">未確認</span>' : ""}</li>`).join("")}
      </ul>

      ${(b.collections || []).length ? `<h2>コレクション（シーズン）<span class="h2sub">${b.collections.length}シーズン</span></h2>
      <div class="ctable">${b.collections.map((c) => collectionRow(c, false, b.name)).join("")}</div>` : ""}

      ${(b.items || []).length ? `<h2>代表的なアイテム</h2>
      <div class="items">
        ${b.items.map((i) => itemCard(b, i)).join("")}
      </div>` : ""}

      ${(b.dating || []).length ? `<h2>年代の見分け方</h2>${datingBlock(b)}` : ""}

      ${(b.archive || []).length ? `<h2>古着・アーカイブで見るポイント</h2><ul class="tips">${b.archive.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>` : ""}

      ${(b.sources || []).length ? `<h2>出典</h2><ul class="sources">${b.sources.map((x) => `<li><a href="${esc(x.u)}" target="_blank" rel="noopener noreferrer">${esc(x.t)}</a></li>`).join("")}</ul>` : ""}

      ${related.length ? `<h2>関連ブランド</h2><div class="grid">${related.map(brandCard).join("")}</div>` : ""}

      <section class="study">
        <div class="row">
          <h3>自分のメモ</h3>
          <span class="muted small">このブラウザにだけ保存されます</span>
        </div>
        <textarea id="note" placeholder="古着屋で見た個体、相場、タグの特徴、気になったシーズンなど">${esc(store.notes[b.id] || "")}</textarea>
        <span class="saved" id="saved">保存しました</span>
      </section>
    `;
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
      const list = keys.filter((k) => match(q || "", dName(k), dEn(k), (DESIGNERS[k] || {}).aka || []));
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
      ${d.bio ? `<div class="about">${paras(d.bio)}</div>` : ""}
      ${lineageBlock(key)}

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
    const rows = BRANDS.flatMap((b) => [
      ...(b.collections || []).map((c) => ({ ...c, brand: b })),
      ...(b.lines || []).flatMap((l) => (l.collections || []).map((c) => ({ ...c, brand: b, line: l.name })))
    ]);
    const brandsWith = BRANDS.filter((b) => (b.collections || []).length || (b.lines || []).some((l) => (l.collections || []).length));
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
    const norm = fold;
    const draw = () => {
      const q = norm(document.getElementById("sq").value);
      const bid = document.getElementById("sb").value;
      const list = rows.filter((r) => (!bid || r.brand.id === bid) &&
        (!q || norm([r.season, seasonAliases(r.season), r.title, r.alias, r.note, r.brand.name, r.brand.ja, r.line].join(" ")).includes(q)));
      document.getElementById("scount").textContent = `${list.length} 件`;
      document.getElementById("slist").innerHTML = list.length
        ? `<div class="ctable">${list.map((r) => collectionRow(r, true, r.brand.name)).join("")}</div>`
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

  // ---------- 年代の見分け方 ----------
  function datingBlock(b) {
    return `<div class="dating">${b.dating.map((d) => `<div class="dt-row"><h3>${esc(d.title)}</h3><div class="about">${paras(d.text)}</div></div>`).join("")}</div>`;
  }
  function renderDating(id) {
    document.title = "年代の見分け方 — Archive Notes";
    const list = BRANDS.filter((b) => (b.dating || []).length).sort((x, y) => x.name.localeCompare(y.name, "en", { sensitivity: "base" }));
    app.innerHTML = `
      <p class="eyebrow">Dating</p>
      <h1>年代の見分け方</h1>
      <p class="lead">タグ・刻印・製造番号などから、古着がいつ頃のものかを見分けるための手がかりをまとめています。ブランドページの「年代の見分け方」と同じ内容です。</p>
      <div class="toolbar"><input type="search" id="dtq" placeholder="ブランド名・キーワードで検索（例: AD表記 / デートコード）"></div>
      <div class="chips" id="dtchips">${list.map((b) => `<a class="chip" href="#dt-${esc(b.id)}" data-id="${esc(b.id)}">${esc(b.name)}</a>`).join("")}</div>
      <div id="dtlist"></div>`;
    const draw = () => {
      const q = document.getElementById("dtq").value;
      const rows = list.filter((b) => match(q, ...brandWords(b), b.dating.map((d) => [d.title, d.text])));
      document.getElementById("dtlist").innerHTML = rows.map((b) => `<section class="dt-brand" id="dt-${esc(b.id)}">
        <h2><a href="#/brand/${encodeURIComponent(b.id)}">${esc(b.name)}</a><span class="h2sub">${esc(b.ja)}</span></h2>${datingBlock(b)}</section>`).join("")
        || `<p class="empty">見つかりませんでした。</p>`;
    };
    document.getElementById("dtq").addEventListener("input", draw);
    document.getElementById("dtchips").addEventListener("click", (e) => {
      const a = e.target.closest("a[data-id]"); if (!a) return;
      e.preventDefault();
      const t = document.getElementById("dt-" + a.dataset.id); if (t) t.scrollIntoView({ behavior: "smooth" });
    });
    draw();
    if (id) { const t = document.getElementById("dt-" + id); if (t) setTimeout(() => t.scrollIntoView(), 0); }
  }

  // ---------- デザイナーのつながり ----------
  // mentors: そのデザイナーが下で働いた人（師）。逆向きにたどると、そこから巣立った人（弟子）になる
  function mentorsOf(k) { return ((DESIGNERS[k] || {}).mentors || []).filter((m) => DESIGNERS[m]); }
  function studentsOf(k) { return Object.keys(DESIGNERS).filter((x) => mentorsOf(x).includes(k)); }
  function lineageBlock(k) {
    const up = mentorsOf(k), down = studentsOf(k);
    if (!up.length && !down.length) return "";
    const pill = (x) => `<a class="chip" href="#/designer/${encodeURIComponent(x)}">${esc(dName(x))}</a>`;
    return `<h2>つながり</h2><div class="lineage">
      ${up.length ? `<div><span class="muted small">この人が下で働いた人</span><div class="chips">${up.map(pill).join("")}</div></div>` : ""}
      ${down.length ? `<div><span class="muted small">この人のもとで働いた人</span><div class="chips">${down.map(pill).join("")}</div></div>` : ""}
      <a class="small" href="#/network/${encodeURIComponent(k)}">つながり図で見る →</a></div>`;
  }
  function renderNetwork(focus) {
    document.title = "デザイナーのつながり — Archive Notes";
    const keys = Object.keys(DESIGNERS);
    const edges = [];
    keys.forEach((k) => mentorsOf(k).forEach((m) => edges.push([m, k])));
    const inGraph = [...new Set(edges.flat())];
    // 系統（師のいない人を根にした木）
    const roots = inGraph.filter((k) => !mentorsOf(k).length).sort((a, b) => studentsOf(b).length - studentsOf(a).length || dName(a).localeCompare(dName(b), "ja"));
    const tree = (k, seen) => {
      if (seen.has(k)) return "";
      seen.add(k);
      const kids = studentsOf(k);
      return `<li><a href="#/designer/${encodeURIComponent(k)}" class="${k === focus ? "focus" : ""}">${esc(dName(k))}</a><span class="muted small"> ${esc([...new Set((careers[k] || []).map((c) => c.brand.name))].slice(0, 4).join("・"))}</span>
        ${kids.length ? `<ul>${kids.map((x) => tree(x, seen)).join("")}</ul>` : ""}</li>`;
    };
    const seen = new Set();
    app.innerHTML = `
      <p class="eyebrow">Network</p>
      <h1>デザイナーのつながり</h1>
      <p class="lead">「誰のもとで働いていたか」をつないだ図です。線は師（左・上）から、そのもとで働いた人へ向かいます。名前を押すとデザイナーのページへ移ります。つながりはデザイナーの編集画面の「師（下で働いた人）」で直せます。</p>
      <div class="toolbar"><select id="nfocus"><option value="">デザイナーを選んで強調</option>${inGraph.slice().sort((a, b) => dName(a).localeCompare(dName(b), "ja")).map((k) => `<option value="${esc(k)}" ${k === focus ? "selected" : ""}>${esc(dName(k))}</option>`).join("")}</select></div>
      <div class="netwrap"><svg id="net" role="img" aria-label="デザイナーのつながり図"></svg></div>
      <h2>系統で見る</h2>
      <ul class="tree">${roots.map((r) => tree(r, seen)).join("")}</ul>`;
    drawNetwork(inGraph, edges, focus);
    document.getElementById("nfocus").addEventListener("change", (e) => { location.hash = "#/network/" + encodeURIComponent(e.target.value); });
  }
  function drawNetwork(nodes, edges, focus) {
    const svg = document.getElementById("net");
    if (!svg || !nodes.length) return;
    const W = 1100, H = 900;
    // 決まった並びになるよう、名前から初期位置を作る
    const P = {};
    nodes.forEach((k, i) => { const a = (i / nodes.length) * Math.PI * 2; const r = 300 + (hue(k) % 60); P[k] = { x: W / 2 + Math.cos(a) * r, y: H / 2 + Math.sin(a) * r, vx: 0, vy: 0 }; });
    for (let it = 0; it < 400; it++) {
      const cool = 1 - it / 400;
      for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
        const a = P[nodes[i]], b = P[nodes[j]];
        let dx = a.x - b.x, dy = a.y - b.y; let d2 = dx * dx + dy * dy || 0.01;
        const f = 2600 / d2; const d = Math.sqrt(d2);
        dx /= d; dy /= d; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
      }
      edges.forEach(([m, k]) => {
        const a = P[m], b = P[k]; const dx = b.x - a.x, dy = b.y - a.y; const d = Math.sqrt(dx * dx + dy * dy) || 1;
        const f = (d - 70) * 0.02; a.vx += (dx / d) * f; a.vy += (dy / d) * f; b.vx -= (dx / d) * f; b.vy -= (dy / d) * f;
        b.vy += 0.6; a.vy -= 0.6; // 師が上、弟子が下に来やすくする
      });
      nodes.forEach((k) => { const p = P[k]; p.vx += (W / 2 - p.x) * 0.002; p.vy += (H / 2 - p.y) * 0.002;
        const lim = 12 * cool + 1; p.x += Math.max(-lim, Math.min(lim, p.vx)); p.y += Math.max(-lim, Math.min(lim, p.vy)); p.vx *= 0.5; p.vy *= 0.5; });
    }
    const xs = nodes.map((k) => P[k].x), ys = nodes.map((k) => P[k].y);
    const minX = Math.min(...xs) - 60, maxX = Math.max(...xs) + 60, minY = Math.min(...ys) - 30, maxY = Math.max(...ys) + 30;
    svg.setAttribute("viewBox", `${minX} ${minY} ${maxX - minX} ${maxY - minY}`);
    svg.style.minWidth = Math.round(maxX - minX) + "px";
    const near = new Set(focus ? [focus, ...mentorsOf(focus), ...studentsOf(focus)] : []);
    const on = (k) => !focus || near.has(k);
    svg.innerHTML = `<defs><marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" class="net-arrow"/></marker></defs>
      ${edges.map(([m, k]) => { const a = P[m], b = P[k]; const hot = focus && (m === focus || k === focus);
        return `<line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="net-edge ${hot ? "hot" : ""} ${focus && !hot ? "dim" : ""}" marker-end="url(#arr)"/>`; }).join("")}
      ${nodes.map((k) => { const p = P[k]; const deg = studentsOf(k).length;
        return `<a href="#/designer/${encodeURIComponent(k)}" class="net-node ${k === focus ? "focus" : ""} ${on(k) ? "" : "dim"}"><circle cx="${p.x}" cy="${p.y}" r="${4 + Math.min(deg, 8)}" style="--h:${hue(k)}"/><text x="${p.x}" y="${p.y - 8 - Math.min(deg, 8)}">${esc(dName(k))}</text></a>`; }).join("")}`;
    // 強調したデザイナーが見える位置までスクロール
    if (focus && P[focus]) {
      const wrap = svg.parentElement;
      const sx = svg.clientWidth / (maxX - minX), sy = svg.clientHeight / (maxY - minY);
      wrap.scrollLeft = (P[focus].x - minX) * sx - wrap.clientWidth / 2;
      wrap.scrollTop = (P[focus].y - minY) * sy - wrap.clientHeight / 2;
    }
  }

  // シーズンの写真を探すリンク（画像検索）
  function seasonPhotoLink(brandName, c) {
    const q = encodeURIComponent([brandName, c.season, c.title || c.alias || "", "collection"].filter(Boolean).join(" "));
    return `<a class="cphoto" href="https://www.google.com/search?tbm=isch&q=${q}" target="_blank" rel="noopener noreferrer">写真を探す ↗</a>`;
  }
  function collectionRow(c, withBrand, brandName) {
    return `<div class="crow">
      <div class="cseason">${esc(c.season)}${c.city ? `<span class="ccity">${esc(c.city)}</span>` : ""}</div>
      <div>
        ${withBrand ? `<a class="cbrand" href="#/brand/${c.brand.id}">${esc(c.brand.name)}${c.line ? ` / ${esc(c.line)}` : ""}</a>` : ""}
        <div class="ctitle">${c.title ? esc(c.title) : (c.alias ? `「${esc(c.alias)}」` : "—")}${c.title && c.alias ? ` <span class="calias">通称「${esc(c.alias)}」</span>` : ""}${c.unverified ? ' <span class="unv">未確認</span>' : ""}</div>
        ${c.note ? `<div class="cnote">${esc(c.note)}</div>` : ""}
        ${brandName ? seasonPhotoLink(brandName, c) : ""}
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
      document.getElementById("gl").innerHTML = GLOSSARY
        .filter((g) => match(q || "", g.term, g.reading, g.desc))
        .map((g) => `<dt>${esc(g.term)}${g.reading ? `<small>${esc(g.reading)}</small>` : ""}</dt><dd>${esc(g.desc)}</dd>`).join("") || `<p class="empty">該当なし</p>`;
    };
    document.getElementById("gq").addEventListener("input", (e) => draw(e.target.value));
    draw("");
  }

  // editor.js から使う
  AN.app = { routes, route, reindex, esc, dName, dEn, yrs, el: app, renderDraftBar, fold, match, paras, brandWords, byId: () => byId };
  document.addEventListener("DOMContentLoaded", route);
})();
