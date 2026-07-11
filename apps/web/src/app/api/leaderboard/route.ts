import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'

const ROUNDS = ['rd1', 'rd2', 'rd3', 'physical', 'total'] as const

export async function GET(request: NextRequest) {
  const round = request.nextUrl.searchParams.get('round') ?? 'total'

  if (!ROUNDS.includes(round as typeof ROUNDS[number])) {
    return NextResponse.json({ error: `invalid round: ${round}` }, { status: 400 })
  }

  const filePath = path.join(process.cwd(), 'data', `${round}.json`)
  const data = JSON.parse(readFileSync(filePath, 'utf-8'))

  return NextResponse.json(data)
}
