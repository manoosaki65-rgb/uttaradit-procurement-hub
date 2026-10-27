from pathlib import Path
p=Path('app/forgot-scan/page.tsx')
s=p.read_text(encoding='utf-8')
old='''  function markDone() {\n    if (!active) return;\n    setRequests((prev) => prev.map((r) => r.id === active.id ? { ...r, status: "ตรวจสอบแล้ว" } : r));\n  }\n'''
new='''  function markDone() {\n    if (!active) return;\n    const doneId = active.id;\n    setRequests((prev) => prev.map((r) => r.id === doneId ? { ...r, status: "ตรวจสอบแล้ว" } : r));\n    if (localVideoUrl) URL.revokeObjectURL(localVideoUrl);\n    setActiveId(null);\n    setLocalVideoUrl("");\n    setDriveUrl("");\n    setVideoName("");\n    setCurrentSeconds(0);\n    setDuration(0);\n    setPlaying(false);\n    setVideoError(false);\n    setMessage("");\n    window.setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 50);\n  }\n'''
if old not in s:
    raise SystemExit('markDone block not found')
p.write_text(s.replace(old,new,1), encoding='utf-8')
