import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableCaption,
} from '@/components/ui/table'
import { api } from '@convex/_generated/api'
import { useQuery } from '@/cache/useQuery'
import { useAuth } from '@/context/auth-context'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ExternalLinkIcon, LoaderCircleIcon } from 'lucide-react'
import { capitalizeWords } from '@/lib/utils'

export default function BookingTable({
  filter,
}: {
  filter?: 'pending' | 'cancelled' | 'departed'
}) {
  const { user } = useAuth()
  const bookings = useQuery(api.train.getBookings, {
    filter: filter ?? undefined,
    userId: user!._id,
  })
  return (
    <Table>
      <TableCaption>
        {!bookings && <LoaderCircleIcon className='h-4 w-4 animate-spin' />}
        {bookings && bookings.length === 0
          ? 'No Booking History'
          : ' A list of your recent invoices.'}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead>Departure</TableHead>
          <TableHead>Arrival</TableHead>
          <TableHead>Seat</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Fare </TableHead>
          <TableHead>Fare Paid</TableHead>
          <TableHead className='text-right'>Ticket</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings &&
          bookings.map((booking, index) => (
            <TableRow key={index}>
              <TableCell>{booking.name}</TableCell>
              <TableCell>{booking.source}</TableCell>
              <TableCell>{booking.destination}</TableCell>
              <TableCell>{booking.departureTime}</TableCell>
              <TableCell>{booking.arrivalTime}</TableCell>
              <TableCell>
                {booking.class} - {booking.seats}
              </TableCell>
              <TableCell>
                {new Date(booking._creationTime).toLocaleDateString()}
              </TableCell>
              <TableCell>Rs.{booking.fare}/-</TableCell>
              <TableCell>
                {booking.farePaid !== null ? `Rs.${booking.farePaid}/-` : 'N/A'}
              </TableCell>
              <TableCell className='text-right pr-4'>
                {booking.status === 'pending' ? (
                  <Link to={`/dashboard/bookings/ticket/${booking._id}`}>
                    <Button variant='outline' className='h-8 w-8 p-0'>
                      <ExternalLinkIcon className='h-4 w-4' />
                    </Button>
                  </Link>
                ) : (
                  capitalizeWords(booking.status)
                )}
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  )
}
