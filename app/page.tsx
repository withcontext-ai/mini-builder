import Chat from './chat'

export const runtime = 'edge'

const CHAT_INSTANCE_NUM = 3

export default function RootPage() {
  return (
    <main className="p-4">
      <div className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        <Chat id="0" />
      </div>
    </main>
  )
}
