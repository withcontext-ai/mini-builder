import { notFound } from 'next/navigation'

import ChatComponent from '@/components/chat'

interface IProps {
  id: string
}

export default async function Chat({ id }: IProps) {
  const chat = { id: '0', messages: [], summary: '' }

  if (!chat) {
    notFound()
  }

  return (
    <ChatComponent
      id={id}
      initialMessages={chat.messages}
      initialSummary={chat.summary}
    />
  )
}
