import { LoaderCircle } from 'lucide-react'

export default function Loader() {
  return (
    <div className='flex justify-center items-center h-screen w-full'>
      <LoaderCircle className='text-3xl animate-spin' />
    </div>
  )
}
