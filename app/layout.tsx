import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ระบบงานพัสดุ โรงพยาบาลอุตรดิตถ์",
  description: "ศูนย์รวมระบบงานพัสดุ โรงพยาบาลอุตรดิตถ์",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
