# trim transparent margin, 3% padding, max 1400px, webp
cd /tmp/apfel-dev-img
for f in raw/*.png; do s=$(basename "$f" .png); o=out/$s.webp; [ -f "$o" ] && [ "$o" -nt "$f" ] && continue
  magick "$f" -trim +repage -bordercolor none -border 3%x3% -resize '1400x1400>' -quality 90 -define webp:alpha-quality=100 "$o"; done
ls out | wc -l
