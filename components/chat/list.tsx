import type { Message } from 'ai'

import Markdown from './markdown'

interface IProps {
  messages: Message[]
}

export default function ChatList({ messages }: IProps) {
  if (messages.length === 0) return null

  return (
    <ul className="flex flex-col-reverse gap-2">
      {messages.map((m, idx) => (
        <li key={idx}>
          <strong>{m.role}:</strong>
          <div className="prose">
            <Markdown>{m.content}</Markdown>
          </div>
        </li>
      ))}
    </ul>
  )
}
