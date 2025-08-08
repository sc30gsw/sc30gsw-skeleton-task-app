import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Toaster } from '~/components/ui/shadcn/sonner'
import { Root } from '~/hooks/use-confirm'
import type { NextLayoutProps } from '~/types/next'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'タスク管理アプリ',
  description: 'シンプルで使いやすいタスク管理アプリケーション',
  keywords: ['タスク管理', 'TODO', '生産性', 'タスク'],
  authors: [{ name: 'Task Management App' }],
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({ children }: NextLayoutProps) {
  return (
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <main className="min-h-dvh bg-background text-foreground">{children}</main>
        <Toaster />
        <Root />
      </body>
    </html>
  )
}
