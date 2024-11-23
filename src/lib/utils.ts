import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { decrypt, encrypt } from './crypto'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function getItem<T>(key: string): Promise<T | null> {
  const item = window.localStorage.getItem(key)
  if (item) return await decrypt<T>(item)
  return null
}

export async function setItem<T>(key: string, value: T): Promise<any> {
  const encValue = await encrypt(value)
  return new Promise(() => window.localStorage.setItem(key, encValue))
}

export async function removeItem(key: string): Promise<void> {
  return new Promise(() => window.localStorage.removeItem(key))
}
