# クリニカルラウンジ — 変更履歴

## 2026-05-05

- **GitHub Pages**: `.github/workflows/deploy-pages.yml` を追加（`main` へ push で静的公開）。ルート `index.html` から `portal/index.html` へ誘導。
- **ポータル**: デスク・ツール一覧を `portal/desks.json` に分離（入口 HTML はレイアウトと読み込みのみ）。
- **互換**: `file://` で `desks.json` が読めない環境向けに `portal/manifest.js` を追加（`sync_manifest.py` で `desks.json` から再生成）。

