import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: '暮灯当铺 · 这间店属于你', description: '经营异世界当铺：整理货架、典当赎回、修复装备、鉴定魔具、接触黑市。选择自己的生意，结识熟客，还清贷款拿到地契。' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="zh-CN"><body>{children}</body></html>; }
