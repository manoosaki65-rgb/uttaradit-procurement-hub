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
  const sync = () => {
    const hero = document.querySelector('.hero-banner');
    if (!hero) return;
    const panel = hero.children[1];
    if (!(panel instanceof HTMLElement)) return;
    const text = panel.innerText || '';
    hero.classList.remove('weather-rain', 'weather-storm');
    if (/ฝนฟ้าคะนอง/.test(text)) hero.classList.add('weather-storm');
    else if (/มีฝน/.test(text)) hero.classList.add('weather-rain');
  };
  const start = () => {
    sync();
    const hero = document.querySelector('.hero-banner');
    if (!hero) return setTimeout(start, 300);
    new MutationObserver(sync).observe(hero, { childList: true, subtree: true, characterData: true });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}<script dangerouslySetInnerHTML={{ __html: weatherEffectScript }} /></body></html>;
}
