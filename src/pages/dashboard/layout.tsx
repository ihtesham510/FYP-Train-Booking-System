import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/context/auth-context'
import { LinkIcon, LogOutIcon, User, User2Icon } from 'lucide-react'
import { Outlet } from 'react-router-dom'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useEffect, useRef, useState } from 'react'
import { useConvex } from 'convex/react'
import { api } from '@convex/_generated/api'
import axios from 'axios'
import { toast } from 'sonner'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { isValidPhoneNumber } from 'react-phone-number-input'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PhoneInput } from '@/components/ui/phone-input'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { PasswordInput } from '@/components/ui/password-input'
import { ScrollArea } from '@/components/ui/scroll-area'
export default function DashboardLayout() {
  const { signOut, user } = useAuth()
  const convex = useConvex()
  const [selectedFile, setFile] = useState<File | null>(null)
  const ref = useRef<HTMLInputElement>(null)
  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const formSchema = z
    .object({
      first_name: z.string().min(2).max(40),
      last_name: z.string().min(2).max(40),
      email: z.string().email(),
      username: z.string().min(4).max(20),
      gender: z.union([z.literal('male'), z.literal('female')]),
      phone_no: z.string().refine(isValidPhoneNumber, {
        message: 'Invalid phone number',
      }),
      password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters.' })
        .or(z.literal('')),
      confirm_password: z
        .string()
        .min(8, { message: 'Password must be at least 8 characters.' })
        .or(z.literal('')),
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

      if (user_name_exists && user?.user_name !== username) {
        ctx.addIssue({
          code: 'custom',
          path: ['username'],
          message: 'Username already taken',
        })
      }

      if (phone_no_exists && user?.phone !== phone_no) {
        ctx.addIssue({
          code: 'custom',
          path: ['phone_no'],
          message: 'Phone_no already exists',
        })
      }

      if (emailExists && user?.email !== email) {
        ctx.addIssue({
          code: 'custom',
          path: ['email'],
          message: 'Email already exists',
        })
      }

      const isValidPassword =
        password !== '' &&
        confirm_password !== '' &&
        password !== confirm_password

      if (isValidPassword) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirm_password'],
          message: 'Passwords do not match',
        })
      }
    })

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: user?.first_name,
      last_name: user?.last_name,
      email: user?.email,
      username: user?.user_name,
      gender: user?.gender,
      phone_no: user?.phone,
      password: '',
      confirm_password: '',
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (user) {
      const t1 = toast.loading('Updating')
      try {
        await convex.mutation(api.user.updateUser, {
          userId: user?._id,
          first_name: values.first_name,
          last_name: values.last_name,
          email: values.email,
          phone: values.phone_no,
          user_name: values.username,
          password: values.password !== '' ? values.password : undefined,
        })
        toast.success('Successfully Updated')
      } catch (err) {
        toast.error('Failed to Update Profile')
      } finally {
        toast.dismiss(t1)
        form.reset({
          first_name: values?.first_name,
          last_name: values?.last_name,
          email: values?.email,
          username: values?.username,
          gender: values?.gender,
          phone_no: values?.phone_no,
          password: '',
          confirm_password: '',
        })
      }
    }
  }

  useEffect(() => {
    ;(async () => {
      if (selectedFile) {
        if (selectedFile.size > 5 * 1024 * 1024)
          return toast.error('File is larger then 5Mb')
        const t1 = toast.loading('Uploading')
        const url = await convex.mutation(api.user.getUploadUrl)
        const { storageId } = await axios
          .post(url, selectedFile, {
            headers: { 'Content-Type': selectedFile.type },
          })
          .then(data => data.data)
        const image_url = await convex.query(api.user.getImageUrl, {
          storageId,
        })
        if (image_url && user) {
          await convex.mutation(api.user.updateProfileImage, {
            userId: user._id,
            image_url: { storageId: storageId, url: image_url },
          })
          toast.dismiss(t1)
          setFile(null)
          return toast.success('Updated Successfully')
        }
      }
    })()
  }, [selectedFile])

  return (
    <>
      <Dialog>
        <header className='h-[10vh] w-full flex items-center justify-between px-10'>
          <h1 className='text-2xl font-semibold'>Dashboard</h1>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={user?.image_url?.url} alt='Profile Image' />
                <AvatarFallback>
                  <User2Icon />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className='w-[180px]'>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DialogTrigger asChild>
                <DropdownMenuItem>
                  <User />
                  <span>Profile</span>
                </DropdownMenuItem>
              </DialogTrigger>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut}>
                <LogOutIcon />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <DialogContent className='max-w-[700px]'>
          <DialogHeader className=' px-4'>
            <DialogTitle>Account</DialogTitle>
            <DialogDescription>
              Real-time details of your account.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className='h-[60vh] px-4'>
            <div className='flex justify-between mb-8 items-center'>
              <div className='flex gap-4 px-2'>
                <a
                  href={user?.image_url?.url}
                  className='relative'
                  target='_blank'
                >
                  <Avatar className='size-[50px]'>
                    <AvatarImage
                      src={user?.image_url?.url}
                      alt='Profile Image'
                    />
                    <AvatarFallback>
                      <User2Icon />
                    </AvatarFallback>
                  </Avatar>
                  <LinkIcon
                    size={10}
                    className='absolute right-0 bottom-0 text-white'
                  />
                </a>
                <div className='flex flex-col gap-1 justify-center'>
                  <h1 className='text-sm font-semibold'>Profile Image</h1>
                  <p className='text-xs text-muted-foreground'>
                    JPEG or PNG under 5mb
                  </p>
                </div>
              </div>
              <div className='flex gap-2'>
                <Button
                  variant='secondary'
                  size='sm'
                  onClick={() => ref.current?.click()}
                >
                  Change Image
                </Button>
                <input
                  type='file'
                  ref={ref}
                  accept='image/jpeg, image/png'
                  className='hidden'
                  onChange={handleChange}
                />
                <Button
                  variant='destructive'
                  size='sm'
                  disabled={!user?.image_url}
                  onClick={async () => {
                    if (user) {
                      await convex.mutation(api.user.updateProfileImage, {
                        userId: user._id!,
                        image_url: undefined,
                      })
                      toast.warning('Image Removed')
                    }
                  }}
                >
                  Remove
                </Button>
              </div>
            </div>
            <div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className='grid-cols-1 grid space-y-6'
                >
                  <div className='grid grid-cols-2 gap-4 px-2'>
                    <FormField
                      control={form.control}
                      name='first_name'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xl'>First Name</FormLabel>
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
                          <FormLabel className='text-xl '>Last Name</FormLabel>
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
                  <div className='grid grid-cols-2 gap-4 px-2'>
                    <FormField
                      control={form.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xl'>Email</FormLabel>
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
                          <FormLabel className='text-xl'>User Name</FormLabel>
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
                  <div>
                    <FormField
                      control={form.control}
                      name='phone_no'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xl'>Phone No</FormLabel>
                          <FormControl>
                            <PhoneInput
                              placeholder='+92314567892'
                              defaultCountry='PK'
                              {...field}
                              required
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <FormField
                      control={form.control}
                      name='gender'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xl'>Gender</FormLabel>
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
                  </div>
                  <div className='grid grid-cols-2 gap-4 px-2'>
                    <FormField
                      control={form.control}
                      name='password'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className='text-xl'>Password</FormLabel>
                          <FormControl>
                            <PasswordInput placeholder='*******' {...field} />
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
                          <FormLabel className='text-xl'>
                            Confirm Password
                          </FormLabel>
                          <FormControl>
                            <PasswordInput placeholder='*******' {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div>
                    <Button
                      type='submit'
                      disabled={!form.formState.isDirty}
                      className='w-full'
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
              <div className='mt-4'>
                <Button
                  className='w-full'
                  onClick={async () =>
                    await convex.mutation(api.user.deleteUser, {
                      userId: user!._id,
                    })
                  }
                  variant='destructive'
                >
                  Delete Account
                </Button>
              </div>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      <Separator />
      <Outlet />
    </>
  )
}
