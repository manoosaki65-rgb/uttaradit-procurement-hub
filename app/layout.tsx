import type { Metadata } from "next";
import "./globals.css";
import "./weather-effects.css";

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
    if (!menu || menu.querySelector('a[href="/meeting-room-booking"]')) return;
    const card = document.createElement('a');
    card.href = '/meeting-room-booking';
    card.setAttribute('aria-label', 'จองห้องประชุมออนไลน์ ห้องประชุม e-GP และ GF');
    card.className = 'group relative block overflow-hidden rounded-2xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md';
    card.style.minHeight = '210px';
    card.style.background = 'linear-gradient(135deg,#e0f2fe 0%,#dbeafe 45%,#ede9fe 100%)';
    card.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:18px;padding:24px"><div style="width:118px;height:118px;border-radius:28px;background:white;box-shadow:0 12px 28px rgba(15,23,42,.16);display:flex;align-items:center;justify-content:center;font-size:58px;transform:rotate(-4deg)">📅</div><div style="width:96px;height:96px;border-radius:24px;background:rgba(255,255,255,.86);box-shadow:0 10px 24px rgba(15,23,42,.12);display:flex;align-items:center;justify-content:center;font-weight:900;color:#475569;transform:translate(-28px,32px) rotate(5deg)">GF</div></div><div style="position:absolute;left:0;right:0;bottom:0;padding:34px 16px 14px;background:linear-gradient(transparent,rgba(8,30,55,.9));color:white"><strong style="font-size:20px">จองห้องประชุมออนไลน์</strong><small style="display:block;font-size:13px">ห้องประชุม e-GP / ห้องประชุม GF</small></div>';
    menu.appendChild(card);
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
