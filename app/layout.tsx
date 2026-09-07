import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: '暮灯当铺 · 勇者归来之后', description: '经营魔王讨伐后的异世界当铺。鉴定遗物，讨价还价，炼制药剂，在王国与夜市间作出选择。' };
export default function RootLayout({children}: Readonly<{children: React.ReactNode}>) { return <html lang="zh-CN"><body>{children}</body></html>; }
