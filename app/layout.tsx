import type { Metadata } from 'next'
import { Sawarabi_Gothic } from 'next/font/google'
import type React from 'react'
import './globals.css'

const sawarabiGothic = Sawarabi_Gothic({
  subsets: ['latin'],
  weight: '400',
})

export const metadata: Metadata = {
  title: 'ラズネージ',
  description: 'ラズベリーパイのデジタルサイネージシステム',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ja">
      <body className={sawarabiGothic.className}>{children}</body>
    </html>
  )
}
