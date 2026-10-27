from pathlib import Path

path = Path("app/forgot-scan/page.tsx")
s = path.read_text(encoding="utf-8")
original = s

s = s.replace(
    'if (active.captures.length >= 2) { setMessage("รายการนี้เก็บภาพหลักฐานได้สูงสุด 2 รูป"); return; }',
    'if (active.captures.length >= 1) { setMessage("รายการนี้ใช้ภาพหลักฐาน 1 รูปต่อรายงาน"); return; }',
)

old_report_images = '''<div className={`report-images count-${active.captures.length}`}>{active.captures.map((c,i)=><figure key={c.id}><img src={c.image} alt={`หลักฐาน ${i+1}`}/><figcaption>{c.cameraDate&&c.cameraTime?`ภาพหลักฐานที่ ${i+1} — ${compactThaiDate(c.cameraDate)} เวลา ${c.cameraTime} น.`:`ภาพหลักฐานที่ ${i+1} — วัน/เวลาตามที่ปรากฏในภาพกล้อง`}</figcaption></figure>)}</div>'''
new_report_images = '''<div className="report-images">{active.captures.slice(0,1).map((c)=><figure key={c.id}><img src={c.image} alt="ภาพหลักฐาน"/><figcaption>{c.cameraDate&&c.cameraTime?<>วันที่ {compactThaiDate(c.cameraDate)} &nbsp;&nbsp; เวลา {c.cameraTime} น.</>:<>วัน/เวลาให้ยึดตามที่ปรากฏในภาพกล้อง</>}</figcaption></figure>)}</div>'''
if old_report_images not in s:
    raise SystemExit("print evidence block not found")
s = s.replace(old_report_images, new_report_images)

old_sign = '''<div className="sign"><div><p>ลงชื่อ ............................................................ ผู้แจ้ง</p><p>( {active.employeeName} )</p><p>วันที่ ........../........../..........</p></div><div><p>ลงชื่อ ............................................................ ผู้ตรวจสอบ</p><p>( ............................................................ )</p><p>วันที่ ........../........../..........</p></div><div><p>ลงชื่อ ............................................................ หัวหน้ากลุ่มงานพัสดุ</p><p>( นางวราพร จันทร์ศรีทอง )</p><p>วันที่ ........../........../..........</p></div></div>'''
new_sign = '''<div className="sign"><div><p className="sign-line">ลงชื่อ ............................................................</p><p className="sign-role">ผู้แจ้ง</p><p>( {active.employeeName} )</p><p>วันที่ ........../........../..........</p></div><div><p className="sign-line">ลงชื่อ ............................................................</p><p className="sign-role">ผู้ตรวจสอบ</p><p>( ............................................................ )</p><p>วันที่ ........../........../..........</p></div><div><p className="sign-line">ลงชื่อ ............................................................</p><p className="sign-role">หัวหน้ากลุ่มงานพัสดุ</p><p>( นางวราพร จันทร์ศรีทอง )</p><p>วันที่ ........../........../..........</p></div></div>'''
if old_sign not in s:
    raise SystemExit("signature block not found")
s = s.replace(old_sign, new_sign)

old_css = '''.report-images{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:14px}.report-images.count-1{grid-template-columns:1fr}.report-images figure{margin:0}.report-images img{width:100%;max-height:330px;object-fit:contain;border:1px solid #777}.report-images figcaption{text-align:center;font-size:12px;margin-top:5px;font-weight:700}.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:38px}.sign p{text-align:center;margin:8px 0;font-size:12px}.sign p:first-child{white-space:nowrap}.sign p:nth-child(2){min-height:18px}'''
new_css = '''.report-images{display:block;margin-top:12px;break-inside:avoid}.report-images figure{margin:0}.report-images img{display:block;width:100%;height:112mm;object-fit:contain;border:1px solid #555;background:#fff}.report-images figcaption{text-align:center;font-size:16px;line-height:1.4;margin-top:6px;font-weight:800}.sign{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:18px;break-inside:avoid}.sign p{text-align:center;margin:4px 0;font-size:11px;line-height:1.35}.sign-line{white-space:nowrap}.sign-role{font-weight:800;min-height:15px}'''
if old_css not in s:
    raise SystemExit("print css block not found")
s = s.replace(old_css, new_css)

old_print = '''@media print{body{background:#fff!important}.no-print{display:none!important}.fs-page{padding:0;background:#fff}.print-report{display:block;color:#111;font-size:14px}.report-images,.sign{break-inside:avoid}@page{size:A4;margin:12mm}}'''
new_print = '''@media print{body{background:#fff!important}.no-print{display:none!important}.fs-page{padding:0;background:#fff}.print-report{display:block;color:#111;font-size:13px}.report-title{padding-bottom:6px}.report-title h1{font-size:18px}.print-report table{margin-top:8px}.print-report th,.print-report td{padding:4px 6px}.report-images,.sign{break-inside:avoid}@page{size:A4;margin:10mm}}'''
if old_print not in s:
    raise SystemExit("print media block not found")
s = s.replace(old_print, new_print)

if s == original:
    raise SystemExit("no changes made")
path.write_text(s, encoding="utf-8")
print("patched single-evidence A4 layout")
