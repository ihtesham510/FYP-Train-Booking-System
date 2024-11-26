import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from '@/pages/Home'
import UnProtectedRoute from '@/components/un-protected-route'
import SignUp from '@/pages/sign-up'
import SignIn from '@/pages/sign-in'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import { AuthProvider } from '@/context/auth-context'
import Notfound from '@/pages/404'
import ProtectedRoute from './components/protected-route'
import DashboardLayout from './pages/dashboard/layout'
import Dashboard from './pages/dashboard'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

const secretkey = import.meta.env.VITE_SECRET_KEY

if (!secretkey) throw new Error('secret key must be provided')

document.documentElement.classList.add('dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster />
    <Sonner expand />
    <ConvexProvider client={convex}>
      <AuthProvider secretKey={secretkey}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<Home />} />
            <Route
              path='/sign-up'
              element={
                <UnProtectedRoute>
                  <SignUp />
                </UnProtectedRoute>
              }
            />
            <Route
              path='/sign-in'
              element={
                <UnProtectedRoute>
                  <SignIn />
                </UnProtectedRoute>
              }
            />
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />}></Route>
            </Route>
            <Route path='*' element={<Notfound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConvexProvider>
  </StrictMode>,
)
