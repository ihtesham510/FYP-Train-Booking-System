export const encrypt = (value: string) => {
  return CryptoJS.AES.encrypt(value, process.env.CRYPTO_SECRET_KEY!).toString()
}

export const decrypt = (cipherText: string) => {
  try {
    const bytes = CryptoJS.AES.decrypt(
      cipherText,
      process.env.CRYPTO_SECRET_KEY!,
    )
    return bytes.toString(CryptoJS.enc.Utf8)
  } catch (error) {
    console.error('Failed to decrypt value:', error)
    return null
  }
}
