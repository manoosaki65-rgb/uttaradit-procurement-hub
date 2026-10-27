from pathlib import Path
p=Path('app/forgot-scan/page.tsx')
s=p.read_text(encoding='utf-8')
old='''  async function togglePlay() {\n    const v = videoRef.current; if (!v) return;\n    if (v.paused) await v.play(); else v.pause();\n  }'''
new='''  async function togglePlay() {\n    const v = videoRef.current; if (!v) return;\n    if (v.paused) {\n      try {\n        setVideoError(false);\n        setMessage(\"\");\n        await v.play();\n      } catch {\n        setVideoError(true);\n        setDuration(0);\n        setCurrentSeconds(0);\n        setMessage(\"วิดีโอนี้เล่นไม่ได้ใน Chrome เครื่องนี้ — เลือกภาพหลักฐาน 1 รูปด้านล่างแทนได้ทันที\");\n      }\n    } else v.pause();\n  }'''
if old not in s:
    raise SystemExit('togglePlay pattern not found')
s=s.replace(old,new,1)
old2='''<video ref={videoRef} src={localVideoUrl} playsInline controls preload="metadata" onLoadedMetadata={(e)=>{setVideoError(false);setDuration(e.currentTarget.duration)}} onTimeUpdate={(e)=>setCurrentSeconds(e.currentTarget.currentTime)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>{setVideoError(true);setDuration(0);setCurrentSeconds(0);setMessage("ไฟล์วิดีโอนี้ใช้ codec ที่ Chrome บนเครื่องนี้อ่านไม่ได้ — เลือกภาพหลักฐาน 1 รูปด้านล่างแทนได้ทันที")}}/>'''
new2='''<video ref={videoRef} src={localVideoUrl} playsInline onLoadedMetadata={(e)=>{setVideoError(false);setDuration(e.currentTarget.duration)}} onTimeUpdate={(e)=>setCurrentSeconds(e.currentTarget.currentTime)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)}/>'''
if old2 not in s:
    raise SystemExit('video element pattern not found')
s=s.replace(old2,new2,1)
p.write_text(s,encoding='utf-8')
print('patched forgot-scan video player')
