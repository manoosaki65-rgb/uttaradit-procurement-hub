from pathlib import Path
import json

pkg_path = Path('package.json')
pkg = json.loads(pkg_path.read_text(encoding='utf-8'))
deps = pkg.setdefault('dependencies', {})
deps['@ffmpeg/ffmpeg'] = '^0.12.15'
deps['@ffmpeg/util'] = '^0.12.2'
pkg_path.write_text(json.dumps(pkg, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

path = Path('app/forgot-scan/page.tsx')
s = path.read_text(encoding='utf-8')

def rep(old, new, name):
    global s
    if old not in s:
        raise SystemExit(f'missing patch target: {name}')
    s = s.replace(old, new, 1)

rep('''  const [videoError, setVideoError] = useState(false);\n  const formRef = useRef<HTMLElement | null>(null);''', '''  const [videoError, setVideoError] = useState(false);\n  const [sourceVideoFile, setSourceVideoFile] = useState<File | null>(null);\n  const [converting, setConverting] = useState(false);\n  const [convertProgress, setConvertProgress] = useState(0);\n  const [convertedForBrowser, setConvertedForBrowser] = useState(false);\n  const ffmpegRef = useRef<any>(null);\n  const formRef = useRef<HTMLElement | null>(null);''', 'state')

rep('''    setLocalVideoUrl(\"\"); setCurrentSeconds(0); setDuration(0); setPlaying(false); setMessage(\"\");''', '''    setLocalVideoUrl(\"\"); setCurrentSeconds(0); setDuration(0); setPlaying(false); setMessage(\"\");\n    setSourceVideoFile(null); setConverting(false); setConvertProgress(0); setConvertedForBrowser(false); setVideoError(false);''', 'open request reset')

rep('''    setVideoError(false);\n    setMessage(\"\");\n    const url = URL.createObjectURL(file); setLocalVideoUrl(url); setVideoName(file.name);''', '''    setVideoError(false);\n    setMessage(\"\");\n    setSourceVideoFile(file);\n    setConvertedForBrowser(false);\n    setConvertProgress(0);\n    const url = URL.createObjectURL(file); setLocalVideoUrl(url); setVideoName(file.name);''', 'attach local video')

marker = '''\n  function attachEvidenceImage(file?: File) {'''
if marker not in s:
    raise SystemExit('missing attachEvidenceImage marker')
convert_fn = r'''

  async function convertVideoForBrowser(file?: File | null) {
    if (!file || converting) return;
    if (file.size >= 2 * 1024 * 1024 * 1024) {
      setVideoError(true);
      setMessage("ไฟล์ใหญ่เกิน 2 GB ระบบแปลงในเบราว์เซอร์ไม่ได้ — กรุณาตัดเฉพาะช่วงเวลาที่ต้องการก่อน");
      return;
    }
    setConverting(true);
    setVideoError(false);
    setConvertProgress(0);
    setMessage("กำลังเตรียมตัวแปลงวิดีโอในเครื่อง…");
    try {
      const [{ FFmpeg }, { fetchFile, toBlobURL }] = await Promise.all([
        import("@ffmpeg/ffmpeg"),
        import("@ffmpeg/util"),
      ]);
      let ffmpeg = ffmpegRef.current;
      if (!ffmpeg) {
        ffmpeg = new FFmpeg();
        ffmpeg.on("progress", ({ progress }: { progress: number }) => {
          const p = Math.max(0, Math.min(1, Number(progress) || 0));
          setConvertProgress(p);
          setMessage(`กำลังแปลงไฟล์ CCTV ให้ Chrome เล่นได้… ${Math.round(p * 100)}%`);
        });
        const baseURL = "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd";
        await ffmpeg.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
        });
        ffmpegRef.current = ffmpeg;
      }
      const stamp = Date.now();
      const ext = (file.name.split(".").pop() || "mp4").replace(/[^a-zA-Z0-9]/g, "") || "mp4";
      const inputName = `cctv-${stamp}.${ext}`;
      const outputName = `cctv-browser-${stamp}.mp4`;
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      const code = await ffmpeg.exec([
        "-i", inputName,
        "-an",
        "-c:v", "libx264",
        "-preset", "ultrafast",
        "-crf", "26",
        "-pix_fmt", "yuv420p",
        "-movflags", "+faststart",
        outputName,
      ]);
      if (code !== 0) throw new Error(`ffmpeg exit ${code}`);
      const raw = await ffmpeg.readFile(outputName);
      const bytes = raw instanceof Uint8Array ? new Uint8Array(raw) : new TextEncoder().encode(String(raw));
      const blob = new Blob([bytes], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      setLocalVideoUrl((old) => {
        if (old) URL.revokeObjectURL(old);
        return url;
      });
      setCurrentSeconds(0);
      setDuration(0);
      setPlaying(false);
      setConvertedForBrowser(true);
      setVideoError(false);
      setConvertProgress(1);
      setMessage("แปลงไฟล์สำเร็จแล้ว — กดเล่น กรอ และแคปภาพได้เลย");
      try { await ffmpeg.deleteFile(inputName); } catch {}
      try { await ffmpeg.deleteFile(outputName); } catch {}
      window.setTimeout(() => videoRef.current?.load(), 50);
    } catch (err) {
      console.error("forgot-scan video conversion failed", err);
      setVideoError(true);
      setMessage("แปลงวิดีโออัตโนมัติไม่สำเร็จ — ยังสามารถเลือกภาพหลักฐาน 1 รูปแทนได้");
    } finally {
      setConverting(false);
    }
  }
'''
s = s.replace(marker, convert_fn + marker, 1)

rep('''      } catch {\n        setVideoError(true);\n        setDuration(0);\n        setCurrentSeconds(0);\n        setMessage(\"วิดีโอนี้เล่นไม่ได้ใน Chrome เครื่องนี้ — เลือกภาพหลักฐาน 1 รูปด้านล่างแทนได้ทันที\");\n      }''', '''      } catch {\n        if (sourceVideoFile && !convertedForBrowser && !converting) {\n          await convertVideoForBrowser(sourceVideoFile);\n        } else {\n          setVideoError(true);\n          setDuration(0);\n          setCurrentSeconds(0);\n          setMessage(\"วิดีโอนี้ยังเล่นไม่ได้หลังแปลง — เลือกภาพหลักฐาน 1 รูปแทนได้\");\n        }\n      }''', 'toggle play catch')

rep('''    setVideoError(false);\n    setMessage(\"\");\n    window.setTimeout(() => window.scrollTo({ top: 0, behavior: \"smooth\" }), 50);''', '''    setVideoError(false);\n    setSourceVideoFile(null);\n    setConverting(false);\n    setConvertProgress(0);\n    setConvertedForBrowser(false);\n    setMessage(\"\");\n    window.setTimeout(() => window.scrollTo({ top: 0, behavior: \"smooth\" }), 50);''', 'mark done reset')

old_video = '''<video ref={videoRef} src={localVideoUrl} playsInline onLoadedMetadata={(e)=>{setVideoError(false);setDuration(e.currentTarget.duration)}} onTimeUpdate={(e)=>setCurrentSeconds(e.currentTarget.currentTime)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)}/>'''
new_video = '''<video ref={videoRef} src={localVideoUrl} playsInline onLoadedMetadata={(e)=>{setVideoError(false);setDuration(e.currentTarget.duration)}} onTimeUpdate={(e)=>setCurrentSeconds(e.currentTarget.currentTime)} onPlay={()=>setPlaying(true)} onPause={()=>setPlaying(false)} onError={()=>{ if(sourceVideoFile && !convertedForBrowser && !converting){ void convertVideoForBrowser(sourceVideoFile); } else if(!converting){ setVideoError(true); setDuration(0); setCurrentSeconds(0); setMessage(\"วิดีโอนี้ยังเล่นไม่ได้ — เลือกภาพหลักฐาน 1 รูปแทนได้\"); } }}/>'''
rep(old_video, new_video, 'video element')

rep('''<div className=\"timebar\"><b>{fmtTime(currentSeconds)}</b><span>/ {fmtTime(duration)}</span></div>''', '''{converting&&<div style={{padding:\"10px 12px\",marginBottom:8,borderRadius:10,background:\"#fff7ed\",color:\"#9a3412\",display:\"grid\",gap:4}}><strong>กำลังแปลงไฟล์ CCTV ให้เล่นบนเว็บ… {Math.round(convertProgress*100)}%</strong><small>ประมวลผลในเครื่องนี้ ไฟล์ไม่ถูกอัปโหลดออกไป</small></div>}<div className=\"timebar\"><b>{fmtTime(currentSeconds)}</b><span>/ {fmtTime(duration)}</span></div>''', 'convert progress ui')

rep('''{videoError&&<label className=\"video-fallback\"><Camera size={20}/><strong>วิดีโอเล่นไม่ได้ — เลือกภาพหลักฐาน 1 รูปแทน</strong><small>รองรับ JPG / PNG และนำไปพิมพ์ครึ่ง A4 ได้ทันที</small><input type=\"file\" accept=\"image/jpeg,image/png,image/webp\" onChange={(e)=>attachEvidenceImage(e.target.files?.[0])}/></label>}''', '''{videoError&&!converting&&<div className=\"video-fallback\"><Camera size={20}/><strong>วิดีโอยังเล่นไม่ได้หลังลองแปลง</strong>{sourceVideoFile&&!convertedForBrowser&&<button type=\"button\" onClick={()=>void convertVideoForBrowser(sourceVideoFile)} style={{border:0,borderRadius:9,padding:\"9px 12px\",fontWeight:800,cursor:\"pointer\"}}>ลองแปลงวิดีโออีกครั้ง</button>}<label style={{display:\"grid\",gap:4,cursor:\"pointer\"}}><strong>หรือเลือกภาพหลักฐาน 1 รูปแทน</strong><small>รองรับ JPG / PNG และนำไปพิมพ์ครึ่ง A4 ได้ทันที</small><input type=\"file\" accept=\"image/jpeg,image/png,image/webp\" onChange={(e)=>attachEvidenceImage(e.target.files?.[0])}/></label></div>}''', 'fallback ui')

path.write_text(s, encoding='utf-8')
print('patched browser transcode support')
