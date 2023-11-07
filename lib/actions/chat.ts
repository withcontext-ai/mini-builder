'use server'

import { revalidatePath } from 'next/cache'
import { kv } from '@vercel/kv'

import { type Chat } from '@/lib/types'

export async function getChat(id: string) {
  const chat = await kv.hgetall<Chat>(`chat:${id}`)
  return chat || { id, messages: [] }
}

export async function clearChat(formData: FormData) {
  const id = formData.get('id') as string
  try {
    await kv.del(`chat:${id}`)
  } catch (error) {
    console.log('clearChat error:', error)
  } finally {
    revalidatePath('/')
  }
}
