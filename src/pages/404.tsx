import emptysvg from '@/assets/empty.svg'
export default function Notfound() {
  return (
    <div className='h-screen w-full space-y-6 flex flex-col justify-center items-center'>
      <img src={emptysvg} alt='image' className='h-[30vh] lg:h-[40vh] w-full' />
      <h1 className='text-5xl lg:text-8xl font-extrabold'>404</h1>
      <h1 className='text-xl lg:text-3xl font-semibold'>Page Not Found</h1>
    </div>
  )
}
