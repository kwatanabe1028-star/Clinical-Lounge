# クリニカルラウンジ（GitHub Pages 用）

このフォルダを **GitHub リポジトリのルート** として公開すると、GitHub Pages で HTTPS の URL から利用できます。

## 初回セットアップ

1. GitHub で **新しいリポジトリ** を作成する（名前は任意。例: `clinical-lounge`）。
2. このディレクトリで Git を初期化し、`main` ブランチを push する。

   ```bash
   cd "/Users/watanabe/.../06_product/クリニカルラウンジ"
   git init -b main
   git add .
   git commit -m "Initial publish: Clinical Lounge portal"
   git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
   git push -u origin main
   ```

3. GitHub リポジトリの **Settings → Pages** を開く。
4. **Build and deployment** の **Source** で **GitHub Actions** を選ぶ。
5. **Actions** タブで「Deploy GitHub Pages」ワークフローが成功したら、表示された URL を開く。

公開 URLの例（プロジェクトサイト）:

`https://<YOUR_USER>.github.io/<YOUR_REPO>/`  
→ ルートの `index.html` から `portal/index.html` にリダイレクトされます。

## 更新の流れ

1. `portal/desks.json` や各ツール HTML を編集する（新しいツール用フォルダをリポジトリ直下に追加しても、ワークフローが自動で公開物に含めます。`.git` / `.github` / `README.md` は除外されます）。
2. `file://` 向けに `portal/manifest.js` を使う場合は `python3 portal/sync_manifest.py` を実行する。
3. `CHANGELOG.md` に一言追記する。
4. `git add` / `git commit` / `git push` — Actions が再デプロイする。

## 注意

- リポジトリに **患者・個人が特定される情報** を含めないでください。
- 院内規程で「ソースを GitHub に置けない」場合は、院内の静的ホスティングに切り替えてください。
