/*
 * 持ち物の記録：自分が持っている服・手放した服・店で見た服・欲しい服を記録する。
 * data/wardrobe.js に保存され、ほかのデータと同じく「GitHubに保存」でリポジトリに入る。
 * ルート: #/mine, #/mine/new, #/mine/edit/<id>, #/mine/brand/<brandId>
 */
(function () {
  "use strict";

  const AN = window.AN;
  const A = AN.app;
  const esc = A.esc;
  const D = AN.data;
  const el = A.el;
  const STATUS = [["have", "持っている"], ["sold", "手放した"], ["seen", "見た"], ["want", "欲しい"]];
  const statusLabel = (v) => (STATUS.find((s) => s[0] === v) || [v, v])[1];
  const yen = (n) => (n === null || n === undefined || n === "" ? "" : `¥${Number(n).toLocaleString("ja-JP")}`);
  const brandName = (id) => { const b = A.byId()[id]; return b ? b.name : id || "（ブランド未設定）"; };
  const list = () => D.wardrobe || (D.wardrobe = []);
  const go = (hash) => { if (location.hash === hash) A.route(); else location.hash = hash; };

  function card(w) {
    const meta = [w.season, w.line, w.size ? `サイズ ${w.size}` : "", w.condition].filter(Boolean).join(" · ");
    const buy = [w.date, w.shop, yen(w.price)].filter(Boolean).join(" · ");
    return `<a class="mcard" href="#/mine/edit/${encodeURIComponent(w.id)}">
      ${w.img ? `<img src="${esc(w.img)}" alt="" loading="lazy">` : `<div class="mnoimg">${esc(brandName(w.brand)).slice(0, 2)}</div>`}
      <div class="mbody">
        <span class="mstatus s-${esc(w.status || "have")}">${esc(statusLabel(w.status || "have"))}</span>
        <div class="mbrand">${esc(brandName(w.brand))}</div>
        <strong>${esc(w.name || "（名前なし）")}</strong>
        ${meta ? `<div class="muted small">${esc(meta)}</div>` : ""}
        ${buy ? `<div class="muted small">${esc(buy)}</div>` : ""}
      </div></a>`;
  }

  // ブランドページなどから使う：そのブランドの記録
  A.mineForBrand = (id) => {
    const rows = list().filter((w) => w.brand === id);
    return `<h2>自分の記録<span class="h2sub">${rows.length}件</span></h2>
      ${rows.length ? `<div class="mgrid">${rows.map(card).join("")}</div>` : `<p class="muted small">まだ記録がありません。</p>`}
      <a class="btn ghost small" href="#/mine/new/${encodeURIComponent(id)}">＋ このブランドの服を記録する</a>`;
  };

  function renderList(filter) {
    document.title = "持ち物 — Archive Notes";
    const all = list();
    const st = filter && STATUS.some((s) => s[0] === filter) ? filter : "";
    const brands = [...new Set(all.map((w) => w.brand))].sort((a, b) => brandName(a).localeCompare(brandName(b), "en"));
    el.innerHTML = `
      <p class="eyebrow">My Archive</p>
      <h1>持ち物</h1>
      <p class="lead">自分が持っている服、手放した服、店で見た服、欲しい服の記録です。値段や店を書いておくと相場の目安になります。<b>「GitHubに保存」すると公開サイトにも表示されるので、人に見られたくない内容は書かないでください。</b></p>
      <div class="toolbar">
        <input type="search" id="mq" placeholder="ブランド・名前・シーズン・店で検索">
        <div class="seg" id="mst">${[["", "すべて"], ...STATUS].map(([v, l]) => `<button data-v="${v}" class="${st === v ? "on" : ""}">${l}</button>`).join("")}</div>
        <select id="mbrand"><option value="">ブランド: すべて</option>${brands.map((b) => `<option value="${esc(b)}">${esc(brandName(b))}</option>`).join("")}</select>
        <a class="btn" href="#/mine/new">＋ 記録する</a>
      </div>
      <p class="muted small" id="mcount"></p>
      <div class="mgrid" id="mlist"></div>`;
    let cur = st;
    const draw = () => {
      const q = document.getElementById("mq").value;
      const bf = document.getElementById("mbrand").value;
      const rows = all.filter((w) => (!cur || (w.status || "have") === cur) && (!bf || w.brand === bf) &&
        A.match(q, brandName(w.brand), w.name, w.season, w.line, w.shop, w.note, w.size));
      const total = rows.filter((w) => w.price != null && w.price !== "").reduce((s, w) => s + Number(w.price), 0);
      document.getElementById("mcount").textContent = `${rows.length} 件${total ? `・値段の合計 ${yen(total)}` : ""}`;
      document.getElementById("mlist").innerHTML = rows.map(card).join("") || `<p class="empty">まだ記録がありません。「＋ 記録する」から追加できます。</p>`;
    };
    document.getElementById("mq").addEventListener("input", draw);
    document.getElementById("mbrand").addEventListener("change", draw);
    document.getElementById("mst").addEventListener("click", (e) => {
      const v = e.target.dataset && e.target.dataset.v; if (v === undefined) return;
      cur = v;
      e.currentTarget.querySelectorAll("button").forEach((b) => b.classList.toggle("on", b.dataset.v === v));
      draw();
    });
    draw();
  }

  function renderForm(id, presetBrand) {
    const isNew = !id;
    const src = isNew ? { status: "have", brand: presetBrand || "" } : list().find((w) => w.id === id);
    if (!src) { el.innerHTML = `<p class="empty">記録が見つかりません。<a href="#/mine">一覧へ</a></p>`; return; }
    const w = JSON.parse(JSON.stringify(src));
    const b = A.byId()[w.brand];
    const seasons = b ? [...(b.collections || []).map((c) => c.season), ...(b.lines || []).flatMap((l) => (l.collections || []).map((c) => c.season))] : [];
    const lines = b ? (b.lines || []).map((l) => l.name) : [];
    document.title = (isNew ? "記録する" : "記録を編集") + " — Archive Notes";
    el.innerHTML = `
      <a class="back" href="#/mine">← 持ち物</a>
      <h1>${isNew ? "記録する" : "記録を編集"}</h1>
      <datalist id="mbrands">${D.brands.slice().sort((x, y) => x.name.localeCompare(y.name)).map((x) => `<option value="${esc(x.id)}">${esc(x.name)}</option>`).join("")}</datalist>
      <datalist id="mseasons">${[...new Set(seasons)].map((s) => `<option value="${esc(s)}">`).join("")}</datalist>
      <datalist id="mlines">${lines.map((s) => `<option value="${esc(s)}">`).join("")}</datalist>
      <form id="mf" class="eform" autocomplete="off">
        <fieldset><legend>服</legend>
          <div class="grid2">
            <label class="lf"><span>ブランド（ID。候補から選ぶ）*</span><input name="brand" list="mbrands" value="${esc(w.brand || "")}" required placeholder="例: cdg"></label>
            <label class="lf"><span>状態</span><select name="status">${STATUS.map(([v, l]) => `<option value="${v}" ${w.status === v ? "selected" : ""}>${l}</option>`).join("")}</select></label>
            <label class="lf"><span>名前 *</span><input name="name" value="${esc(w.name || "")}" required placeholder="例: 縮絨のテーラードジャケット"></label>
            <label class="lf"><span>シーズン</span><input name="season" list="mseasons" value="${esc(w.season || "")}" placeholder="例: 1996-97AW / AD1996"></label>
            <label class="lf"><span>ライン</span><input name="line" list="mlines" value="${esc(w.line || "")}" placeholder="例: HOMME PLUS"></label>
            <label class="lf"><span>サイズ</span><input name="size" value="${esc(w.size || "")}"></label>
            <label class="lf"><span>状態（コンディション）</span><input name="condition" value="${esc(w.condition || "")}" placeholder="例: 目立った傷なし"></label>
          </div>
        </fieldset>
        <fieldset><legend>買った・見た記録</legend>
          <div class="grid2">
            <label class="lf"><span>日付</span><input name="date" type="date" value="${esc(w.date || "")}"></label>
            <label class="lf"><span>店</span><input name="shop" value="${esc(w.shop || "")}"></label>
            <label class="lf"><span>値段（円）</span><input name="price" inputmode="numeric" value="${esc(w.price == null ? "" : w.price)}"></label>
            <label class="lf"><span>売った値段（円）</span><input name="soldPrice" inputmode="numeric" value="${esc(w.soldPrice == null ? "" : w.soldPrice)}"></label>
          </div>
        </fieldset>
        <fieldset><legend>写真とメモ</legend>
          <label class="lf lf-img"><span>写真（URLまたはアップロード）</span><span class="imgrow"><input name="img" value="${esc(w.img || "")}" placeholder="images/..."><button type="button" class="btn ghost small" id="mup">写真をアップロード</button></span></label>
          ${w.img ? `<img class="mprev" src="${esc(w.img)}" alt="">` : ""}
          <label class="lf"><span>メモ（タグの表記、特徴など。空行で段落）</span><textarea name="note" rows="5">${esc(w.note || "")}</textarea></label>
        </fieldset>
        <div class="form-msg" id="fmsg"></div>
        <div class="row-btns sticky">
          <button class="btn" type="submit">保存（下書き）</button>
          <a class="btn ghost" href="#/mine">キャンセル</a>
          ${isNew ? "" : `<button class="btn ghost danger" type="button" id="del">この記録を削除</button>`}
        </div>
      </form>`;
    const form = document.getElementById("mf");
    document.getElementById("mup").addEventListener("click", (e) => A.uploadPhoto(e.currentTarget));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = form.elements;
      const num = (v) => (String(v).trim() === "" ? null : Number(String(v).replace(/[^\d.]/g, "")));
      const msg = document.getElementById("fmsg");
      const nw = {
        id: w.id || "w" + Date.now().toString(36),
        brand: f.brand.value.trim(), status: f.status.value, name: f.name.value.trim(),
        season: f.season.value.trim(), line: f.line.value.trim(), size: f.size.value.trim(), condition: f.condition.value.trim(),
        date: f.date.value, shop: f.shop.value.trim(), price: num(f.price.value), soldPrice: num(f.soldPrice.value),
        img: f.img.value.trim(), note: f.note.value.trim()
      };
      Object.keys(nw).forEach((k) => { if (nw[k] === "" || nw[k] === null) delete nw[k]; });
      const errs = [];
      if (!A.byId()[nw.brand]) errs.push(`ブランドID「${nw.brand}」が見つかりません。候補から選んでください。`);
      if (!nw.name) errs.push("名前を入力してください。");
      if (errs.length) { msg.innerHTML = errs.map(esc).join("<br>"); msg.className = "form-msg err"; return; }
      const arr = list();
      const i = arr.findIndex((x) => x.id === nw.id);
      if (i >= 0) arr[i] = nw; else arr.unshift(nw);
      A.saveLocal(`持ち物を${i >= 0 ? "修正" : "追加"}: ${brandName(nw.brand)} ${nw.name}`);
      A.flash("下書きに保存しました。公開するには編集トップで「GitHubに保存」を押してください。");
      go("#/mine");
    });
    const del = document.getElementById("del");
    if (del) del.addEventListener("click", () => {
      if (!confirm("この記録を削除します。よろしいですか？")) return;
      const arr = list();
      const i = arr.findIndex((x) => x.id === w.id);
      if (i >= 0) arr.splice(i, 1);
      A.saveLocal(`持ち物を削除: ${brandName(w.brand)} ${w.name || ""}`);
      go("#/mine");
    });
  }

  A.routes.mine = (sub, id) => {
    if (sub === "new") renderForm(null, id);
    else if (sub === "edit") renderForm(id);
    else renderList(sub);
  };
  // ブランドページの末尾に自分の記録を差し込む
  const origBrand = A.routes.brand;
  A.routes.brand = (id, ...rest) => {
    origBrand(id, ...rest);
    if (!A.byId()[id]) return;
    const sec = document.createElement("section");
    sec.className = "mine-sec";
    sec.innerHTML = A.mineForBrand(id);
    const study = el.querySelector(".study");
    if (study) el.insertBefore(sec, study); else el.appendChild(sec);
  };
})();
