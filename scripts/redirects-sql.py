#!/usr/bin/env python3
"""Prints SQL that adds the seed's redirects to an existing DB (the seed itself only runs on an empty one).
Usage: python3 scripts/redirects-sql.py > /tmp/r.sql && npx wrangler d1 execute apfelreparatur-website-db --remote --file /tmp/r.sql"""
import json, os, time
from pathlib import Path

ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"


def ulid():
    t, r = int(time.time() * 1000), int.from_bytes(os.urandom(10), "big")
    return "".join(ALPHABET[(t >> (5 * i)) & 31] for i in range(9, -1, -1)) + "".join(ALPHABET[(r >> (5 * i)) & 31] for i in range(15, -1, -1))


q = lambda v: "'" + str(v).replace("'", "''") + "'"
seed = json.loads((Path(__file__).resolve().parent.parent / "seed/seed.json").read_text())
for r in seed.get("redirects", []):
    pattern = 1 if "[" in r["source"] else 0
    print(
        f"INSERT INTO _emdash_redirects (id, source, destination, type, is_pattern, enabled, group_name) "
        f"SELECT {q(ulid())}, {q(r['source'])}, {q(r['destination'])}, {r['type']}, {pattern}, 1, {q(r['groupName'])} "
        f"WHERE NOT EXISTS (SELECT 1 FROM _emdash_redirects WHERE source = {q(r['source'])});"
    )
