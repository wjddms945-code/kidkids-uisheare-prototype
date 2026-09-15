import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "쌤크 | 직무연수",
  description: "현장의 수업 아이디어와 실전 노하우를 함께 나누는 교사 콘텐츠 플랫폼",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ko"><body>{children}</body></html>;
}
