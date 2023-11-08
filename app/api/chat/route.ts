import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

export const runtime = 'edge'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_PATH,
})

// gpt-3.5-turbo-1106
// gpt-4-1106-preview
const model = 'gpt-4-1106-preview'

export async function POST(req: NextRequest) {
  try {
    const { code, id, messages: _messages } = await req.json()

    const isValid = process.env.CODE?.split(',').includes(code)
    if (!isValid) {
      return NextResponse.json(
        { ok: false, message: 'Invalid code' },
        { status: 403 }
      )
    }

    const systemMessages = [
      {
        role: 'system',
        content: 'You are ChatGPT, a large language model trained by OpenAI.',
      },
    ]

    const messages = [...systemMessages, ..._messages]

    const response = await openai.chat.completions.create({
      model,
      stream: true,
      messages,
    })

    const stream = OpenAIStream(response, {
      async onCompletion(completion) {
        const completionMessage = [
          {
            role: 'assistant',
            content: completion,
          },
        ]
        const messages = [..._messages, ...completionMessage]
        await kv.hset(`chat:${id}`, {
          id,
          messages,
        })
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
