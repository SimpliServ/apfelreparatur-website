Own product illustrations for Mac and Apple Watch models (2026-10-26): gpt-image (OpenAI key from ../laravel-suite/.env), transparent PNG,
one real colour + own wallpaper colour per model so every device page has a distinct image. Works in /tmp/apfel-dev-img (raw/, out/).

    mkdir -p /tmp/apfel-dev-img/raw /tmp/apfel-dev-img/out && cp * /tmp/apfel-dev-img/ && cd /tmp/apfel-dev-img
    python3 specs.py && python3 run.py      # skips models that already have raw/<slug>.png
    sh post.sh                               # trim, pad, webp → out/
    node upload.mjs http://localhost:4330 <PAT>   # media + Preisliste plugin update (local)
    python3 ../../scripts/device-images-to-prod.py <slugs> # prod while it has no admin account (from the repo root)
