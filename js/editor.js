/*
 * 編集画面：ブランド・デザイナー・用語集の追加と修正、GitHub への保存。
 * ルート: #/edit, #/edit/brand/<id|new>, #/edit/designer/<key|new>, #/edit/glossary, #/settings
 */
(function () {
  "use strict";

  const AN = window.AN;
  const A = AN.app;
  const esc = A.esc;
  const D = AN.data;
  const el = A.el;

  const go = (hash) => { if (location.hash === hash) A.route(); else location.hash = hash; };
  const flash = (msg, kind) => {
    const f = document.getElementById("flash");
    if (!f) return;
    f.textContent = msg;
    f.className = "flash show " + (kind || "");
    clearTimeout(flash.t);
    flash.t = setTimeout(() => (f.className = "flash"), 4000);
  };
  const csv = (s) => String(s || "").split(/[,、]/).map((x) => x.trim()).filter(Boolean);
  const lines = (s) => String(s || "").split("\n").map((x) => x.trim()).filter(Boolean);
  const numOrNull = (v) => (String(v).trim() === "" ? null : Number(v));
  const yearVal = (v) => { const t = String(v).trim(); return /^\d+$/.test(t) ? Number(t) : t; };

  function saveLocal(message) {
    if (!AN.commitLocal(message)) flash("ブラウザに保存できませんでした（容量不足またはプライベートモードの可能性）", "err");
    A.reindex();
    A.renderDraftBar();
  }

  // ---------- 汎用の行リスト編集 ----------
  // cols: [{k, label, type: text|num|year|area|check|select|dlist, options, list, w}]
  function cellHtml(c, v) {
    const val = v == null ? "" : v;
    const style = c.w ? ` style="flex-grow:${c.w}"` : "";
    const ph = esc(c.ph || c.label);
    switch (c.type) {
      case "area": return `<label class="lf"${style}><span>${esc(c.label)}</span><textarea data-k="${c.k}" rows="2" placeholder="${ph}">${esc(val)}</textarea></label>`;
      case "hidden": return `<input type="hidden" data-k="${c.k}" data-type="num" value="${esc(val)}">`;
      case "check": return `<label class="lf lf-check"><input type="checkbox" data-k="${c.k}" ${val ? "checked" : ""}><span>${esc(c.label)}</span></label>`;
      case "select": return `<label class="lf"${style}><span>${esc(c.label)}</span><select data-k="${c.k}">${c.options.map(([ov, ol]) => `<option value="${esc(ov)}" ${String(ov) === String(val) ? "selected" : ""}>${esc(ol)}</option>`).join("")}</select></label>`;
      case "img": return `<label class="lf lf-img"${style}><span>${esc(c.label)}</span><span class="imgrow"><input data-k="${c.k}" data-type="text" value="${esc(val)}" placeholder="${ph}"><button type="button" class="btn ghost small" data-act="upload">写真をアップロード</button></span></label>`;
      default: return `<label class="lf"${style}><span>${esc(c.label)}</span><input data-k="${c.k}" data-type="${c.type || "text"}" ${c.list ? `list="${c.list}"` : ""} ${c.type === "num" ? 'inputmode="numeric"' : ""} value="${esc(val)}" placeholder="${ph}"></label>`;
    }
  }
  function rowHtml(cols, r) {
    return `<div class="le-row"><div class="le-cells">${cols.map((c) => cellHtml(c, r[c.k])).join("")}</div>
      <div class="le-ctl"><button type="button" data-act="up" title="上へ">↑</button><button type="button" data-act="down" title="下へ">↓</button><button type="button" data-act="del" title="削除">✕</button></div></div>`;
  }
  function listEditor(name, title, rows, cols, help) {
    return `<fieldset class="le" data-list="${name}">
      <legend>${esc(title)}</legend>
      ${help ? `<p class="help">${help}</p>` : ""}
      <div class="le-rows">${(rows || []).map((r) => rowHtml(cols, r)).join("")}</div>
      <template>${rowHtml(cols, {})}</template>
      <button type="button" class="btn ghost small" data-act="add">＋ 行を追加</button>
    </fieldset>`;
  }
  function bindLists(form) {
    form.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-act]");
      if (!b) return;
      const le = b.closest(".le");
      const rows = le.querySelector(".le-rows");
      const row = b.closest(".le-row");
      const act = b.dataset.act;
      if (act === "upload") { uploadPhoto(b); return; }
      if (act === "add") {
        rows.insertAdjacentHTML("beforeend", le.querySelector("template").innerHTML);
        const first = rows.lastElementChild.querySelector("input,textarea,select");
        if (first) first.focus();
      } else if (act === "del") row.remove();
      else if (act === "up" && row.previousElementSibling) rows.insertBefore(row, row.previousElementSibling);
      else if (act === "down" && row.nextElementSibling) rows.insertBefore(row.nextElementSibling, row);
    });
  }
  // 写真を縮小して GitHub の images/ に保存し、URL欄に入れる
  function uploadPhoto(btn) {
    if (!AN.getSettings().token) { flash("写真のアップロードには GitHub の設定（トークン）が必要です", "err"); return; }
    const input = btn.parentElement.querySelector("input");
    const fileEl = document.createElement("input");
    fileEl.type = "file"; fileEl.accept = "image/*";
    fileEl.onchange = async () => {
      const file = fileEl.files[0]; if (!file) return;
      btn.disabled = true; btn.textContent = "アップロード中…";
      try {
        const blob = await shrink(file, 1200);
        const idEl = document.querySelector('#bf input[name="id"]');
        const slug = (idEl && idEl.value.trim()) || "photo";
        const path = `images/${slug}-${Date.now()}.jpg`;
        await AN.uploadFile(path, blob, `写真を追加: ${path}`);
        input.value = path;
        const row = btn.closest(".le-row");
        const lic = row && row.querySelector('[data-k="license"]');
        if (lic && !lic.value) lic.value = "自分で撮影";
        flash("写真をアップロードしました。忘れずに「保存（下書き）」と「GitHubに保存」をしてください。");
      } catch (e) { flash(e.message, "err"); }
      btn.disabled = false; btn.textContent = "写真をアップロード";
    };
    fileEl.click();
  }
  function shrink(file, max) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const r = Math.min(1, max / Math.max(img.width, img.height));
        const cv = document.createElement("canvas");
        cv.width = Math.round(img.width * r); cv.height = Math.round(img.height * r);
        cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
        cv.toBlob((bl) => (bl ? resolve(bl) : reject(new Error("画像を変換できませんでした"))), "image/jpeg", 0.85);
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => reject(new Error("画像を読み込めませんでした"));
      img.src = URL.createObjectURL(file);
    });
  }

  function readList(form, name) {
    const out = [];
    form.querySelectorAll(`.le[data-list="${name}"] .le-rows > .le-row`).forEach((row) => {
      const o = {};
      let filled = false;
      row.querySelectorAll("[data-k]").forEach((inp) => {
        const k = inp.dataset.k;
        if (inp.type === "checkbox") { if (inp.checked) o[k] = true; return; }
        const raw = inp.value.trim();
        if (raw !== "") filled = true;
        const t = inp.dataset.type;
        if (t === "num") o[k] = numOrNull(raw);
        else if (t === "year") { if (raw !== "") o[k] = yearVal(raw); }
        else if (raw !== "" || inp.tagName === "SELECT") o[k] = raw;
      });
      if (filled) out.push(o);
    });
    return out;
  }

  // ---------- ダッシュボード ----------
  function renderDashboard() {
    document.title = "編集 — Archive Notes";
    const st = (k) => ({ clean: "変更なし", dirty: "未保存の変更あり", pushed: "GitHubに保存済み（反映待ち）" }[AN.status(k)]);
    const dirty = AN.KINDS.some((k) => AN.status(k) === "dirty");
    const s = AN.getSettings();
    const log = AN.draftLog();
    el.innerHTML = `
      <p class="eyebrow">Edit</p>
      <h1>編集</h1>
      <p class="lead">ブランドやデザイナー、用語を追加・修正できます。変更はまずこのブラウザに下書きとして保存され、「GitHubに保存」を押すとリポジトリの <code>data/</code> にコミットされて公開サイトに反映されます。</p>

      <section class="panel">
        <h3>保存の状態</h3>
        <ul class="status">${AN.KINDS.map((k) => `<li><span class="dot ${AN.status(k)}"></span>${esc(AN.FILES[k].label)}（<code>${AN.FILES[k].path}</code>）：${st(k)}</li>`).join("")}</ul>
        ${log.length ? `<details><summary>この下書きでの変更（${log.length}件）</summary><ul class="log">${log.map((l) => `<li>${esc(l.message)} <span class="muted small">${esc(new Date(l.at).toLocaleString("ja-JP"))}${l.pushed ? "・保存済み" : ""}</span></li>`).join("")}</ul></details>` : ""}
        <div class="row-btns">
          <input id="cmsg" class="inp" placeholder="変更の説明（例: Guidiの創業年を修正）" ${dirty ? "" : "disabled"}>
          <button class="btn" id="push" ${dirty ? "" : "disabled"}>GitHubに保存</button>
          <button class="btn ghost" id="export">ファイルを書き出す</button>
          <button class="btn ghost danger" id="discard" ${AN.hasDraft() ? "" : "disabled"}>下書きを破棄</button>
        </div>
        <p class="muted small" id="pstatus">${s.token ? `保存先: ${esc(s.owner)}/${esc(s.repo)}（${esc(s.branch)}）` : `GitHubに保存するには<a href="#/settings">設定</a>でトークンを登録してください。登録しなくても「ファイルを書き出す」で手動アップロードできます。`}</p>
      </section>

      <h2>ブランド <span class="h2sub">${D.brands.length}件</span></h2>
      <div class="toolbar"><input type="search" id="eq" placeholder="ブランドを検索"><a class="btn" href="#/edit/brand/new">＋ 新しいブランド</a></div>
      <div class="elist" id="eb"></div>

      <h2>デザイナー <span class="h2sub">${Object.keys(D.designers).length}人</span></h2>
      <div class="toolbar"><input type="search" id="dq" placeholder="デザイナーを検索"><a class="btn" href="#/edit/designer/new">＋ 新しいデザイナー</a></div>
      <div class="elist" id="ed"></div>

      <h2>用語集 <span class="h2sub">${D.glossary.length}語</span></h2>
      <a class="btn ghost" href="#/edit/glossary">用語集を編集</a>

      <h2>設定</h2>
      <a class="btn ghost" href="#/settings">GitHub との接続設定</a>
    `;
    const drawB = (q) => {
      q = (q || "").toLowerCase();
      document.getElementById("eb").innerHTML = D.brands
        .filter((b) => !q || (b.name + b.ja + b.id).toLowerCase().includes(q))
        .map((b) => `<a href="#/edit/brand/${encodeURIComponent(b.id)}"><b>${esc(b.name)}</b><span>${esc(b.ja)}</span></a>`).join("");
    };
    const drawD = (q) => {
      q = (q || "").toLowerCase();
      document.getElementById("ed").innerHTML = Object.entries(D.designers)
        .filter(([k, d]) => !q || (k + d.ja + d.en).toLowerCase().includes(q))
        .sort((a, b) => a[1].ja.localeCompare(b[1].ja, "ja"))
        .map(([k, d]) => `<a href="#/edit/designer/${encodeURIComponent(k)}"><b>${esc(d.ja)}</b><span>${esc(d.en)}</span></a>`).join("");
    };
    document.getElementById("eq").addEventListener("input", (e) => drawB(e.target.value));
    document.getElementById("dq").addEventListener("input", (e) => drawD(e.target.value));
    drawB(""); drawD("");

    document.getElementById("export").addEventListener("click", () => {
      AN.KINDS.forEach((k) => {
        const blob = new Blob([AN.serialize(k)], { type: "text/javascript" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = AN.FILES[k].path.split("/").pop();
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      });
      flash("3つのファイルを書き出しました。リポジトリの data/ フォルダに置き換えてアップロードしてください。");
    });
    document.getElementById("discard").addEventListener("click", () => {
      if (!confirm("このブラウザの下書き（GitHubに保存していない変更）をすべて破棄して、公開中の内容に戻します。よろしいですか？")) return;
      AN.discard(); A.reindex(); A.renderDraftBar(); renderDashboard(); flash("下書きを破棄しました");
    });
    document.getElementById("push").addEventListener("click", async (e) => {
      const btn = e.currentTarget;
      if (!AN.getSettings().token) { go("#/settings"); return; }
      const msg = document.getElementById("cmsg").value.trim() || "サイトの編集画面から更新";
      const ps = document.getElementById("pstatus");
      btn.disabled = true;
      try {
        const r = await AN.saveToGitHub(msg, (t) => (ps.textContent = t),
          (k) => confirm(`GitHub上の ${AN.FILES[k].path} が、このブラウザで編集を始めた後に別の場所で変更されています。\nこのまま保存すると、その変更は上書きされます。上書きしますか？`));
        A.renderDraftBar();
        renderDashboard();
        flash(`GitHubの ${r.branch} ブランチに保存しました（${r.committed.map((k) => AN.FILES[k].label).join("・")}）。公開サイトへの反映には1〜数分かかります。`);
      } catch (err) {
        ps.textContent = err.message;
        ps.classList.add("err");
        btn.disabled = false;
        if (err.status === 401) flash("トークンが無効です。設定を確認してください。", "err");
      }
    });
  }

  // ---------- ブランド編集 ----------
  const designerList = () => `<datalist id="dkeys">${Object.entries(D.designers).map(([k, d]) => `<option value="${esc(k)}">${esc(d.ja)}（${esc(d.en)}）</option>`).join("")}</datalist>`;

  function renderBrandForm(id) {
    const isNew = id === "new";
    const src = isNew ? { origin: "import", tags: [], history: [], designers: [], items: [], archive: [], related: [], sources: [] } : D.brands.find((b) => b.id === id);
    if (!src) { el.innerHTML = `<p class="empty">ブランドが見つかりません。<a href="#/edit">編集トップへ</a></p>`; return; }
    const b = JSON.parse(JSON.stringify(src));
    document.title = (isNew ? "新しいブランド" : b.name + " を編集") + " — Archive Notes";
    el.innerHTML = `
      <a class="back" href="${isNew ? "#/edit" : "#/brand/" + encodeURIComponent(b.id)}">← 戻る</a>
      <h1>${isNew ? "新しいブランド" : esc(b.name) + " を編集"}</h1>
      <p class="lead">「保存」でこのブラウザに下書き保存されます。サイト全体に反映するには、そのあと編集トップで「GitHubに保存」を押してください。</p>
      ${designerList()}
      <form id="bf" class="eform" autocomplete="off">
        <fieldset><legend>基本情報</legend>
          <div class="grid2">
            <label class="lf"><span>ID（URL用・半角英数字とハイフン）*</span><input name="id" value="${esc(b.id || "")}" required pattern="[a-z0-9\\-]+" placeholder="例: ccp"></label>
            <label class="lf"><span>ブランド名 *</span><input name="name" value="${esc(b.name || "")}" required></label>
            <label class="lf"><span>読み（日本語）</span><input name="ja" value="${esc(b.ja || "")}"></label>
            <label class="lf"><span>区分</span><select name="origin"><option value="domestic" ${b.origin === "domestic" ? "selected" : ""}>国内（ドメスティック）</option><option value="import" ${b.origin !== "domestic" ? "selected" : ""}>海外（インポート）</option></select></label>
            <label class="lf"><span>国</span><input name="country" value="${esc(b.country || "")}"></label>
            <label class="lf"><span>拠点</span><input name="city" value="${esc(b.city || "")}"></label>
            <label class="lf"><span>創業年 *</span><input name="founded" value="${esc(b.founded || "")}" inputmode="numeric" required></label>
            <label class="lf"><span>タグ（カンマ区切り）</span><input name="tags" value="${esc((b.tags || []).join(", "))}" placeholder="アルチザン, レザー, メンズ"></label>
            <label class="lf"><span>別名・略称（カンマ区切り。検索に使う）</span><input name="aka" value="${esc((b.aka || []).join(", "))}" placeholder="例: CDG, ギャルソン"></label>
          </div>
          <label class="lf"><span>概要（短い説明）</span><textarea name="summary" rows="3">${esc(b.summary || "")}</textarea></label>
          <label class="lf"><span>ブランドについて（長い解説。空行で段落を分ける）</span><textarea name="about" rows="10">${esc(b.about || "")}</textarea></label>
          <label class="lf"><span>注記（資料の食い違い・未確認の点など）</span><textarea name="note" rows="2">${esc(b.note || "")}</textarea></label>
        </fieldset>
        ${listEditor("designers", "デザイナーの変遷", b.designers, [
          { k: "d", label: "デザイナー（キー）", list: "dkeys", w: 2, ph: "例: raf" },
          { k: "role", label: "役職", w: 2 },
          { k: "from", label: "就任年", type: "num", w: 1 },
          { k: "to", label: "退任年（空欄=現在）", type: "num", w: 1 }
        ], "デザイナーは候補から選びます。辞書にない人は先に<a href=\"#/edit/designer/new\">デザイナーを追加</a>するか、保存時の案内に従ってください。")}
        ${listEditor("history", "歴史（年表）", b.history, [
          { k: "year", label: "年", type: "year", w: 1 },
          { k: "text", label: "出来事", w: 6 },
          { k: "unverified", label: "未確認", type: "check" }
        ])}
        ${listEditor("collections", "コレクション（シーズン）", b.collections, [
          { k: "season", label: "シーズン", w: 2, ph: "2003SS / 2004-05AW" },
          { k: "title", label: "タイトル", w: 3 },
          { k: "city", label: "発表地", w: 1 },
          { k: "alias", label: "通称", w: 1 },
          { k: "note", label: "メモ", type: "area", w: 6 },
          { k: "unverified", label: "未確認", type: "check" }
        ])}
        ${listEditor("lines", "ライン", (b.lines || []).map((l, i) => ({ ...l, _i: i })), LINE_COLS, "ブランドの中のライン（例: HOMME PLUS、Y's、MM6）。歴史・名作シーズン・名作アイテムなどの詳細は、保存後に下のリンクから編集できます。")}
        ${isNew || !(b.lines || []).length ? "" : `<p class="help">ラインの詳細を編集：${b.lines.map((l, i) => `<a href="#/edit/line/${encodeURIComponent(b.id)}/${i}">${esc(l.name)}</a>`).join("・")}</p>`}
        ${listEditor("items", "代表的なアイテム", b.items, [
          { k: "name", label: "名前", w: 3 },
          { k: "year", label: "年・時期", type: "year", w: 1 },
          { k: "desc", label: "説明", type: "area", w: 6 },
          { k: "img", label: "写真のURL（またはアップロード）", type: "img", w: 4, ph: "https://... または images/..." },
          { k: "credit", label: "写真の撮影者・出典", w: 2 },
          { k: "license", label: "ライセンス", w: 1, ph: "例: CC BY-SA 4.0 / 自分で撮影" },
          { k: "imgPage", label: "写真の元ページURL", w: 3 },
          { k: "unverified", label: "未確認", type: "check" }
        ], "写真は、自分で撮ったもの、または自由に使ってよいライセンス（Wikimedia Commons の CC ライセンスなど）のものだけを使ってください。ブランド公式やショップ、雑誌の写真は無断で載せられません。")}
        ${listEditor("dating", "年代の見分け方", b.dating, [
          { k: "title", label: "見出し", w: 2, ph: "例: タグのAD表記" },
          { k: "text", label: "説明（空行で段落）", type: "area", w: 6 }
        ], "タグ・刻印・製造番号などから年代を見分ける手がかり。「見分け方」のページにも表示されます。")}
        <fieldset><legend>古着・アーカイブで見るポイント</legend>
          <textarea name="archive" rows="4" placeholder="1行に1つ">${esc((b.archive || []).join("\n"))}</textarea>
        </fieldset>
        <fieldset><legend>関連ブランド</legend>
          <div class="relgrid">${D.brands.filter((x) => x.id !== b.id).sort((x, y) => x.name.localeCompare(y.name)).map((x) => `<label><input type="checkbox" name="related" value="${esc(x.id)}" ${(b.related || []).includes(x.id) ? "checked" : ""}> ${esc(x.name)}</label>`).join("")}</div>
        </fieldset>
        ${listEditor("sources", "出典", b.sources, [
          { k: "t", label: "タイトル", w: 3 },
          { k: "u", label: "URL", w: 4 }
        ])}
        <div class="form-msg" id="fmsg"></div>
        <div class="row-btns sticky">
          <button class="btn" type="submit">保存（下書き）</button>
          <a class="btn ghost" href="${isNew ? "#/edit" : "#/brand/" + encodeURIComponent(b.id)}">キャンセル</a>
          ${isNew ? "" : `<button class="btn ghost danger" type="button" id="del">このブランドを削除</button>`}
        </div>
      </form>`;
    const form = document.getElementById("bf");
    bindLists(form);
    const msg = document.getElementById("fmsg");

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = form.elements;
      const nb = {
        id: f.id.value.trim(), name: f.name.value.trim(), ja: f.ja.value.trim(), origin: f.origin.value,
        country: f.country.value.trim(), city: f.city.value.trim(), founded: Number(f.founded.value),
        tags: csv(f.tags.value), aka: csv(f.aka.value), summary: f.summary.value.trim(), about: f.about.value.trim(),
        dating: readList(form, "dating"),
        history: readList(form, "history"),
        designers: readList(form, "designers"),
        collections: readList(form, "collections"),
        lines: mergeLines(src.lines || [], readList(form, "lines")),
        items: readList(form, "items"),
        archive: lines(f.archive.value),
        related: [...form.querySelectorAll('input[name="related"]:checked')].map((x) => x.value),
        note: f.note.value.trim(),
        sources: readList(form, "sources")
      };
      if (!nb.collections.length) delete nb.collections;
      if (!nb.lines.length) delete nb.lines;
      if (!nb.note) delete nb.note;
      if (!nb.aka.length) delete nb.aka;
      if (!nb.dating.length) delete nb.dating;
      // 検証
      const errs = [];
      if (!/^[a-z0-9-]+$/.test(nb.id)) errs.push("IDは半角の小文字英数字とハイフンで入力してください。");
      if (D.brands.some((x) => x.id === nb.id && x !== src)) errs.push(`ID「${nb.id}」は既に使われています。`);
      if (!nb.name) errs.push("ブランド名を入力してください。");
      if (!Number.isFinite(nb.founded) || nb.founded < 1000) errs.push("創業年を数字で入力してください。");
      nb.designers.forEach((t, i) => {
        if (!t.d) errs.push(`デザイナーの変遷 ${i + 1}行目: デザイナーを選んでください。`);
        if (!Number.isFinite(t.from)) errs.push(`デザイナーの変遷 ${i + 1}行目: 就任年を数字で入れてください。`);
        if (t.to != null && !Number.isFinite(t.to)) errs.push(`デザイナーの変遷 ${i + 1}行目: 退任年は数字か空欄にしてください。`);
        if (!t.role) t.role = "デザイナー";
      });
      nb.history.sort((x, y) => (Number(x.year) || 0) - (Number(y.year) || 0));
      const unknown = [...new Set(nb.designers.map((t) => t.d).filter((k) => k && !D.designers[k]))];
      if (errs.length) { msg.innerHTML = errs.map(esc).join("<br>"); msg.className = "form-msg err"; msg.scrollIntoView({ block: "center" }); return; }
      if (unknown.length) {
        if (!confirm(`デザイナー辞書にない「${unknown.join("」「")}」を新しいデザイナーとして登録します。名前などはあとでデザイナーの編集画面で直せます。続けますか？`)) return;
        unknown.forEach((k) => (D.designers[k] = { en: k, ja: k }));
      }
      // 保存
      if (isNew) D.brands.push(nb);
      else {
        const i = D.brands.indexOf(src);
        D.brands[i] = nb;
        if (src.id !== nb.id) D.brands.forEach((x) => { x.related = (x.related || []).map((r) => (r === src.id ? nb.id : r)); });
      }
      saveLocal(`${isNew ? "ブランドを追加" : "ブランドを修正"}: ${nb.name}`);
      flash("下書きに保存しました。サイトに反映するには編集トップで「GitHubに保存」を押してください。");
      go("#/brand/" + encodeURIComponent(nb.id));
    });

    const del = document.getElementById("del");
    if (del) del.addEventListener("click", () => {
      if (!confirm(`「${src.name}」を削除します。よろしいですか？（GitHubに保存するまでは下書きの破棄で元に戻せます）`)) return;
      D.brands.splice(D.brands.indexOf(src), 1);
      D.brands.forEach((x) => { x.related = (x.related || []).filter((r) => r !== src.id); });
      saveLocal(`ブランドを削除: ${src.name}`);
      flash("削除しました（下書き）");
      go("#/edit");
    });
  }

  // ---------- ライン ----------
  const LINE_COLS = [
    { k: "_i", type: "hidden" },
    { k: "name", label: "ライン名", w: 3 },
    { k: "from", label: "開始年", type: "num", w: 1 },
    { k: "to", label: "終了年（空欄=継続中）", type: "num", w: 1 },
    { k: "designer", label: "デザイン担当", w: 3 },
    { k: "desc", label: "説明", type: "area", w: 6 },
    { k: "unverified", label: "未確認", type: "check" }
  ];
  // ブランド編集画面の一覧で直した項目だけを上書きし、詳細（歴史・名作など）は残す
  function mergeLines(orig, rows) {
    return rows.map((r) => {
      const base = r._i != null && orig[r._i] ? orig[r._i] : {};
      const o = { ...base };
      LINE_COLS.forEach((c) => { if (c.k !== "_i") delete o[c.k]; });
      Object.assign(o, r);
      delete o._i;
      if (o.from == null) delete o.from;
      if (o.to == null) delete o.to;
      return o;
    });
  }

  function renderLineForm(brandId, idx) {
    const b = D.brands.find((x) => x.id === brandId);
    const i = Number(idx);
    const src = b && (b.lines || [])[i];
    if (!src) { el.innerHTML = `<p class="empty">ラインが見つかりません。<a href="#/edit">編集トップへ</a></p>`; return; }
    const l = JSON.parse(JSON.stringify(src));
    const back = `#/brand/${encodeURIComponent(b.id)}`;
    document.title = `${l.name} を編集 — Archive Notes`;
    el.innerHTML = `
      <a class="back" href="${back}">← ${esc(b.name)}</a>
      <h1>${esc(l.name)} を編集</h1>
      <p class="lead">${esc(b.name)} の中のラインです。「保存」でこのブラウザに下書き保存され、編集トップの「GitHubに保存」でサイトに反映されます。</p>
      <form id="lf" class="eform" autocomplete="off">
        <fieldset><legend>基本情報</legend>
          <div class="grid2">
            <label class="lf"><span>ライン名 *</span><input name="name" value="${esc(l.name)}" required></label>
            <label class="lf"><span>開始年</span><input name="from" value="${esc(l.from || "")}" inputmode="numeric"></label>
            <label class="lf"><span>終了年（空欄=継続中）</span><input name="to" value="${esc(l.to || "")}" inputmode="numeric"></label>
            <label class="lf"><span>デザイン担当</span><input name="designer" value="${esc(l.designer || "")}" placeholder="例: 川久保玲 → 田中啓一（1990〜2003）"></label>
          </div>
          <label class="lf"><span>説明</span><textarea name="desc" rows="4">${esc(l.desc || "")}</textarea></label>
          <label class="lf lf-check"><input type="checkbox" name="unverified" ${l.unverified ? "checked" : ""}><span>未確認</span></label>
        </fieldset>
        ${listEditor("history", "歴史（年表）", l.history, [
          { k: "year", label: "年", type: "year", w: 1 },
          { k: "text", label: "出来事", w: 6 }
        ])}
        ${listEditor("collections", "名作シーズン", l.collections, [
          { k: "season", label: "シーズン", w: 2, ph: "1994-95AW" },
          { k: "title", label: "タイトル・テーマ", w: 3 },
          { k: "alias", label: "通称", w: 1, ph: "縮絨期" },
          { k: "note", label: "メモ", type: "area", w: 6 },
          { k: "unverified", label: "未確認", type: "check" }
        ])}
        ${listEditor("items", "名作アイテム", l.items, [
          { k: "name", label: "名前", w: 3 },
          { k: "year", label: "年・時期", type: "year", w: 1 },
          { k: "desc", label: "説明", type: "area", w: 6 },
          { k: "img", label: "写真のURL（またはアップロード）", type: "img", w: 4 },
          { k: "credit", label: "写真の撮影者・出典", w: 2 },
          { k: "license", label: "ライセンス", w: 1 },
          { k: "imgPage", label: "写真の元ページURL", w: 3 },
          { k: "unverified", label: "未確認", type: "check" }
        ])}
        <fieldset><legend>古着で見るポイント</legend>
          <textarea name="archive" rows="4" placeholder="1行に1つ（タグの見分け方、年代判別など）">${esc((l.archive || []).join("\n"))}</textarea>
        </fieldset>
        <div class="row-btns sticky">
          <button class="btn" type="submit">保存（下書き）</button>
          <a class="btn ghost" href="${back}">キャンセル</a>
          <button class="btn ghost danger" type="button" id="del">このラインを削除</button>
        </div>
      </form>`;
    const form = document.getElementById("lf");
    bindLists(form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = form.elements;
      const nl = { name: f.name.value.trim() };
      if (!nl.name) { flash("ライン名を入力してください", "err"); return; }
      const from = numOrNull(f.from.value), to = numOrNull(f.to.value);
      if (from != null) nl.from = from;
      if (to != null) nl.to = to;
      if (f.designer.value.trim()) nl.designer = f.designer.value.trim();
      nl.desc = f.desc.value.trim();
      if (f.unverified.checked) nl.unverified = true;
      const h = readList(form, "history"), c = readList(form, "collections"), it = readList(form, "items"), a = lines(f.archive.value);
      if (h.length) nl.history = h.sort((x, y) => (Number(x.year) || 0) - (Number(y.year) || 0));
      if (c.length) nl.collections = c;
      if (it.length) nl.items = it;
      if (a.length) nl.archive = a;
      b.lines[i] = nl;
      saveLocal(`ラインを修正: ${b.name} / ${nl.name}`);
      flash("下書きに保存しました。");
      go(back);
    });
    document.getElementById("del").addEventListener("click", () => {
      if (!confirm(`「${l.name}」を削除します。よろしいですか？`)) return;
      b.lines.splice(i, 1);
      saveLocal(`ラインを削除: ${b.name} / ${l.name}`);
      go(back);
    });
  }

  // ---------- デザイナー編集 ----------
  function renderDesignerForm(key) {
    const isNew = key === "new";
    const src = isNew ? {} : D.designers[key];
    if (!src) { el.innerHTML = `<p class="empty">デザイナーが見つかりません。<a href="#/edit">編集トップへ</a></p>`; return; }
    const used = isNew ? [] : D.brands.filter((b) => (b.designers || []).some((t) => t.d === key));
    document.title = (isNew ? "新しいデザイナー" : src.ja + " を編集") + " — Archive Notes";
    el.innerHTML = `
      <a class="back" href="${isNew ? "#/edit" : "#/designer/" + encodeURIComponent(key)}">← 戻る</a>
      <h1>${isNew ? "新しいデザイナー" : esc(src.ja) + " を編集"}</h1>
      ${designerList()}
      <form id="df" class="eform" autocomplete="off">
        <fieldset><legend>デザイナー</legend>
          <div class="grid2">
            <label class="lf"><span>キー（半角英数字・ブランドから参照する名前）*</span><input name="key" value="${esc(isNew ? "" : key)}" ${isNew ? "" : "readonly"} required pattern="[a-z0-9_]+" placeholder="例: poell"></label>
            <label class="lf"><span>日本語表記 *</span><input name="ja" value="${esc(src.ja || "")}" required></label>
            <label class="lf"><span>英語表記 *</span><input name="en" value="${esc(src.en || "")}" required></label>
          </div>
          <div class="grid2">
            <label class="lf"><span>師（この人が下で働いた人のキー。カンマ区切り）</span><input name="mentors" list="dkeys" value="${esc((src.mentors || []).join(", "))}" placeholder="例: kawakubo, margiela"></label>
            <label class="lf"><span>別名・略称（カンマ区切り。検索に使う）</span><input name="aka" value="${esc((src.aka || []).join(", "))}"></label>
          </div>
          <label class="lf"><span>経歴（空行で段落を分ける）</span><textarea name="bio" rows="8">${esc(src.bio || "")}</textarea></label>
          ${isNew ? "" : `<p class="help">キーは変更できません（ブランドの「デザイナーの変遷」から参照されているため）。</p>`}
        </fieldset>
        ${used.length ? `<p class="muted small">このデザイナーが登場するブランド: ${used.map((b) => `<a href="#/edit/brand/${encodeURIComponent(b.id)}">${esc(b.name)}</a>`).join("、")}</p>` : ""}
        <div class="form-msg" id="fmsg"></div>
        <div class="row-btns">
          <button class="btn" type="submit">保存（下書き）</button>
          <a class="btn ghost" href="${isNew ? "#/edit" : "#/designer/" + encodeURIComponent(key)}">キャンセル</a>
          ${isNew ? "" : `<button class="btn ghost danger" type="button" id="del" ${used.length ? "disabled title=\"ブランドから参照されているため削除できません\"" : ""}>削除</button>`}
        </div>
      </form>`;
    const form = document.getElementById("df");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const f = form.elements;
      const k = f.key.value.trim();
      const msg = document.getElementById("fmsg");
      const errs = [];
      if (!/^[a-z0-9_]+$/.test(k)) errs.push("キーは半角の小文字英数字とアンダースコアで入力してください。");
      if (isNew && D.designers[k]) errs.push(`キー「${k}」は既に使われています。`);
      if (!f.ja.value.trim() || !f.en.value.trim()) errs.push("日本語表記と英語表記を入力してください。");
      if (errs.length) { msg.innerHTML = errs.map(esc).join("<br>"); msg.className = "form-msg err"; return; }
      const d = { en: f.en.value.trim(), ja: f.ja.value.trim() };
      if (f.bio.value.trim()) d.bio = f.bio.value.trim();
      const ms = csv(f.mentors.value).filter((m) => m !== k);
      const bad = ms.filter((m) => !D.designers[m]);
      if (bad.length) { msg.innerHTML = esc("師のキーが見つかりません: " + bad.join(", ")); msg.className = "form-msg err"; return; }
      if (ms.length) d.mentors = ms;
      if (csv(f.aka.value).length) d.aka = csv(f.aka.value);
      D.designers[k] = d;
      saveLocal(`${isNew ? "デザイナーを追加" : "デザイナーを修正"}: ${d.ja}`);
      flash("下書きに保存しました。");
      go(used.length ? "#/designer/" + encodeURIComponent(k) : "#/edit");
    });
    const del = document.getElementById("del");
    if (del) del.addEventListener("click", () => {
      if (!confirm(`「${src.ja}」を削除します。よろしいですか？`)) return;
      delete D.designers[key];
      saveLocal(`デザイナーを削除: ${src.ja}`);
      go("#/edit");
    });
  }

  // ---------- 用語集編集 ----------
  function renderGlossaryForm() {
    document.title = "用語集を編集 — Archive Notes";
    const rows = D.glossary.map((g) => ({ ...g, tags: (g.tags || []).join(", ") }));
    el.innerHTML = `
      <a class="back" href="#/glossary">← 用語集</a>
      <h1>用語集を編集</h1>
      <form id="gf" class="eform">
        ${listEditor("glossary", "用語", rows, [
          { k: "term", label: "用語", w: 2 },
          { k: "reading", label: "読み・原語", w: 2 },
          { k: "tags", label: "分類（カンマ区切り）", w: 1 },
          { k: "desc", label: "説明", type: "area", w: 6 }
        ], "↑↓ で並べ替えできます。")}
        <div class="row-btns sticky"><button class="btn" type="submit">保存（下書き）</button><a class="btn ghost" href="#/glossary">キャンセル</a></div>
      </form>`;
    const form = document.getElementById("gf");
    bindLists(form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const list = readList(form, "glossary").filter((g) => g.term).map((g) => ({ term: g.term, reading: g.reading || "", desc: g.desc || "", tags: csv(g.tags) }));
      D.glossary.splice(0, D.glossary.length, ...list);
      saveLocal("用語集を更新");
      flash("下書きに保存しました。");
      go("#/glossary");
    });
  }

  // ---------- 設定 ----------
  function renderSettings() {
    document.title = "設定 — Archive Notes";
    const s = AN.getSettings();
    el.innerHTML = `
      <a class="back" href="#/edit">← 編集</a>
      <h1>GitHub との接続設定</h1>
      <p class="lead">編集した内容を、このサイトのリポジトリに直接保存（コミット）するための設定です。設定はこのブラウザにだけ保存されます。</p>
      <form id="sf" class="eform" autocomplete="off">
        <fieldset><legend>保存先</legend>
          <div class="grid2">
            <label class="lf"><span>オーナー（ユーザー名）</span><input name="owner" value="${esc(s.owner)}"></label>
            <label class="lf"><span>リポジトリ</span><input name="repo" value="${esc(s.repo)}"></label>
            <label class="lf"><span>ブランチ（空欄＝main）</span><input name="branch" value="${esc(s.branch)}" placeholder="例: main"></label>
          </div>
          <p class="help">GitHub Pages で公開しているブランチを指定してください。</p>
        </fieldset>
        <fieldset><legend>アクセストークン</legend>
          <label class="lf"><span>Fine-grained personal access token</span><input name="token" type="password" value="${esc(s.token)}" placeholder="github_pat_..."></label>
          <details class="help"><summary>トークンの作り方</summary>
            <ol>
              <li>GitHub で Settings → Developer settings → Personal access tokens → <b>Fine-grained tokens</b> → Generate new token</li>
              <li>Repository access で <b>Only select repositories</b> を選び、このサイトのリポジトリだけを選ぶ</li>
              <li>Permissions の Repository permissions で <b>Contents</b> を <b>Read and write</b> にする（他は不要）</li>
              <li>有効期限を決めて作成し、表示されたトークンを上の欄に貼り付ける</li>
            </ol>
            <p>トークンはこのブラウザの localStorage にだけ保存され、GitHub の API 以外には送られません。ただし共用のパソコンでは登録しないでください。不要になったら GitHub 側で削除できます。</p>
          </details>
        </fieldset>
        <div class="row-btns">
          <button class="btn" type="submit">設定を保存</button>
          <button class="btn ghost" type="button" id="test">接続テスト</button>
          <button class="btn ghost danger" type="button" id="forget">トークンを削除</button>
        </div>
        <p class="muted small" id="tres"></p>
      </form>`;
    const form = document.getElementById("sf");
    const read = () => { const f = form.elements; return { owner: f.owner.value.trim(), repo: f.repo.value.trim(), branch: f.branch.value.trim(), token: f.token.value.trim() }; };
    form.addEventListener("submit", (e) => { e.preventDefault(); AN.setSettings(read()); flash("設定を保存しました"); });
    document.getElementById("forget").addEventListener("click", () => { const v = read(); v.token = ""; AN.setSettings(v); renderSettings(); flash("トークンを削除しました"); });
    document.getElementById("test").addEventListener("click", async () => {
      AN.setSettings(read());
      const out = document.getElementById("tres");
      out.className = "muted small";
      out.textContent = "確認中…";
      try {
        const r = await AN.testConnection();
        out.textContent = `接続できました: ${r.fullName}（既定のブランチ: ${r.defaultBranch}）。${r.canPush ? "書き込み権限があります。" : "書き込み権限がありません。トークンの Contents を Read and write にしてください。"}`;
        if (!r.canPush) out.className = "small err";
      } catch (err) { out.textContent = err.message; out.className = "small err"; }
    });
  }

  // ---------- ルート登録 ----------
  A.routes.edit = (sub, id, extra) => {
    if (sub === "line") renderLineForm(id, extra);
    else if (sub === "brand") renderBrandForm(id || "new");
    else if (sub === "designer") renderDesignerForm(id || "new");
    else if (sub === "glossary") renderGlossaryForm();
    else renderDashboard();
  };
  A.routes.settings = renderSettings;
  Object.assign(A, { flash, saveLocal, uploadPhoto, listEditor, bindLists, readList, csv });
})();
