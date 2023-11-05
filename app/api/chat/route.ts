import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import { Message, OpenAIStream, StreamingTextResponse } from 'ai'
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

const MAX_TOKEN_LENGTH = 2000

function estimateTokenLength(input: string): number {
  let tokenLength = 0

  for (let i = 0; i < input.length; i++) {
    const charCode = input.charCodeAt(i)

    if (charCode < 128) {
      // ASCII character
      if (charCode <= 122 && charCode >= 65) {
        // a-Z
        tokenLength += 0.25
      } else {
        tokenLength += 0.5
      }
    } else {
      // Unicode character
      tokenLength += 1.5
    }
  }

  return tokenLength
}

function countMessages(msgs: Message[]) {
  return msgs.reduce((pre, cur) => pre + estimateTokenLength(cur.content), 0)
}

function sliceMessages(msg: any[], maxLength = MAX_TOKEN_LENGTH) {
  let length = 0
  let index = msg.length
  console.log('index 1:', index)
  while (length < maxLength && index > 0) {
    length += estimateTokenLength(msg[index - 1].content)
    index--
  }
  console.log('index 2:', index, length)
  return msg.slice(index)
}

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

    const historyMsgLength = countMessages(messages)
    console.log('historyMsgLength 1:', historyMsgLength)

    const systemMessages = [
      {
        role: 'system',
        content: 'You are ChatGPT, a large language model trained by OpenAI.',
      },
    ]

    const { summary } = await getChat(id)
    const summaryMessages =
      historyMsgLength > MAX_TOKEN_LENGTH ? makeSummaryPrompt(summary) : []

    const latestMessages = sliceMessages(messages)

    // Combine all messages
    const _messages = [...systemMessages, ...summaryMessages, ...latestMessages]
    console.log('_messages:', _messages)

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
        const historyMsgLength = countMessages(newMessages)
        console.log('historyMsgLength 2:', historyMsgLength)
        if (historyMsgLength > MAX_TOKEN_LENGTH) {
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
          console.log('summary:', summary)
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
