/* ==========================================================================
   固定の目次（tocbar）
   ヘッダーの下に、章のボタンの帯と「目次」の一覧を出す。

   使い方：
     <link rel="stylesheet" href="../assets/tocbar.css">            （lounge.css の後）
     <nav class="tocbar" id="tocbar" aria-label="章へ移動"></nav>    （#lg-header の直後）
     <script src="../assets/tocbar.js"></script>                    （lounge.js の後）

   項目の元（上から順に見る）：
     1. <nav id="tocbar" data-items='[["id","短い名前","正式な名前"], …]'>
        ["sel:CSS セレクタ"] と書くと、その見出し（id つき）を並べる（名前は見出しの文）
     2. ページの目次 ul.toc・nav.toc のリンク。短い名前は data-short（なければリンクの文）
   いま画面にない項目（畳まれた区画・別の画面）は出さない。1つもなければ帯ごと隠す。
   --hd-h＝ヘッダーの実測の高さ、--stick-h＝ヘッダー＋帯。固定の枠の位置に使う。
   ========================================================================== */
(function () {
  "use strict";
  var bar = document.getElementById("tocbar"), root = document.documentElement;
  if (!bar) return;
  function mk(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }
  function shown(e) { return !!e && e.getClientRects().length > 0; }

  function source() {
    var out = [], raw = bar.getAttribute("data-items");
    if (raw) {
      JSON.parse(raw).forEach(function (x) {
        if (x[0].indexOf("sel:") === 0) {
          Array.prototype.forEach.call(document.querySelectorAll(x[0].slice(4)), function (e) {
            var t = e.textContent.trim();
            if (e.id) out.push({ id: e.id, no: "", short: t.replace(/（.*?）/g, ""), full: t });
          });
        } else out.push({ id: x[0], no: "", short: x[1], full: x[2] || x[1] });
      });
      out.forEach(function (x, i) { x.no = String(i + 1); });
    } else {
      if (document.getElementById("brief")) out.push({ id: "brief", no: "★", short: "要点", full: "1分でわかるキーポイント" });
      Array.prototype.forEach.call(document.querySelectorAll("ul.toc a[href^='#'], nav.toc a[href^='#']"), function (a, i) {
        var n = a.querySelector(".n"), no = n ? n.textContent : "", full = (no ? a.textContent.replace(no, "") : a.textContent).trim();
        out.push({ id: a.getAttribute("href").slice(1), no: no || String(i + 1), full: full, short: a.getAttribute("data-short") || full });
      });
    }
    return out.filter(function (x) { x.el = document.getElementById(x.id); if (x.el) x.el = x.el.closest(".lg-card") || x.el; return shown(x.el); });
  }

  var row = mk("div", "tocbar__row"), btn = mk("button", "tocbar__btn"), chips = mk("div", "tocbar__chips"), panel = mk("div", "tocbar__panel"), ul = mk("ul");
  btn.type = "button"; btn.appendChild(mk("i")); btn.appendChild(document.createTextNode("目次"));
  btn.setAttribute("aria-expanded", "false"); btn.setAttribute("aria-controls", "tocbar-panel");
  panel.id = "tocbar-panel"; panel.hidden = true;
  panel.appendChild(ul); row.appendChild(btn); row.appendChild(chips); bar.appendChild(row); bar.appendChild(panel);

  var items = [], sig = null, stick = 0, cur = null, picked = decodeURIComponent(location.hash.slice(1)), tick = false;

  function build() {
    var next = source(), s = next.map(function (x) { return x.id + "|" + x.short; }).join(",");
    if (s === sig) { items.forEach(function (x, i) { x.el = next[i].el; }); return; }
    sig = s; items = next; cur = null; chips.textContent = ""; ul.textContent = "";
    items.forEach(function (x) {
      x.chip = mk("a"); x.chip.href = "#" + x.id; x.chip.appendChild(mk("span", "", x.short));
      if (x.short !== x.full) x.chip.setAttribute("aria-label", x.full);
      chips.appendChild(x.chip);
      x.row = mk("a"); x.row.href = "#" + x.id; x.row.appendChild(mk("span", "n", x.no)); x.row.appendChild(mk("span", "", x.full));
      var li = mk("li"); li.appendChild(x.row); ul.appendChild(li);
    });
    if (!items.length) open(false);
    bar.hidden = !items.length;
  }
  function open(v) { panel.hidden = !v; btn.setAttribute("aria-expanded", v ? "true" : "false"); }
  // 章へ飛ぶ。overflow: hidden の枠の中の見出しは scroll-margin が効かないブラウザがあるので、位置は自分で計算する
  function goTo(id, instant) {
    var e = document.getElementById(id); if (!e) return false;
    for (var d = e; d; d = d.parentElement) if (d.tagName === "DETAILS") d.open = true;
    if (!shown(e)) return false;
    picked = id;
    var box = e.closest(".lg-card") || e;                     // 入口のカードは、カードの上端に合わせる
    var top = box.getBoundingClientRect().top, h = e.querySelector(".lg-secttl"), off = h ? h.getBoundingClientRect().top - top : 0;
    if (off > 40 && off < 140) top += off;                    // 区画の上の余白が広いときは見出しに合わせる
    for (var p = box; p && window.DOMMatrix; p = p.parentElement) {     // 出てくる動きの途中のずれを引く
      var tf = getComputedStyle(p).transform;
      if (tf && tf !== "none") top -= new DOMMatrix(tf).m42;
    }
    window.scrollTo({ top: Math.max(0, top + window.scrollY - stick - 14), behavior: instant ? "instant" : "auto" });
    req();
    return true;
  }
  btn.addEventListener("click", function () { open(panel.hidden); });
  // 帯・一覧・ページ内のリンクは、どれも同じ位置に止める
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href^='#']");
    if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var id = decodeURIComponent(a.getAttribute("href").slice(1));
    if (!id || !goTo(id)) return;
    e.preventDefault(); open(false);
    if (location.hash !== "#" + id) history.pushState(null, "", "#" + id);
    if (!e.detail) {                                          // キーボードで選んだときは、続きの Tab を飛び先から始める
      var t = document.getElementById(id);
      if (!t.hasAttribute("tabindex") && !/^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(t.tagName)) t.setAttribute("tabindex", "-1");
      t.focus({ preventScroll: true });
    }
  });
  document.addEventListener("pointerdown", function (e) { if (!panel.hidden && !bar.contains(e.target)) open(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !panel.hidden) { open(false); btn.focus(); } });

  function size() {
    var hd = document.querySelector(".lg-header"), h = hd ? Math.round(hd.getBoundingClientRect().height) : 0;
    stick = h + (bar.hidden ? 0 : Math.round(row.getBoundingClientRect().height) + 1);
    root.style.setProperty("--hd-h", h + "px");
    root.style.setProperty("--stick-h", stick + "px");
  }
  function mark() {
    tick = false;
    if (!items.length) return;
    var line = stick + 40, now = items[0], top = {};
    items.forEach(function (x) { top[x.id] = x.el.getBoundingClientRect().top; if (top[x.id] <= line) now = x; });
    var end = window.innerHeight + window.scrollY >= root.scrollHeight - 2, sel = null;
    items.forEach(function (x) { if (x.id === picked) sel = x; });
    // 横に並ぶ章（高さが同じ）と、ページの終わりで上まで届かない章は、選んだ章を優先する
    if (sel && ((top[sel.id] <= line && Math.abs(top[now.id] - top[sel.id]) < 30) || (end && top[sel.id] >= stick - 2 && top[sel.id] < window.innerHeight))) now = sel;
    if (now === cur) return;
    if (cur) [cur.chip, cur.row].forEach(function (e) { e.classList.remove("is-cur"); e.removeAttribute("aria-current"); });
    cur = now;
    [cur.chip, cur.row].forEach(function (e) { e.classList.add("is-cur"); e.setAttribute("aria-current", "true"); });
    chips.scrollLeft = cur.chip.offsetLeft - (chips.clientWidth - cur.chip.offsetWidth) / 2;
  }
  function req() { if (!tick) { tick = true; requestAnimationFrame(mark); } }
  var later = false;
  function refresh() { if (!later) { later = true; requestAnimationFrame(function () { later = false; build(); size(); mark(); }); } }

  build(); size(); mark();
  window.addEventListener("scroll", req, { passive: true });
  window.addEventListener("hashchange", function () { picked = decodeURIComponent(location.hash.slice(1)); req(); });
  window.addEventListener("resize", refresh);
  window.addEventListener("load", function () { refresh(); if (picked) requestAnimationFrame(function () { goTo(picked, true); }); });
  var main = document.querySelector("main") || document.body;
  if ("ResizeObserver" in window) {
    var ro = new ResizeObserver(refresh); ro.observe(main);
    var hd = document.querySelector(".lg-header"); if (hd) ro.observe(hd);
  }
  if ("MutationObserver" in window) new MutationObserver(refresh).observe(main, { childList: true, subtree: true });
})();
