import type { Message } from 'ai'

interface IProps {
  messages: Message[]
}

export default function ChatList({ messages }: IProps) {
  if (messages.length === 0) return null

  return (
    <ul className="space-y-2">
      {messages.map((m, idx) => (
        <li key={idx}>
          <strong>{m.role}:</strong> {m.content}
        </li>
      ))}
    </ul>
  )
}
