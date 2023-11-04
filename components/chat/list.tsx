import type { Message } from 'ai'

interface IProps {
  messages: Message[]
}

export default function ChatList({ messages }: IProps) {
  if (messages.length === 0) return null

  return (
    <ul>
      {messages.map((m) => (
        <li key={m.id}>
          {m.role}: {m.content}
        </li>
      ))}
    </ul>
  )
}
