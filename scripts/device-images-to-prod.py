#!/usr/bin/env python3
"""Syncs device images changed locally (Preisliste) to prod while prod has no admin account: SQL for D1 + list of R2 keys.

  python3 scripts/device-images-to-prod.py <slug> [...] > /tmp/images-prod.sql 2> /tmp/images-r2.txt
  npx wrangler d1 execute apfelreparatur-website-db --remote --file /tmp/images-prod.sql
  then upload every key in /tmp/images-r2.txt with `wrangler r2 object put apfelreparatur-website-media/<key> --remote`
"""
import glob
import json
import os
import sqlite3
import sys

db = max(glob.glob(".wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite"), key=os.path.getsize)
con = sqlite3.connect(db)
con.row_factory = sqlite3.Row


def q(v):
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)):
        return repr(v)
    return "'" + str(v).replace("'", "''") + "'"


def insert(table, row, drop=()):
    cols = list(row.keys())
    return f'INSERT OR IGNORE INTO "{table}" ({",".join(chr(34) + c + chr(34) for c in cols)}) VALUES({",".join(q(None if c in drop else row[c]) for c in cols)});'


out, keys = [], []
for slug in sys.argv[1:]:
    d = con.execute("select * from ec_devices where slug=?", (slug,)).fetchone()
    if not d:
        print(f"-- unknown {slug}", file=sys.stderr)
        continue
    img = json.loads(d["image"]) if d["image"] else None
    if img:
        m = con.execute("select * from media where id=?", (img["id"],)).fetchone()
        out.append(insert("media", m, drop=("author_id", "folder_id")))
        keys.append(m["storage_key"])
    for rid in (d["live_revision_id"], d["draft_revision_id"]):
        if rid:
            out.append(insert("revisions", con.execute("select * from revisions where id=?", (rid,)).fetchone(), drop=("author_id",)))
    out.append(
        f'UPDATE "ec_devices" SET "image"={q(d["image"])}, "live_revision_id"={q(d["live_revision_id"])}, "draft_revision_id"={q(d["draft_revision_id"])}, '
        f'"updated_at"={q(d["updated_at"])}, "version"={q(d["version"])} WHERE "id"={q(d["id"])};'
    )

print("\n".join(out))
print("\n".join(keys), file=sys.stderr)
