import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import CryptoJS from 'crypto-js'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const encrypt = (value: string, secret_key: string) => {
  return CryptoJS.AES.encrypt(value, secret_key).toString()
}

export const decrypt = (cipherText: string, secret_key: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(cipherText, secret_key)
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Failed to decrypt value:', error)
    return null
  }
}

export function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize the first letter and lowercase the rest
    .join(' ')
}
