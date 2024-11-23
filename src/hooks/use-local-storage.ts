import { getItem, removeItem, setItem } from '@/lib/utils'
import { useCallback, useEffect, useState } from 'react'

export default function useLocalStorage<T>(key: string, initialValue?: T) {
  const [value, setValue] = useState<T | undefined>()

  useEffect(() => {
    ;(async () => {
      const item = await getItem<T>(key)
      if (!item) return setValue(initialValue)
      return setValue(item)
    })()
  }, [key])

  const setStoredValue = useCallback(
    async (value: T | undefined) => {
      if (!value) return await removeItem(key)
      await setItem(key, value)
      setValue(value)
    },
    [setValue],
  )
  return [value, setStoredValue] as const
}
