#!/usr/bin/env python3
"""
Convert images in the `assets/` folder to WebP and optionally create resized variants.
Usage:
  python scripts/convert_images.py --source assets --quality 85 --sizes 640 1280

This script requires Pillow (install from `requirements.txt`).
"""
import argparse
import os
from PIL import Image
import sys
import imghdr
import pathlib
import re

IMG_EXTS = ('.jpg', '.jpeg', '.png')


def normalize_base(path):
    # remove repeated image extensions like name.jpg.jpg
    base = path
    while True:
        new = re.sub(r'\.(jpe?g|png)$', '', base, flags=re.I)
        if new == base:
            break
        base = new
    return base


def convert_file(src_path, quality=85, sizes=()):
    # src_path: absolute or relative file path
    try:
        im = Image.open(src_path)
    except Exception as e:
        print(f"[skip] cannot open {src_path}: {e}")
        return []

    im = im.convert('RGB')
    rel_dir = os.path.dirname(src_path)
    filename = os.path.basename(src_path)
    base = normalize_base(filename)
    base_noext = os.path.splitext(base)[0]
    webp_name = os.path.join(rel_dir, base_noext + '.webp')

    created = []
    try:
        im.save(webp_name, 'webp', quality=quality, method=6)
        created.append(webp_name)
        print(f"[ok] {src_path} -> {webp_name}")
    except Exception as e:
        print(f"[err] cannot save webp for {src_path}: {e}")

    # resized variants
    for w in sizes:
        try:
            ratio = w / float(im.width)
            if ratio >= 1.0:
                # don't upscale; save original webp already created
                continue
            h = int(im.height * ratio)
            im2 = im.resize((w, h), Image.LANCZOS)
            out_name = os.path.join(rel_dir, f"{base_noext}-{w}.webp")
            im2.save(out_name, 'webp', quality=quality, method=6)
            created.append(out_name)
            print(f"[ok] {src_path} -> {out_name}")
        except Exception as e:
            print(f"[err] cannot create resized for {src_path} ({w}px): {e}")

    return created


def find_images(src_folder):
    out = []
    for root, dirs, files in os.walk(src_folder):
        for f in files:
            if f.lower().endswith(IMG_EXTS):
                out.append(os.path.join(root, f))
    return out


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--source', '-s', default='assets', help='Source folder containing images')
    p.add_argument('--quality', '-q', type=int, default=85, help='WebP quality 1-100')
    p.add_argument('--sizes', '-z', type=int, nargs='*', default=[], help='Optional widths to create resized variants')
    p.add_argument('--dry', action='store_true', help='Dry run (list images only)')
    args = p.parse_args()

    src = args.source
    if not os.path.exists(src):
        print(f"Source folder not found: {src}")
        sys.exit(2)

    images = find_images(src)
    if not images:
        print("No images found in source folder.")
        sys.exit(0)

    print(f"Found {len(images)} images in {src}")
    if args.dry:
        for im in images:
            print("  ", im)
        sys.exit(0)

    for im_path in images:
        convert_file(im_path, quality=args.quality, sizes=args.sizes)

    print("Done.")
