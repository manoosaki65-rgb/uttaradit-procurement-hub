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
    if (!menu) return;
    let card = menu.querySelector('a[href="/meeting-room-booking"]');
    if (!card) {
      card = document.createElement('a');
      card.href = '/meeting-room-booking';
      card.setAttribute('aria-label', 'จองห้องประชุมออนไลน์ ห้องประชุม e-GP และ GF');
      card.className = 'group relative block overflow-hidden rounded-2xl shadow-sm transition hover:-translate-y-0.5 hover:shadow-md';
      card.style.minHeight = '250px';
      card.style.background = '#dbeafe';
      card.innerHTML = '<div style="position:absolute;inset:0;display:grid;grid-template-columns:1.45fr .85fr;gap:3px;background:#dbeafe"><img src="/meeting-egp-20261014v3.jpg" alt="ห้องประชุม e-GP" style="width:100%;height:100%;object-fit:cover;display:block;background:#cfe8f7"><img src="/meeting-gf-20261014v3.jpg" alt="ห้องประชุม GF" style="width:100%;height:100%;object-fit:cover;display:block;background:#e8e1f7"></div><div style="position:absolute;inset:0;background:linear-gradient(180deg,transparent 38%,rgba(8,30,55,.18) 58%,rgba(8,30,55,.92) 100%)"></div><div style="position:absolute;left:0;right:0;bottom:0;padding:44px 16px 15px;color:white"><strong style="font-size:21px">จองห้องประชุมออนไลน์</strong><small style="display:block;font-size:13px;margin-top:2px">ห้องประชุม e-GP / ห้องประชุม GF • ดูปฏิทินและคิวจอง</small></div>';
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
