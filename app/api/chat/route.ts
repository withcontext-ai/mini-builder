import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { OpenAIStream, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'

import { getChat } from '@/lib/actions/chat'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const runtime = 'edge'

const makeSummaryPrompt = (summary?: string) => {
  return summary
    ? [
        {
          role: 'system',
          content: `This is a summary of the chat history as a recap: ${summary}`,
        },
      ]
    : []
}

const summarizePrompt = [
  {
    role: 'system',
    content:
      'Summarize the discussion briefly in 200 words or less to use as a prompt for future context.',
  },
]

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

    const { summary } = await getChat(id)
    const systemMessages = [
      {
        role: 'system',
        content: 'You are ChatGPT, a large language model trained by OpenAI.',
      },
    ]
    const summaryMessages = makeSummaryPrompt(summary)
    const latestMessages = messages.slice(-5)

    // Combine all messages
    const _messages = [...systemMessages, ...summaryMessages, ...latestMessages]

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      stream: true,
      messages: _messages,
    })

    const stream = OpenAIStream(response, {
      async onCompletion(completion) {
        const completionMessage = [
          {
            role: 'assistant',
            content: completion,
          },
        ]
        const newMessages = [...messages, ...completionMessage]
        await kv.hset(`chat:${id}`, {
          id,
          messages: newMessages,
        })

        // Summarize the chat history
        if (newMessages.length > 5) {
          const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              ...summaryMessages,
              ...latestMessages,
              ...completionMessage,
              ...summarizePrompt,
            ],
          })
          const summary = response.choices[0].message.content
          await kv.hset(`chat:${id}`, { summary })
        }
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
