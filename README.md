# クリニカルラウンジ（GitHub Pages）

## 公開のしくみ

このフォルダは **独立した Git リポジトリのルート**です（`Clinical-Lounge`）。
GitHub Pages 用のワークフローはこのフォルダの中にあります。

`.github/workflows/deploy-pages.yml`（名前: **Deploy Clinical Lounge (GitHub Pages)**）

`main` へ push すると、リポジトリ直下がサイトのルートとして公開されます。
`rsync` で `_site` に集める際、次のものは**サイトに含めません**。

`.git` / `.github` / `README.md` / `思考アウトプット.md` / `.gitignore`

公開 URL:

`https://kwatanabe1028-star.github.io/Clinical-Lounge/`  
→ ルートの `index.html` から `portal/index.html` にリダイレクトされます。

### 公開されたかの確かめ方

```sh
gh run list --limit 1
curl -s https://kwatanabe1028-star.github.io/Clinical-Lounge/portal/desks.json | head -3
```

`desks.json` の `version` が上がっていれば反映済みです。

### 注意（過去にここで事故があった）

- Pages の **Source は「GitHub Actions」**（Settings → Pages）。
  この設定のままワークフローを消すと、**push しても何も公開されないまま無言で止まります**。
  実際 2026-05-28 から 09-03 まで、この状態で公開が止まっていました。
- ワークフローの `permissions:` にある `pages: write` と `id-token: write` を消さないこと。
  リポジトリ既定のワークフロー権限が `read` のため、ここで明示しないとデプロイが権限エラーで落ちます。

## デザイン（共通）

見た目は **`assets/lounge.css` と `assets/lounge.js` の2本**に集約しています。ポータルも各ツールも、この2本を読み込んだうえでページ固有の CSS だけを自前の `<style>` に持ちます。

- `assets/lounge.css` — 配色・書体のトークン、共通部品（ヘッダー / パンくず / 見出し / パネル / カード / ボタン / 表 / 入力欄 / バッジ / フッター）
- `assets/lounge.js` — 共通ヘッダーとフッターの生成、スクロール演出

新しいツールを足すときは、既存ツールの `<head>`（Google Fonts ＋ `../assets/lounge.css`）と `<body>` の骨格をそのまま真似るのが早道です。ページ側は `<body>` の data 属性で位置を伝えます。

```html
<body data-lg-root=".." data-lg-desk="デスク名" data-lg-page="ページ名">
<div id="lg-header"></div>
<main>
  <div class="container">
    <div id="lg-crumb"></div>
    ...
  </div>
</main>
<div id="lg-footer"></div>
<script src="../assets/lounge.js"></script>
```

進捗やスコアなどページ固有の表示をヘッダー右に出したい場合は、その要素に `data-lg-header-slot` を付けておくと `lounge.js` がヘッダー内へ移動します。

補足: 数字を欧文書体（Cormorant Infant）で出すときは `font-variant-numeric` を **指定しない**でください。既定のままなら 0123456789 の読みやすい字形になりますが、指定すると 0 と o・1 と I が紛らわしい字形に変わります。

## 検索とお知らせ

ポータルの検索とお知らせは、どちらもサーバーを使わずブラウザの中だけで動きます。

**検索** — `portal/desks.json` の各ツールの `keywords`（任意・文字列配列）が対象に含まれます。
ツール名に出てこない現場の呼び方をここに足しておくと引けるようになります。

```json
"keywords": ["ジアゼパム", "DZP", "デパス", "睡眠薬", "減薬"]
```

検索語も検索対象も、照合前に同じ形に均されます。**全角・小文字・ひらがなのどれで打っても一致します**。

```
「ＭＥＬＤ」→ NFKC 正規化    → 「MELD」
「Meld」   → 小文字化        → 「meld」
「じあぜぱむ」→ ひらがな→カタカナ → 「ジアゼパム」
```

空白で区切ると AND 一致（例: `退院 症例` は両方を含むツールだけ）。

**お知らせ** — `portal/news.json` を編集します。新しいものを配列の先頭に足してください。

```json
{ "date": "2026-09-03", "category": "新ツール",
  "title": "見出し", "body": "本文（省略可）",
  "href": "../フォルダ名/ファイル名.html" }
```

`href` が空文字ならリンクにならず、ただの記事行になります。`category` は自由に付けられ、
`新ツール`＝緑 / `更新`＝青 / `サイト`＝グレー の色が付きます（他の語は既定色）。
既定の表示は最新5件で、6件以上あると「もっと見る」が出ます。

## 更新の流れ

1. `portal/desks.json` や `portal/news.json`、各ツール HTML を編集する（新しいツール用フォルダを **このフォルダ（クリニカルラウンジ）直下** に追加すれば、ワークフローが公開物に含めます。サイトからは `.git` / `.github` / `README.md` を除外します）。
2. **`python3 portal/sync_manifest.py` を実行する**（`desks.json` と `news.json` から `file://` 用の `manifest.js` を作り直します。JSON を触ったら毎回必要です）。
3. `CHANGELOG.md` に一言追記する。
4. `git add` / `git commit` / `git push` — Actions が再デプロイする。

## 注意

- リポジトリに **患者・個人が特定される情報** を含めないでください。
- 院内規程で「ソースを GitHub に置けない」場合は、院内の静的ホスティングに切り替えてください。
