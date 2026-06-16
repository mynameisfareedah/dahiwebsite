from PIL import Image
from pathlib import Path

root = Path(__file__).resolve().parent.parent
src = root / 'logo.jpeg'
out_dir = root / 'assets'
out_dir.mkdir(parents=True, exist_ok=True)

if not src.exists():
    print('Source logo not found:', src)
    raise SystemExit(1)

sizes = [(16,16,'favicon-16x16.png'),(32,32,'favicon-32x32.png'),(48,48,'favicon-48x48.png'),(180,180,'apple-touch-icon.png')]

with Image.open(src) as im:
    im = im.convert('RGBA')
    for w,h,name in sizes:
        im2 = im.copy()
        im2.thumbnail((w,h), Image.LANCZOS)
        # create square canvas
        canvas = Image.new('RGBA', (w,h), (0,0,0,0))
        # center
        x = (w - im2.width)//2
        y = (h - im2.height)//2
        canvas.paste(im2, (x,y), im2)
        canvas.save(out_dir / name)
        print('Wrote', name)

# Create favicon.ico containing multiple sizes (16,32,48)
icon_sizes = [(16,16),(32,32),(48,48)]
icons = []
with Image.open(src) as im:
    im = im.convert('RGBA')
    for w,h in icon_sizes:
        im2 = im.copy()
        im2.thumbnail((w,h), Image.LANCZOS)
        canvas = Image.new('RGBA', (w,h), (0,0,0,0))
        x = (w - im2.width)//2
        y = (h - im2.height)//2
        canvas.paste(im2, (x,y), im2)
        icons.append(canvas)

icons[0].save(out_dir / 'favicon.ico', format='ICO', sizes=icon_sizes)
print('Wrote favicon.ico')
