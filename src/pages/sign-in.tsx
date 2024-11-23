import { useState } from 'react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Link } from 'react-router-dom'
import { PhoneInput } from '@/components/ui/phone-input'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { useConvex } from 'convex/react'
import { api } from '@convex/_generated/api'
import { useAuth } from '@/context/auth-context'
export default function SignInPage() {
  const convex = useConvex()
  const emailSchema = z
    .object({
      email: z.string().email({ message: 'Invalid email address.' }),
      password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters.' }),
    })
    .superRefine(async (values, ctx) => {
      const emailExists = await convex.query(api.user.userExists, {
        email: values.email,
      })

      if (!emailExists) {
        return ctx.addIssue({
          code: 'custom',
          path: ['email'],
          message: 'Email Does not exists',
        })
      }

      const id = await convex.mutation(api.user.authenticateUser, {
        email: values.email,
        password: values.password,
      })

      if (!id) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'Inncorrect Password',
        })
      }
    })

  const usernameSchema = z
    .object({
      username: z
        .string()
        .min(4, { message: 'Username must be at least 4 characters.' }),
      password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters.' }),
    })
    .superRefine(async (values, ctx) => {
      const userexist = await convex.query(api.user.userExists, {
        username: values.username,
      })
      const id = await convex.mutation(api.user.authenticateUser, {
        username: values.username,
        password: values.password,
      })
      if (!userexist) {
        return ctx.addIssue({
          code: 'custom',
          path: ['username'],
          message: 'Username does not exists',
        })
      }
      if (!id) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'Inncorrect Password',
        })
      }
    })

  const phoneSchema = z
    .object({
      phone: z.string().refine(isValidPhoneNumber, {
        message: 'Invalid phone number',
      }),
      password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters.' }),
    })

    .superRefine(async (values, ctx) => {
      const id = await convex.mutation(api.user.authenticateUser, {
        phone: values.phone,
        password: values.password,
      })
      const userexist = await convex.query(api.user.userExists, {
        phone_no: values.phone,
      })
      if (!userexist) {
        return ctx.addIssue({
          code: 'custom',
          path: ['phone'],
          message: 'Phone no does not exists',
        })
      }

      if (!id) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'Inncorrect Password',
        })
      }
    })

  const [activeTab, setActiveTab] = useState('email')

  const { signIn } = useAuth()

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
  })

  const usernameForm = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
  })

  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
  })

  async function onSubmit(values: {
    email?: string
    password: string
    username?: string
    phone?: string
  }) {
    try {
      signIn({ ...values })
      toast.success('Sign in successful!')
    } catch (error) {
      console.error('Sign in error', error)
      toast.error('Failed to sign in. Please try again.')
    }
  }

  return (
    <div className='flex h-screen'>
      <div className='w-1/2 bg-cover bg-center hidden lg:block bg-train' />
      <div className='w-full lg:w-1/2 flex flex-col p-8'>
        <div className='flex justify-end mb-8'>
          <Link to='/sign-up'>
            <Button variant='ghost' className='text-lg'>
              Register
            </Button>
          </Link>
        </div>
        <div className='flex-grow flex flex-col items-center justify-center'>
          <div className='w-full max-w-md text-center mb-8'>
            <h1 className='text-4xl font-extrabold mb-2'>Welcome Back</h1>
            <p className='text-md font-semibold text-primary/50'>
              Please Sign in to your account.
            </p>
          </div>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full max-w-md'
          >
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='email'>Email</TabsTrigger>
              <TabsTrigger value='username'>Username</TabsTrigger>
              <TabsTrigger value='phone'>Phone</TabsTrigger>
            </TabsList>
            <TabsContent value='email'>
              <Form {...emailForm}>
                <form
                  onSubmit={emailForm.handleSubmit(onSubmit)}
                  className='space-y-4'
                >
                  <FormField
                    control={emailForm.control}
                    name='email'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            type='email'
                            placeholder='you@example.com'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={emailForm.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder='Enter your password'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type='submit' className='w-full'>
                    Sign In
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value='username'>
              <Form {...usernameForm}>
                <form
                  onSubmit={usernameForm.handleSubmit(onSubmit)}
                  className='space-y-4'
                >
                  <FormField
                    control={usernameForm.control}
                    name='username'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input placeholder='@user_123' {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={usernameForm.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder='Enter your password'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type='submit' className='w-full'>
                    Sign In
                  </Button>
                </form>
              </Form>
            </TabsContent>
            <TabsContent value='phone'>
              <Form {...phoneForm}>
                <form
                  onSubmit={phoneForm.handleSubmit(onSubmit)}
                  className='space-y-4'
                >
                  <FormField
                    control={phoneForm.control}
                    name='phone'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <PhoneInput
                            {...field}
                            defaultCountry='PK'
                            placeholder='+92123456769'
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={phoneForm.control}
                    name='password'
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <PasswordInput
                            placeholder='Enter your password'
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type='submit' className='w-full'>
                    Sign In
                  </Button>
                </form>
              </Form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
