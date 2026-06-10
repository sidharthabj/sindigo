import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { createClient } from '@/lib/supabase/server'
import { validateBooks } from '@/lib/recommendations/validate'
import { fetchCoverAndId } from '@/lib/recommendations/cover'

function buildRatelimiters() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  const redis = Redis.fromEnv()
  return {
    ip: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, '1 h') }),
    user: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 d') }),
  }
}

const anthropic = new Anthropic()

export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === 'production') {
    const origin = request.headers.get('origin') ?? ''
    const host = request.headers.get('host') ?? ''
    if (host && !origin.includes(host)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  const { books } = body as any

  if (!validateBooks(books)) {
    return NextResponse.json(
      { error: 'Provide between 2 and 5 books, each with a title and author under 100 characters.' },
      { status: 400 }
    )
  }

  const limiters = buildRatelimiters()
  if (limiters) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { success } = await limiters.user.limit(`user:${user.id}`)
      if (!success) {
        return NextResponse.json(
          { error: "You've reached your daily recommendation limit. Try again tomorrow." },
          { status: 429 }
        )
      }
    } else {
      const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? '127.0.0.1'
      const { success } = await limiters.ip.limit(`ip:${ip}`)
      if (!success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again in an hour.' },
          { status: 429 }
        )
      }
    }
  }

  const bookList = books
    .map((b: { title: string; author: string }) => `- "${b.title}" by ${b.author}`)
    .join('\n')

  const prompt = `You are a knowledgeable book recommendation engine. A reader loves these books:\n${bookList}\n\nRecommend exactly 5 books they would enjoy next. Return ONLY a valid JSON array — no other text, no markdown. Each object must have these exact fields:\n- "title": the book's full title\n- "author": the author's full name\n- "reason": one sentence explaining why this matches their taste\n\nExample: [{"title":"The Name of the Wind","author":"Patrick Rothfuss","reason":"Like Dune, it builds an intricate world through a gifted protagonist navigating politics and power."}]`

  let rawRecs: Array<{ title: string; author: string; reason: string }>
  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 1024,
      temperature: 0.7,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    rawRecs = JSON.parse(text.trim())
    if (!Array.isArray(rawRecs) || rawRecs.length === 0) throw new Error('Invalid format')
  } catch {
    return NextResponse.json(
      { error: 'Failed to generate recommendations. Please try again.' },
      { status: 500 }
    )
  }

  const recommendations = await Promise.all(
    rawRecs.slice(0, 5).map(async (rec) => {
      const { coverUrl, googleBooksId } = await fetchCoverAndId(rec.title, rec.author)
      return { title: rec.title, author: rec.author, reason: rec.reason, coverUrl, googleBooksId }
    })
  )

  return NextResponse.json({ recommendations })
}
