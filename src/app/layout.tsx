import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./context/UserContext";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: '--font-space',
});

export const metadata: Metadata = {
  title: {
    default: 'ORACLE - AI 命理分析平台 | 八字排盘 · 人生K线 · 智能神谕',
    template: '%s | ORACLE',
  },
  description:
    '基于权威八字算法与 AI 智能解读的命理分析平台。提供八字排盘、人生K线图、五行矩阵、AI 神谕对话等功能，量化命运，洞见未来。',
  keywords: [
    '八字', '命理', 'AI 命理', '八字排盘', '人生K线', '五行', '运势',
    '命盘分析', 'Oracle', '赛博玄学', '大运', '流年', 'AI 顾问',
  ],
  authors: [{ name: 'Oracle Team' }],
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'ORACLE',
    title: 'ORACLE - AI 命理分析平台',
    description: '量化命运，洞见未来。融合传统八字与现代 AI 的智能命理平台。',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ORACLE - AI 命理分析平台',
    description: '量化命运，洞见未来。融合传统八字与现代 AI 的智能命理平台。',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
