'use client'

import type { Message } from 'ai'
import { useChat } from 'ai/react'
import { useFormStatus } from 'react-dom'

import { clearChat } from '@/lib/actions/chat'
import { getCode } from '@/lib/utils'

import AuthCode from '../input/auth-code'
import RevalidatePath from '../input/revalidate-path'
import ChatInput from './input'
import ChatList from './list'

interface IProps {
  id: string
  initialMessages?: Message[]
  botId?: string
}

const code = getCode()

export default function Chat({ id, initialMessages, botId }: IProps) {
  const {
    messages,
    input,
    handleInputChange,
    append,
    setInput,
    isLoading,
    setMessages,
  } = useChat({
    id,
    initialMessages,
    body: {
      id,
      code,
      botId,
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
        <form
          action={async (formData) => {
            await clearChat(formData)
            setMessages([])
          }}
        >
          <ClearButton id={id} />
          <RevalidatePath />
          <AuthCode />
        </form>
      )}
      <ChatList messages={messages} />
    </div>
  )
}

function ClearButton({ id }: { id: string }) {
  const { pending } = useFormStatus()

  return (
    <button
      type="submit"
      name="id"
      value={id}
      className="rounded-md border px-2 py-1 text-sm disabled:opacity-50"
      disabled={pending}
      aria-disabled={pending}
    >
      clear memory
    </button>
  )
}
