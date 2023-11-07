'use client'

import { useSearchParams } from 'next/navigation'
import type { Message } from 'ai'
import { useChat } from 'ai/react'

import { clearChat } from '@/lib/actions/chat'

import ChatInput from './input'
import ChatList from './list'

interface IProps {
  id: string
  initialMessages?: Message[]
  initialSummary?: string
}

export default function Chat({ id, initialMessages, initialSummary }: IProps) {
  const searchParams = useSearchParams()
  const code = searchParams.get('code')

  const { messages, input, handleInputChange, append, setInput, isLoading } =
    useChat({
      id,
      initialMessages,
      body: {
        id,
        code,
      },
      onError: (err) => {
        alert(err.message)
      },
    })

  return (
    <div className="flex flex-col gap-4 rounded-md border p-4">
      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        append={append}
        setInput={setInput}
        isLoading={isLoading}
      />
      {messages.length > 0 && (
        <form action={clearChat}>
          <button
            name="id"
            value={id}
            className="rounded-md border px-2 py-1 text-sm"
          >
            clear memory
          </button>
        </form>
      )}
      {initialSummary && (
        <p>
          <strong>summary:</strong> {initialSummary}
        </p>
      )}
      <ChatList messages={messages} />
    </div>
  )
}
