/* ==========================================================================
   Clinical Lounge — 共通スクリプト
     ・全ページ共通のヘッダー／フッターを生成して差し込む
     ・スクロールに応じた .lg-reveal のフェードアップ

   ページ側の指定は <body> の data 属性で行う。
     data-lg-root  … サイトルートへの相対パス（既定 ".."）
     data-lg-desk  … パンくずの中間項目（デスク名。任意）
     data-lg-page  … パンくずの現在地（ページ名。省略時は <title>）
     data-lg-home  … "1" を指定するとポータル扱い（パンくずを出さない）

   ページ固有のウィジェットをヘッダー右に出したいときは、その要素に
   data-lg-header-slot を付けておくと、この JS がヘッダー内へ移動する。
   ========================================================================== */
(function () {
  "use strict";

  var body = document.body;
  if (!body) { return; }

  var root = body.getAttribute("data-lg-root") || "..";
  var isHome = body.getAttribute("data-lg-home") === "1";
  var deskName = body.getAttribute("data-lg-desk") || "";
  var pageName = body.getAttribute("data-lg-page") || document.title || "";

  function url(path) {
    return root.replace(/\/+$/, "") + "/" + path.replace(/^\/+/, "");
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text != null) { node.textContent = text; }
    return node;
  }

  /* ---- ロゴ -------------------------------------------------------------- */
  function buildLogo() {
    var a = el("a", "lg-logo");
    a.href = url("portal/index.html");
    a.setAttribute("lang", "en");
    a.appendChild(el("span", "lg-logo__mark"));
    a.appendChild(el("span", null, "Clinical Lounge"));
    return a;
  }

  /* ---- ヘッダー ---------------------------------------------------------- */
  function buildHeader() {
    var header = el("header", "lg-header");
    var inner = el("div", "lg-header__inner");

    inner.appendChild(buildLogo());

    var nav = el("nav", "lg-header__nav");
    nav.setAttribute("aria-label", "サイト内");

    // ページ固有ウィジェット（進捗・スコアなど）をヘッダーへ引き上げる
    var slotted = document.querySelector("[data-lg-header-slot]");
    if (slotted) {
      slotted.removeAttribute("data-lg-header-slot");
      nav.appendChild(slotted);
    }

    if (isHome) {
      // secondary は幅の狭い画面では隠す（CSS 側で制御）
      [
        ["#desks", "診療デスク", "primary"],
        ["#about", "このサイトについて", "secondary"]
      ].forEach(function (item) {
        var a = el("a", null, item[1]);
        a.href = item[0];
        a.setAttribute("data-lg-nav", item[2]);
        nav.appendChild(a);
      });
    } else {
      var back = el("a", null, "デスク一覧へ");
      back.href = url("portal/index.html");
      nav.appendChild(back);
    }

    // 姉妹サイトへのリンク（Clinical Lounge ⇄ Critical Lounge）。どのページのヘッダーにも出す
    var sister = el("a", "lg-sister", "Critical Lounge ↗");
    sister.href = "https://kwatanabe1028-star.github.io/Critical-Lounge/portal/index.html";
    sister.title = "集中治療の姉妹サイト Critical Lounge へ";
    sister.setAttribute("lang", "en");
    sister.setAttribute("data-lg-nav", "sister");
    nav.appendChild(sister);

    inner.appendChild(nav);
    header.appendChild(inner);
    return header;
  }

  /* ---- パンくず ---------------------------------------------------------- */
  function buildCrumb() {
    if (isHome) { return null; }
    var ol = el("ol", "lg-crumb");

    var liHome = el("li");
    var aHome = el("a", null, "Clinical Lounge");
    aHome.href = url("portal/index.html");
    aHome.setAttribute("lang", "en");
    liHome.appendChild(aHome);
    ol.appendChild(liHome);

    if (deskName) {
      var liDesk = el("li");
      var aDesk = el("a", null, deskName);
      aDesk.href = url("portal/index.html#desks");
      liDesk.appendChild(aDesk);
      ol.appendChild(liDesk);
    }

    var liNow = el("li");
    var spanNow = el("span", null, pageName);
    spanNow.setAttribute("aria-current", "page");
    liNow.appendChild(spanNow);
    ol.appendChild(liNow);

    var navEl = el("nav");
    navEl.setAttribute("aria-label", "現在地");
    navEl.appendChild(ol);
    return navEl;
  }

  /* ---- フッター ---------------------------------------------------------- */
  var FOOTER_LINKS = [
    {
      en: "Clinical Desks",
      items: [
        ["portal/index.html#desks", "診療デスク一覧"],
        ["高齢者退院ケーススタディ/高齢者退院ケーススタディ.html", "高齢者退院ケーススタディ"],
        ["周術期肝硬変_ACG/周術期肝硬変_ACG_周術期リスク補助ツール.html", "肝硬変 周術期リスク補助ツール"]
      ]
    },
    {
      en: "Tools",
      items: [
        ["ベンゾジアゼピン系薬剤の換算/benzo_calculator.html", "ベンゾジアゼピン換算"],
        ["高齢者うつチェックリスト/高齢者うつ病評価統合シート.html", "高齢者うつ病評価統合シート"]
      ]
    },
    {
      en: "Sister Site",
      items: [
        ["https://kwatanabe1028-star.github.io/Critical-Lounge/portal/index.html", "Critical Lounge（集中治療を学ぶ）"]
      ]
    }
  ];

  function buildFooter() {
    var footer = el("footer", "lg-footer");
    var inner = el("div", "lg-footer__inner");

    var brand = el("div", "lg-footer__brand");
    brand.appendChild(buildLogo());
    var tag = el("p", "lg-footer__tag",
      "臨床の判断を助ける小さな道具を、役割・分野ごとのデスクにまとめた入口です。表示は診療の代替ではありません。");
    brand.appendChild(tag);
    inner.appendChild(brand);

    var nav = el("nav", "lg-footer__nav");
    nav.setAttribute("aria-label", "サイトマップ");
    FOOTER_LINKS.forEach(function (col) {
      var section = el("div", "lg-footer__col");
      var h = el("h2", null, col.en);
      h.setAttribute("lang", "en");
      section.appendChild(h);
      var ul = el("ul");
      col.items.forEach(function (item) {
        var li = el("li");
        var a = el("a", null, item[1]);
        a.href = /^https?:/.test(item[0]) ? item[0] : url(item[0]);
        li.appendChild(a);
        ul.appendChild(li);
      });
      section.appendChild(ul);
      nav.appendChild(section);
    });
    inner.appendChild(nav);
    footer.appendChild(inner);

    var bottom = el("div", "lg-footer__bottom");
    var left = el("p", null, "Clinical Lounge — 院内向け臨床補助ツール集");
    left.style.margin = "0";
    var right = el("p", null, "");
    right.style.margin = "0";
    right.id = "lg-footer-meta";
    bottom.appendChild(left);
    bottom.appendChild(right);
    footer.appendChild(bottom);

    return footer;
  }

  /* ---- スクロール演出 ---------------------------------------------------- */
  function initReveal() {
    var targets = document.querySelectorAll(".lg-reveal");
    if (!targets.length) { return; }

    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      Array.prototype.forEach.call(targets, function (n) { n.classList.add("is-in"); });
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

    Array.prototype.forEach.call(targets, function (n) { io.observe(n); });
  }

  /* ---- 組み立て ---------------------------------------------------------- */
  function mount() {
    // ヘッダー：placeholder があればそこへ、なければ body 先頭へ
    var headerHost = document.getElementById("lg-header");
    var header = buildHeader();
    if (headerHost) {
      headerHost.replaceWith(header);
    } else {
      body.insertBefore(header, body.firstChild);
    }

    // パンくず：placeholder があるときだけ差し込む
    var crumbHost = document.getElementById("lg-crumb");
    if (crumbHost) {
      var crumb = buildCrumb();
      if (crumb) { crumbHost.replaceWith(crumb); } else { crumbHost.remove(); }
    }

    // フッター：placeholder があればそこへ、なければ body 末尾へ
    var footerHost = document.getElementById("lg-footer");
    var footer = buildFooter();
    if (footerHost) {
      footerHost.replaceWith(footer);
    } else {
      body.appendChild(footer);
    }

    initReveal();
  }

  // 公開 API：ポータルが版情報をフッターに出すために使う
  window.Lounge = {
    setFooterMeta: function (text) {
      var node = document.getElementById("lg-footer-meta");
      if (node) { node.textContent = text; }
    },
    revealAll: initReveal
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mount);
  } else {
    mount();
  }
})();
