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
          <DialogHeader>
            <DialogTitle>Account</DialogTitle>
            <DialogDescription>
              Real-time details of your account.
            </DialogDescription>
          </DialogHeader>

          <div className='flex justify-between items-center'>
            <div className='flex gap-4'>
              <a
                href={user?.image_url?.url}
                className='relative'
                target='_blank'
              >
                <Avatar className='size-[50px]'>
                  <AvatarImage src={user?.image_url?.url} alt='Profile Image' />
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
        </DialogContent>
      </Dialog>
      <Separator />
      <Outlet />
    </>
  )
}
