'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { Button } from '~/components/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/shadcn/card'

type RootErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error('アプリケーションエラー:', error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-destructive">エラーが発生しました</CardTitle>
          <CardDescription>
            予期しないエラーが発生しました。お手数ですが、もう一度お試しください。
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {process.env.NODE_ENV === 'development' && (
            <details className="text-muted-foreground text-sm">
              <summary className="cursor-pointer hover:text-foreground">エラー詳細</summary>
              <pre className="mt-2 overflow-auto rounded bg-muted p-2 text-xs">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}
        </CardContent>

        <CardFooter className="flex justify-center gap-2">
          <Button onClick={reset}>再試行</Button>

          <Button asChild={true} variant="outline">
            <Link href="/">ホームに戻る</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
