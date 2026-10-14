import re
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\cowork\taiwan\trip_plan\v3_data.js', encoding='utf-8') as f:
    text = f.read()

dishes = re.findall(r"name:\s*'([^']+)'.*?img:\s*'([^']+)'.*?originalUrl:\s*'([^']+)'", text, re.DOTALL)
for d in dishes:
    print(f"{d[0]} --> {d[1]} --> {d[2]}")
