import { useAuth } from '@/context/auth-context'
import { PropsWithChildren } from 'react'
import { Navigate } from 'react-router-dom'
import Loader from '@/components/Loader'

export default function UnProtectedRoute({ children }: PropsWithChildren) {
  const { user } = useAuth()
  if (user) return <Navigate to='/dashboard' />
  if (user === null) return children
  return <Loader />
}
