from pathlib import Path
import re

path = Path('app/forgot-scan/page.tsx')
text = path.read_text(encoding='utf-8')
original = text

# Keep the existing STORAGE_KEY unchanged so captured screenshots/records already
# saved in the user's browser remain available.
assert 'const STORAGE_KEY = "uttaradit-forgot-scan-v5";' in text

# Remove the built-in demo request definition. Existing copies already stored in
# localStorage are intentionally NOT touched.
text = re.sub(
    r'\nconst DEMO_REQUEST: RequestItem = \{.*?\n\};\n',
    '\n',
    text,
    count=1,
    flags=re.S,
)

# New forms must not open with the old demo person's details/date/time.
text = text.replace(
    'const [employeeName, setEmployeeName] = useState("น.ส.พัชราพรรณ ร่มเย็น");',
    'const [employeeName, setEmployeeName] = useState(STAFF[0].name);',
)
text = text.replace(
    'const [workDate, setWorkDate] = useState("2026-10-20");',
    'const [workDate, setWorkDate] = useState(dateKey(now.getFullYear(), now.getMonth(), now.getDate()));',
)
text = text.replace(
    'const [workTime, setWorkTime] = useState("16:30");',
    'const [workTime, setWorkTime] = useState("");',
)

# On a browser/device with no saved data, start empty instead of injecting the
# old demo request. Existing saved records/captures continue loading unchanged.
text = text.replace(
    'if (saved) setRequests(JSON.parse(saved));\n      else setRequests([DEMO_REQUEST]);\n    } catch { setRequests([DEMO_REQUEST]); }',
    'if (saved) setRequests(JSON.parse(saved));\n      else setRequests([]);\n    } catch { setRequests([]); }',
)

if text == original:
    raise SystemExit('No changes applied; source no longer matches expected patch points.')

path.write_text(text, encoding='utf-8')
print('Patched', path)
