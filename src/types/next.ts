import type { ReactNode } from 'react'

type NonEmptyObject = Record<string, unknown> & {}

type ExpandKeys<T extends string> = T extends never ? object : { [K in T]: ReactNode }

export type NextLayoutProps<Params = undefined, Keys extends string | undefined = undefined> = {
  children: ReactNode
  params: Params extends NonEmptyObject ? Promise<Params> : never
} & (Keys extends string ? ExpandKeys<Keys> : object)

export type NextPageProps<
  Params extends NonEmptyObject | undefined,
  SearchParams extends Record<string, any> | undefined = undefined,
> = {
  params: Params extends NonEmptyObject ? Promise<Params> : never
  searchParams: SearchParams extends Record<string, any> ? Promise<SearchParams> : never
}

export type NextErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}
