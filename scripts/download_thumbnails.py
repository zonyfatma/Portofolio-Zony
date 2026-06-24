#!/usr/bin/env python3
"""
Download YouTube thumbnails for IDs listed in video_descriptions.json (or discovered in index.html).
Saves to assets/yt-<VIDEO_ID>.jpg. Tries maxresdefault, falls back to hqdefault.

Usage:
  python scripts/download_thumbnails.py

Requirements: requests
  pip install requests

This script is intended to be run locally on your machine. It will not modify source HTML.
"""
import os
import json
import re
from pathlib import Path

try:
    import requests
except ImportError:
    print('Missing dependency: requests. Install with: pip install requests')
    raise

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets'
VIDMAP = ROOT / 'video_descriptions.json'

# collect ids from video_descriptions.json; fall back to scanning index.html
ids = []
if VIDMAP.exists():
    with VIDMAP.open('r', encoding='utf-8') as f:
        data = json.load(f)
        ids = list(data.keys())

if not ids:
    # scan index.html for youtube ids
    idx = ROOT / 'index.html'
    if idx.exists():
        text = idx.read_text(encoding='utf-8')
        ids = re.findall(r'(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})', text)
        ids = list(dict.fromkeys(ids))

if not ids:
    print('No video IDs found in video_descriptions.json or index.html')
    raise SystemExit(1)

ASSETS.mkdir(parents=True, exist_ok=True)

for vid in ids:
    out = ASSETS / f'yt-{vid}.jpg'
    if out.exists():
        print(f'Skipping {vid} (already exists: {out.name})')
        continue
    urls = [f'https://i.ytimg.com/vi/{vid}/maxresdefault.jpg', f'https://i.ytimg.com/vi/{vid}/hqdefault.jpg']
    saved = False
    for u in urls:
        try:
            print(f'Trying {u} ...')
            r = requests.get(u, stream=True, timeout=10)
            if r.status_code == 200 and int(r.headers.get('content-length', 0)) > 1000:
                with out.open('wb') as fh:
                    for chunk in r.iter_content(8192):
                        fh.write(chunk)
                print(f'Saved {out.name} from {u}')
                saved = True
                break
            else:
                print(f'Not found or too small: {u} (status {r.status_code})')
        except Exception as e:
            print('Error fetching', u, e)
    if not saved:
        print(f'Failed to download thumbnail for {vid}')

print('Done.')
