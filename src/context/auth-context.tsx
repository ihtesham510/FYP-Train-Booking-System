import { User } from '@/lib/types'
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
} from 'react'
import { api } from '@convex/_generated/api'
import { useMutation, useQuery } from 'convex/react'
import useLocalStorage from '@/hooks/use-local-storage'
import { Id } from '@convex/_generated/dataModel'

type SignInUser = Omit<User, '_id' | '_creationTime'> &
  Partial<Pick<User, 'user_name' | 'email' | 'phone'>> &
  Required<Pick<User, 'password'>>

type TypeAuthContext = {
  user: User | null | undefined
  signIn: (user: SignInUser) => void
  signUp: (user: Omit<User, '_id' | '_creationTime'>) => void
  signOut: () => void
}

const authContext = createContext<TypeAuthContext | null>(null)

export function AuthProvider({ children }: PropsWithChildren) {
  const [key, setkey] = useLocalStorage<Id<'user'>>('token')
  const user = useQuery(api.user.getUser, { userId: key })
  const createUser = useMutation(api.user.createUser)
  const authenticate = useMutation(api.user.signInUser)

  const signIn = useCallback(
    async (user: SignInUser) => {
      const key = await authenticate(user)
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
