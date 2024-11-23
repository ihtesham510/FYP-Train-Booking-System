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
import { AuthContextProvider } from '@/context/user-context'
import Notfound from '@/pages/404'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string)

document.documentElement.classList.add('dark')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster />
    <Sonner position='top-left' expand />
    <ConvexProvider client={convex}>
      <AuthContextProvider>
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
            <Route path='*' element={<Notfound />} />
          </Routes>
        </BrowserRouter>
      </AuthContextProvider>
    </ConvexProvider>
  </StrictMode>,
)
