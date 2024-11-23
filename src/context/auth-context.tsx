import { User } from '@/lib/types'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
} from 'react'
import { api } from '@convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import useLocalStorage from '@/hooks/use-encrypted-local-storage'
import { Id } from '@convex/_generated/dataModel'

type SignInUser = {
  phone?: string
  username?: string
  email?: string
  password: string
}

type TypeAuthContext = {
  user: User | null | undefined
  signIn: (user: SignInUser) => void
  signUp: (user: Omit<User, '_id' | '_creationTime'>) => void
  signOut: () => void
}

const authContext = createContext<TypeAuthContext | null>(null)

interface AuthProviderProps extends PropsWithChildren {
  secretKey: string
}

export function AuthProvider({ children, secretKey }: AuthProviderProps) {
  const [key, setkey] = useLocalStorage<Id<'user'>>('token', secretKey)
  const user = useQuery(api.user.getUser, { userId: key })
  const createUser = useMutation(api.user.createUser)
  const authenticate = useMutation(api.user.authenticateUser)

  const signIn = useCallback(
    async (user: SignInUser) => {
      const key = await authenticate({
        username: user.username,
        email: user.email,
        password: user.password,
      })
      if (!key) setkey(undefined)
      return setkey(key as Id<'user'>)
    },
    [setkey],
  )

  const signUp = useCallback(
    async (user: Omit<User, '_id' | '_creationTime'>) => {
      const id = await createUser(user)
      setkey(id as Id<'user'>)
    },
    [setkey],
  )

  const signOut = useCallback(() => setkey(undefined), [setkey])

  return (
    <authContext.Provider value={{ user, signIn, signUp, signOut }}>
      {children}
    </authContext.Provider>
  )
}

export function useAuth() {
  const authctx = useContext(authContext)
  if (!authctx) throw new Error('Auth Provider Must be provided in Main.tsx')
  return authctx
}
