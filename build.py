#!/usr/bin/env python3
import re
from pathlib import Path

SRC = Path('src')
OUT = Path('checkers.html')

template = (SRC / 'template.html').read_text(encoding='utf-8')

def inject(match):
    path = SRC / match.group(1)
    return path.read_text(encoding='utf-8')

result = re.sub(r'/\* INJECT:([^\s*]+) \*/', inject, template)
OUT.write_text(result, encoding='utf-8')
print(f'✓ Built {OUT}')
