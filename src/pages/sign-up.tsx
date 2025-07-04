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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { PasswordInput } from '@/components/ui/password-input'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { useConvex } from 'convex/react'
import { api } from '@convex/_generated/api'
import { useAuth } from '@/context/auth-context'
import { Link } from 'react-router-dom'

export default function SignUp() {
  const convex = useConvex()

  const formSchema = z
    .object({
      first_name: z
        .string()
        .regex(/^[^0-9]*$/, {
          message: 'First name should not contain any numbers',
        })
        .min(2)
        .max(40),
      last_name: z
        .string()
        .regex(/^[^0-9]*$/, {
          message: 'Last name should not contain any numbers',
        })

        .min(2)
        .max(40),
      email: z.string().email(),
      username: z
        .string()
        .regex(/^[a-zA-Z]/, {
          message: 'Username must start with a letter',
        })
        .min(4)
        .max(20),
      gender: z.union([z.literal('male'), z.literal('female')]),
      phone_no: z.string().refine(isValidPhoneNumber, {
        message: 'Invalid phone number',
      }),
      password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters.' }),
      confirm_password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters.' }),
    })
    .superRefine(async (values, ctx) => {
      const { email, username, password, confirm_password, phone_no } = values

      const emailExists = await convex.query(api.user.userExists, { email })

      const phone_no_exists = await convex.query(api.user.userExists, {
        phone_no,
      })

      const user_name_exists = await convex.query(api.user.userExists, {
        username,
      })

      if (user_name_exists) {
        ctx.addIssue({
          code: 'custom',
          path: ['username'],
          message: 'Username already taken',
        })
      }

      if (phone_no_exists) {
        ctx.addIssue({
          code: 'custom',
          path: ['phone_no'],
          message: 'Phone_no already exists',
        })
      }

      if (emailExists) {
        ctx.addIssue({
          code: 'custom',
          path: ['email'],
          message: 'Email already exists',
        })
      }

      if (password !== confirm_password) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirm_password'],
          message: 'Passwords do not match',
        })
      }
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { signUp } = useAuth()
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      signUp({
        email: values.email,
        user_name: values.username,
        first_name: values.first_name,
        gender: values.gender,
        last_name: values.last_name,
        phone: values.phone_no,
        password: values.password,
      })
      toast.success('Registered Successfully')
    } catch (error) {
      console.error('Form submission error', error)
      toast.error('Failed to submit the form. Please try again.')
    }
  }

  return (
    <div className='flex'>
      <div className='w-[50%] bg-cover bg-center hidden lg:block bg-train h-screen' />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-2 flex flex-col justify-between lg:px-8 lg:pt-2 lg:w-[50%] w-full p-10'
        >
          <div className='text-end mt-5'>
            <Link to='/sign-in'>
              <Button variant='ghost' className='text-lg'>
                Sign In
              </Button>
            </Link>
          </div>

          <div className='flex flex-col w-full text-center gap-2 mt-4'>
            <h1 className='text-4xl font-extrabold'>Create an Account</h1>
            <p className='text-md font-semibold text-primary/50'>
              Create an Account and book you first trip.
            </p>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='first_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='@first_name'
                      type='text'
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='last_name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='@last_name'
                      type='text'
                      {...field}
                      required
                    />
                  </FormControl>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='user@example.com'
                      type='text'
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='username'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>username</FormLabel>
                  <FormControl>
                    <Input
                      placeholder='@user_123'
                      type='text'
                      {...field}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name='gender'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  required
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='gender' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='male'>Male</SelectItem>
                    <SelectItem value='female'>Female</SelectItem>
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='phone_no'
            render={({ field }) => (
              <FormItem className='flex flex-col items-start'>
                <FormLabel>Phone number</FormLabel>
                <FormControl className='w-full'>
                  <PhoneInput
                    placeholder='Placeholder'
                    {...field}
                    defaultCountry='PK'
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='grid grid-cols-2 gap-4'>
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='Placeholder' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='confirm_password'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <PasswordInput placeholder='Placeholder' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type='submit'>Submit</Button>
        </form>
      </Form>
    </div>
  )
}
