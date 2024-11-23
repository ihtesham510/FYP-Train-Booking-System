import { useAuth } from '@/context/user-context'
import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import Loader from '@/components/Loader'

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { user } = useAuth()
  if (user) return children
  if (user === null) return <Navigate to='/sign-up' />
  return <Loader />
}
