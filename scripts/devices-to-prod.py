#!/usr/bin/env python3
"""Copies the `devices` collection (schema, entries, revisions, media rows) from the local dev D1 into one SQL file for prod.

Used once on 2026-10-26 because prod had no admin account yet (setup open), so scripts/import-devices.mjs had no token.
Media files go separately: see the r2 commands printed at the end. User references are dropped (prod has no users).

  python3 scripts/devices-to-prod.py > /tmp/devices-prod.sql
  npx wrangler d1 execute apfelreparatur-website-db --remote --file /tmp/devices-prod.sql
"""
import glob
import json
import sqlite3
import sys

db = max(glob.glob(".wrangler/state/v3/d1/miniflare-D1DatabaseObject/*.sqlite"), key=lambda p: __import__("os").path.getsize(p))
con = sqlite3.connect(db)
con.row_factory = sqlite3.Row


def q(v):
    if v is None:
        return "NULL"
    if isinstance(v, (int, float)):
        return repr(v)
    return "'" + str(v).replace("'", "''") + "'"


def insert(table, row, drop=()):
    cols = [c for c in row.keys()]
    vals = [None if c in drop else row[c] for c in cols]
    return f'INSERT INTO "{table}" ({",".join(chr(34) + c + chr(34) for c in cols)}) VALUES({",".join(q(v) for v in vals)});'


out = []
col = con.execute("select * from _emdash_collections where slug='devices'").fetchone()
out.append(insert("_emdash_collections", col))
for f in con.execute("select * from _emdash_fields where collection_id=?", (col["id"],)):
    out.append(insert("_emdash_fields", f))

ddl = con.execute("select type, sql from sqlite_master where tbl_name='ec_devices' and sql is not null").fetchall()
out += [r["sql"] + ";" for r in ddl if r["type"] in ("table", "index")]

devices = con.execute("select * from ec_devices").fetchall()
media_ids = set()
for d in devices:
    img = json.loads(d["image"]) if d["image"] else None
    if img and img.get("id"):
        media_ids.add(img["id"])
media = [m for m in con.execute("select * from media") if m["id"] in media_ids]
out += [insert("media", m, drop=("author_id", "folder_id")) for m in media]
out += [insert("revisions", r, drop=("author_id",)) for r in con.execute("select * from revisions where collection='devices'")]
out += [insert("ec_devices", d, drop=("author_id", "primary_byline_id")) for d in devices]

status = con.execute("select * from _emdash_media_usage_index_status where scope_key='devices'").fetchone()
if status:
    out.append(insert("_emdash_media_usage_index_status", status))
# Triggers last, so the inserts above do not need the usage-capture bookkeeping.
out += [r["sql"] + ";" for r in ddl if r["type"] == "trigger"]

# AGB § 8: 6 months warranty (owner decision 2026-10-26).
for t in ("ec_pages", "revisions"):
    field = "content" if t == "ec_pages" else "data"
    out.append(f"UPDATE \"{t}\" SET \"{field}\" = REPLACE(\"{field}\", 'geben wir 3 Monate Garantie ab Abholung', 'geben wir 6 Monate Garantie ab Abholung') WHERE \"{field}\" LIKE '%geben wir 3 Monate Garantie ab Abholung%';")

print("\n".join(out))
print(f"-- {len(devices)} devices, {len(media)} media", file=sys.stderr)
for m in media:
    print(m["storage_key"], m["mime_type"], file=sys.stderr)
