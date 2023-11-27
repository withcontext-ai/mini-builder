'use client'

import { getCode } from '@/lib/utils'

const code = getCode()

export default function AuthCode() {
  return <input name="code" value={code} readOnly className="hidden" />
}
