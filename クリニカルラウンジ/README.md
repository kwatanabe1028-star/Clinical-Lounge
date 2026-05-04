# クリニカルラウンジ（GitHub Pages）

## いまの Vault 構成（`06_product` リポジトリ）

このフォルダは **`06_product` Git リポジトリの一部**です。GitHub Pages 用のワークフローは **リポジトリルート** の次にあります。

`../.github/workflows/deploy-pages.yml`（名前: **Deploy Clinical Lounge (GitHub Pages)**）

`main` へ push すると、`クリニカルラウンジ/` の中身だけがサイトのルートとして公開されます（`README.md` はサイトには含めません）。

### 初回（GitHub 側）

1. リポジトリ **Settings → Pages** を開く。
2. **Source** で **GitHub Actions** を選ぶ。
3. **Actions** で「Deploy Clinical Lounge (GitHub Pages)」が成功したら、表示された URL を開く。

公開 URLの例（プロジェクトサイト）:

`https://<YOUR_USER>.github.io/<REPO>/`  
→ ルートの `index.html` から `portal/index.html` にリダイレクトされます。

---

## このフォルダだけを別リポジトリにしたい場合

1. 新規リポジトリのルートに、この `クリニカルラウンジ` の中身をそのまま置く。
2. ルートに `.github/workflows/deploy-pages.yml` を置く（`rsync` のソースを `./` にした版に差し替える）。
3. 上記と同様に Pages の Source を **GitHub Actions** にする。

## 更新の流れ

1. `portal/desks.json` や各ツール HTML を編集する（新しいツール用フォルダをリポジトリ直下に追加しても、ワークフローが自動で公開物に含めます。`.git` / `.github` / `README.md` は除外されます）。
2. `file://` 向けに `portal/manifest.js` を使う場合は `python3 portal/sync_manifest.py` を実行する。
3. `CHANGELOG.md` に一言追記する。
4. `git add` / `git commit` / `git push` — Actions が再デプロイする。

## 注意

- リポジトリに **患者・個人が特定される情報** を含めないでください。
- 院内規程で「ソースを GitHub に置けない」場合は、院内の静的ホスティングに切り替えてください。
