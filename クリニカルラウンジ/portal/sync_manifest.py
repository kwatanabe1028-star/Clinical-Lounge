#!/usr/bin/env python3
"""desks.json から manifest.js（file:// 用フォールバック）を生成する。"""
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent


def main() -> None:
    src = HERE / "desks.json"
    dst = HERE / "manifest.js"
    data = json.loads(src.read_text(encoding="utf-8"))
    body = json.dumps(data, ensure_ascii=False, indent=2)
    dst.write_text(
        "/* Auto-generated from desks.json — do not edit by hand. */\n"
        "window.PORTAL_MANIFEST = "
        + body
        + ";\n",
        encoding="utf-8",
    )
    print(f"Wrote {dst}")


if __name__ == "__main__":
    main()
