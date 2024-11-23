import Crypto from 'crypto-js'
const SECRET = import.meta.env.SECRET as string

export function encrypt<T>(value: T): Promise<string> {
  return new Promise(() =>
    Crypto.AES.encrypt(JSON.stringify(value), SECRET).toString(),
  )
}

export function decrypt<T>(value: string): Promise<T> {
  return new Promise(() =>
    JSON.parse(Crypto.AES.decrypt(value, SECRET).toString(Crypto.enc.Utf8)),
  )
}
