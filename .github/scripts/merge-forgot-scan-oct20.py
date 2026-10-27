from pathlib import Path
import re

p = Path('app/forgot-scan/page.tsx')
s = p.read_text(encoding='utf-8')

needle = '      setRequests(recovered);\n'
if needle not in s:
    raise SystemExit('target setRequests(recovered) not found')

replacement = '''      const canonicalOct20: RequestItem = {
        id: "recovered-patcharapan-2026-10-20",
        employeeName: "น.ส.พัชราพรรณ ร่มเย็น",
        position: "นักวิชาการพัสดุ",
        workDate: "2026-10-20",
        workTime: "16:30",
        scanKind: "ออก",
        note: "กู้คืนรายการวันที่ 20 ต.ค. 2569",
        driveUrl: "",
        videoName: "",
        status: "รอตรวจสอบ",
        captures: [],
        createdAt: "2026-10-20T09:30:00.000Z",
      };
      const hasOct20 = recovered.some((item) =>
        item.workDate === canonicalOct20.workDate &&
        item.employeeName === canonicalOct20.employeeName &&
        item.workTime === canonicalOct20.workTime &&
        item.scanKind === canonicalOct20.scanKind
      );
      if (!hasOct20) recovered = [canonicalOct20, ...recovered];
      setRequests(recovered);
'''

s = s.replace(needle, replacement, 1)
p.write_text(s, encoding='utf-8')
