import json, subprocess, os, sys
from concurrent.futures import ThreadPoolExecutor
M = json.load(open('/tmp/apfel-dev-img/specs.json'))
only = set(sys.argv[1:])
def go(item):
    slug, m = item
    out = f'/tmp/apfel-dev-img/raw/{slug}.png'
    if os.path.exists(out) and not only: return slug, 'skip'
    r = subprocess.run(['python3', '/tmp/apfel-dev-img/oai.py', out, m['size'], m['prompt']], capture_output=True, text=True)
    return slug, r.stdout.strip()[-120:]
items = [(s, m) for s, m in M.items() if not only or s in only]
with ThreadPoolExecutor(12) as ex:
    for slug, res in ex.map(go, items): print(slug, res, flush=True)
