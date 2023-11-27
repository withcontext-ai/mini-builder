'use client'

import { usePathname } from 'next/navigation'

export default function RevalidatePath() {
  const path = usePathname()
  return <input name="path" value={path} readOnly className="hidden" />
}
