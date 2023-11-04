import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

export async function POST(req: NextRequest) {
  try {
    const { code, id, messages } = await req.json()

    const isValid = process.env.CODE?.split(',').includes(code)
    if (!isValid) {
      return NextResponse.json(
        { ok: false, message: 'Invalid code' },
        { status: 403 }
      )
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages,
    })

    const stream = OpenAIStream(response, {
      async onCompletion(completion) {
        const newMessages = [
          ...messages,
          {
            role: 'assistant',
            content: completion,
          },
        ]
        const payload = {
          id,
          messages: newMessages,
        }
        await kv.hset(`chat:${id}`, payload)

        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [
            ...newMessages,
            {
              role: 'system',
              content:
                'Summarize the discussion briefly in 200 words or less to use as a prompt for future context.',
            },
          ],
        })
        const summary = response.choices[0].message.content
        await kv.hset(`chat:${id}`, { summary })
      },
    })

    return new StreamingTextResponse(stream)
  } catch (error: any) {
    return NextResponse.json(
      { ok: false, message: error.message },
      { status: 500 }
    )
  }
}
