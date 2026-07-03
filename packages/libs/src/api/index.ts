import { treaty } from '@elysiajs/eden'
import type { app } from '@api'

export const api = treaty<app>(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001')

export const wsSubscribe = api.ws.subscribe