'use server'

import { kv } from '@vercel/kv'

import { type Chat } from '@/lib/types'

export async function getChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)
  return chat || { id, messages: [] }
}
