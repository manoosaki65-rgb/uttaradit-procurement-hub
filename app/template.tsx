"use client";

import { useEffect } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.location.pathname !== "/") return;

    const menu = document.querySelector<HTMLElement>('section[aria-label="เมนูงานพัสดุ"]');
    if (!menu || document.getElementById("forgot-scan-home-shortcut")) return;

    const wrap = document.createElement("section");
    wrap.id = "forgot-scan-home-shortcut";
    wrap.setAttribute("aria-label", "ลืมสแกนเวลาเข้าออก");
    wrap.style.maxWidth = "1460px";
    wrap.style.margin = "0 auto";
    wrap.style.padding = "12px 14px 2px";

    const link = document.createElement("a");
    link.href = "/forgot-scan";
    link.style.display = "flex";
    link.style.alignItems = "center";
    link.style.justifyContent = "space-between";
    link.style.gap = "14px";
    link.style.padding = "16px 18px";
    link.style.borderRadius = "22px";
    link.style.textDecoration = "none";
    link.style.color = "#0f2942";
    link.style.background = "linear-gradient(135deg,#ffffff 0%,#fff6f8 55%,#ffe7ee 100%)";
    link.style.border = "1px solid rgba(225,29,72,.14)";
    link.style.boxShadow = "0 10px 26px rgba(15,41,66,.10)";

    const left = document.createElement("div");
    left.style.display = "flex";
    left.style.alignItems = "center";
    left.style.gap = "14px";
    left.style.minWidth = "0";

    const icon = document.createElement("div");
    icon.textContent = "⏱️";
    icon.style.width = "54px";
    icon.style.height = "54px";
    icon.style.flex = "0 0 54px";
    icon.style.display = "grid";
    icon.style.placeItems = "center";
    icon.style.borderRadius = "16px";
    icon.style.fontSize = "30px";
    icon.style.background = "#fff0f4";

    const copy = document.createElement("div");
    copy.style.minWidth = "0";

    const title = document.createElement("strong");
    title.textContent = "ลืมสแกนเวลาเข้า–ออก";
    title.style.display = "block";
    title.style.fontSize = "clamp(18px,4.8vw,24px)";
    title.style.fontWeight = "900";
    title.style.lineHeight = "1.2";

    const sub = document.createElement("span");
    sub.textContent = "บันทึกรายการ • ตรวจสอบเวลา • จัดทำหลักฐาน";
    sub.style.display = "block";
    sub.style.marginTop = "5px";
    sub.style.fontSize = "13px";
    sub.style.color = "#64748b";

    const arrow = document.createElement("span");
    arrow.textContent = "›";
    arrow.setAttribute("aria-hidden", "true");
    arrow.style.flex = "0 0 auto";
    arrow.style.fontSize = "46px";
    arrow.style.fontWeight = "300";
    arrow.style.lineHeight = "1";
    arrow.style.color = "#e11d48";

    copy.append(title, sub);
    left.append(icon, copy);
    link.append(left, arrow);
    wrap.append(link);
    menu.parentNode?.insertBefore(wrap, menu);

    return () => wrap.remove();
  }, []);

  return children;
}
