import * as React from 'react'
import type { ChatRequestOptions, CreateMessage, Message } from 'ai'

import TextareaAutosize from '@/components/ui/textarea-autosize'

interface IProps {
  input: string
  handleInputChange: (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
  ) => void
  append: (
    message: Message | CreateMessage,
    chatRequestOptions?: ChatRequestOptions
  ) => Promise<string | null | undefined>
  setInput: React.Dispatch<React.SetStateAction<string>>
  isLoading: boolean
}

export default function ChatInput({
  input,
  handleInputChange,
  append,
  setInput,
  isLoading,
}: IProps) {
  const onSubmit = (content: string) => {
    const q = content.trim()
    if (q === '' || isLoading) return
    append({
      role: 'user',
      content: q,
    })
    setInput('')
  }

  return (
    <TextareaAutosize
      input={input}
      onInput={handleInputChange}
      onSubmit={onSubmit}
    />
  )
}
