import { notFound } from 'next/navigation'

import { getChat } from '@/lib/actions/chat'
import ChatComponent from '@/components/chat'

interface IProps {
  id: string
}

export default async function Chat({ id }: IProps) {
  const chat = await getChat(id)

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
