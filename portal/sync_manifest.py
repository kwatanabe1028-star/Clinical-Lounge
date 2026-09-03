#!/usr/bin/env python3
"""desks.json / news.json から manifest.js（file:// 用フォールバック）を生成する。

ブラウザは file:// で fetch() できないため、ポータルは JSON の取得に失敗したら
この manifest.js を読み込む。JSON を編集したら必ずこれを実行すること。
"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent

# (ファイル名, 埋め込む先のグローバル変数名, 必須かどうか)
SOURCES = [
    ("desks.json", "PORTAL_MANIFEST", True),
    ("news.json", "PORTAL_NEWS", False),
]


def main() -> None:
    dst = HERE / "manifest.js"
    parts = ["/* Auto-generated from desks.json / news.json — do not edit by hand. */\n"]
    written = []

    for filename, global_name, required in SOURCES:
        src = HERE / filename
        if not src.exists():
            if required:
                raise SystemExit(f"{filename} が見つかりません")
            # 任意のデータは、無ければグローバルごと出力しない
            # （ポータル側は未定義なら該当セクションを描画しない）
            print(f"Skipped {filename}（未設置のため {global_name} は出力しません）")
            continue
        data = json.loads(src.read_text(encoding="utf-8"))
        body = json.dumps(data, ensure_ascii=False, indent=2)
        parts.append(f"window.{global_name} = {body};\n")
        written.append(global_name)

    dst.write_text("".join(parts), encoding="utf-8")
    print(f"Wrote {dst}（{', '.join(written)}）")


if __name__ == "__main__":
    main()
