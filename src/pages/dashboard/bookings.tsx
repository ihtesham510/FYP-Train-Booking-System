import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import BookingTable from './_components/booking-table'
import { ScrollArea } from '@/components/ui/scroll-area'
export default function Bookings() {
  return (
    <div>
      <div className='mx-10 py-5'>
        <h1 className='text-2xl font-bold mb-4'>Your Bookings</h1>
        <Tabs defaultValue='all' className='w-full'>
          <TabsList>
            <TabsTrigger value='all'>All</TabsTrigger>
            <TabsTrigger value='recent'>Recent</TabsTrigger>
            <TabsTrigger value='cancelled'>Cancelled</TabsTrigger>
            <TabsTrigger value='others'>Others</TabsTrigger>
          </TabsList>
          <ScrollArea className='h-[70vh] w-full'>
            <TabsContent value='all'>
              <BookingTable />
            </TabsContent>
            <TabsContent value='recent'>
              <BookingTable filter='pending' />
            </TabsContent>
            <TabsContent value='cancelled'>
              <BookingTable filter='cancelled' />
            </TabsContent>
            <TabsContent value='others'>
              <BookingTable filter='departed' />
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  )
}
