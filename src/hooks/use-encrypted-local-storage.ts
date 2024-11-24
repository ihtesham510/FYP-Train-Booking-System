import { useCallback, useEffect, useState } from 'react'
import { decrypt, encrypt } from '@/lib/utils'

export default function useEncryptedLocalStorage<T>(
  key: string,
  secret_key: string,
  initialValue?: T,
) {
  const [value, setValue] = useState<T | undefined>()

  useEffect(() => {
    ;(async () => {
      const storedItem = localStorage.getItem(key)
      if (!storedItem) {
        setValue(initialValue)
        return
      }

      const decrypted = decrypt(storedItem, secret_key)
      if (!decrypted) {
        setValue(initialValue)
        return
      }

      try {
        const parsedValue = JSON.parse(decrypted) as T
        setValue(parsedValue)
      } catch (error) {
        console.error('Failed to parse decrypted value:', error)
        setValue(initialValue)
      }
    })()
  }, [key, initialValue])

  const setStoredValue = useCallback(
    (newValue: T | undefined) => {
      if (newValue === undefined) {
        localStorage.removeItem(key)
        setValue(undefined)
        return
      }

      try {
        const encrypted = encrypt(JSON.stringify(newValue), secret_key)
        localStorage.setItem(key, encrypted)
        setValue(newValue)
      } catch (error) {
        console.error('Failed to encrypt and store value:', error)
      }
    },
    [key],
  )

  return [value, setStoredValue] as const
}
