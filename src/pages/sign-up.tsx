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
// import { Checkbox } from '@/components/ui/checkbox'
import { PasswordInput } from '@/components/ui/password-input'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { useConvex } from 'convex/react'
import { api } from '@convex/_generated/api'

export default function SignUp() {
  const convex = useConvex()

  const formSchema = z
    .object({
      first_name: z.string().min(2).max(40),
      last_name: z.string().min(2).max(40),
      email: z.string().email(),
      username: z.string().min(4).max(20),
      gender: z.string(),
      phone_no: z.string().refine(isValidPhoneNumber, {
        message: 'Invalid phone number',
      }),
      password: z.string().min(8).max(50),
      confirm_password: z.string().min(8).max(50),
    })
    .superRefine(async (values, ctx) => {
      const { email, password, confirm_password } = values

      const emailExists = await convex
        .query(api.user.userExists, { email })
        .then(data => data)

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

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
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
          className='space-y-2 lg:px-8 lg:pt-2 lg:w-[50%] w-full p-10'
        >
          <div className='flex flex-col gap-3 mt-4'>
            <h1 className='text-3xl font-bold'>Register</h1>
            <p className='text-md font-semibold text-primary/50'>
              Register to Book Your First Trip
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
                    <Input placeholder='@first_name' type='text' {...field} />
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
                    <Input placeholder='@last_name' type='text' {...field} />
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
                    <Input placeholder='@user_123' type='text' {...field} />
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
          {/**/}
          {/* <FormField */}
          {/*   control={form.control} */}
          {/*   name='married' */}
          {/*   render={({ field }) => ( */}
          {/*     <FormItem className='flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4'> */}
          {/*       <FormControl> */}
          {/*         <Checkbox */}
          {/*           checked={field.value} */}
          {/*           onCheckedChange={field.onChange} */}
          {/*         /> */}
          {/*       </FormControl> */}
          {/*       <div className='space-y-1 leading-none'> */}
          {/*         <FormLabel>Married</FormLabel> */}
          {/**/}
          {/*         <FormMessage /> */}
          {/*       </div> */}
          {/*     </FormItem> */}
          {/*   )} */}
          {/* /> */}
          {/**/}
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

          <Button type='submit'>Submit</Button>
        </form>
      </Form>
    </div>
  )
}
