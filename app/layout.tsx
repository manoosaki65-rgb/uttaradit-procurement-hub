import type { Metadata } from "next";
import "./globals.css";
import "./weather-effects.css";
import "./forgot-scan-mobile.css";
import "./forgot-scan/print-fix.css";

export const metadata: Metadata = {
  title: "ระบบงานพัสดุ โรงพยาบาลอุตรดิตถ์",
  description: "ศูนย์รวมระบบงานพัสดุ โรงพยาบาลอุตรดิตถ์",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: ["/favicon.svg"],
  },
};

const weatherEffectScript = `
(() => {
  const bangkokHour = () => Number(new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Bangkok', hour: '2-digit', hour12: false }).format(new Date()));
  const sync = () => {
    const hero = document.querySelector('.hero-banner');
    if (!hero) return;
    const panel = hero.children[1];
    const text = panel instanceof HTMLElement ? (panel.innerText || '') : '';
    const hour = bangkokHour();
    hero.classList.toggle('hero-night', hour >= 18 || hour < 6);
    hero.classList.remove('weather-rain', 'weather-storm');
    if (/ฝนฟ้าคะนอง/.test(text)) hero.classList.add('weather-storm');
    else if (/มีฝน/.test(text)) hero.classList.add('weather-rain');
  };

  const addMeetingCard = () => {
    if (location.pathname !== '/') return;
    const menu = document.querySelector('section[aria-label="เมนูงานพัสดุ"]');
    if (!menu) return;
    let card = menu.querySelector('a[href="/meeting-room-booking"]');
    if (!card) {
      card = document.createElement('a');
      card.href = '/meeting-room-booking';
      card.setAttribute('aria-label', 'ตารางประชุมและจองห้องประชุมออนไลน์');
      card.className = 'group relative block overflow-hidden rounded-2xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md';
      card.style.minHeight = '250px';
      card.style.background = 'linear-gradient(135deg,#e8f3ff,#dbeafe 55%,#eef2ff)';
      const now = new Date();
      const days = [0,1,2].map((n) => { const d = new Date(now); d.setDate(d.getDate()+n); return d; });
      const tiles = days.map((d,i) => '<div style="min-width:62px;border-radius:14px;background:white;padding:9px 8px;text-align:center;box-shadow:0 8px 18px rgba(30,64,175,.10)"><div style="font-size:11px;font-weight:800;color:#64748b">'+(i===0?'วันนี้':new Intl.DateTimeFormat('th-TH',{weekday:'short'}).format(d))+'</div><div style="font-size:24px;font-weight:950;color:#165cc3;line-height:1.1">'+d.getDate()+'</div><div style="font-size:10px;color:#94a3b8">'+new Intl.DateTimeFormat('th-TH',{month:'short'}).format(d)+'</div></div>').join('');
      card.innerHTML = '<div style="position:absolute;inset:0;padding:22px 18px 72px;display:flex;flex-direction:column;justify-content:center"><div style="display:flex;align-items:center;gap:12px;margin-bottom:14px"><div style="width:54px;height:54px;border-radius:16px;background:#1769e0;color:white;display:grid;place-items:center;font-size:28px">📅</div><div><strong style="display:block;font-size:20px;color:#153b69">ตารางประชุม</strong><small style="color:#5b6f86">ดูวันนี้และ 7 วันข้างหน้า</small></div></div><div style="display:flex;gap:8px;overflow:hidden">'+tiles+'</div></div><div style="position:absolute;left:0;right:0;bottom:0;padding:15px 16px;background:linear-gradient(90deg,#155bb7,#327fe6);color:white"><strong style="font-size:18px">จองห้องประชุมออนไลน์</strong><small style="display:block;font-size:12px;margin-top:2px">e-GP ห้องหลัก • GF ห้องสำรอง</small></div>';
      menu.appendChild(card);
    }
  };

  const start = () => {
    sync();
    addMeetingCard();
    const hero = document.querySelector('.hero-banner');
    if (!hero) return setTimeout(start, 300);
    new MutationObserver(() => { sync(); addMeetingCard(); }).observe(document.body, { childList: true, subtree: true, characterData: true });
    setInterval(sync, 60000);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}<script dangerouslySetInnerHTML={{ __html: weatherEffectScript }} /></body></html>;
}
