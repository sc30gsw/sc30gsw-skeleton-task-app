export const TOAST_COLOR = {
  SUCCESS: {
    background: '#4caf50',
    color: '#fff',
  },
  ERROR: {
    background: '#dc2626',
    color: '#fff',
  },
} as const satisfies Record<string, Record<string, `#${string}`>>
