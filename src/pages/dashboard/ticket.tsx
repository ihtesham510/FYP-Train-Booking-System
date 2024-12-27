import { useQuery } from '@/cache/useQuery'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import { Download, Share2, TicketSlashIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { jsPDF } from 'jspdf'
import { useMutation } from 'convex/react'

export default function Ticket() {
  const { id } = useParams()
  const navigate = useNavigate()
  const data = useQuery(api.train.getTicket, {
    bookingId: id as Id<'booking'>,
  })
  const ticketDetails = data
    ? [
        { label: 'Booking ID', data: data.booking._id },
        { label: 'Passenger', data: data.booking.name },
        { label: 'From', data: data.booking.source },
        { label: 'To', data: data.booking.destination },
        { label: 'Departure', data: data.booking.departureTime },
        { label: 'Arrival', data: data.booking.arrivalTime },
        { label: 'Class', data: data.booking.class },
        { label: 'No. of Seats', data: data.booking.seats },
        { label: 'Fare', data: `Rs.${data.booking.fare}/-` },
        { label: 'Fare Paid', data: data.booking.farePaid ?? 'N/A' },
        { label: 'Status', data: data.pnr.status },
      ]
    : []

  const downloadPDF = () => {
    const pdf = new jsPDF()
      .setFontSize(16)
      .text(`${data?.train.trainNumber}-${data?.train.name}`, 10, 10)
    ticketDetails.forEach((detail, index) => {
      pdf.text(`${detail.label} :    ${detail.data}`, 10, 20 + index * 10)
    })
    pdf.save('ticket.pdf')
  }
  const cancelTicket = useMutation(api.train.cancelTicket)
  return (
    <>
      {data && (
        <Card className='w-full max-w-lg mx-auto shadow-lg my-5'>
          <CardHeader>
            <CardTitle className='text-2xl font-bold text-center'>
              {data?.train.trainNumber}-{data?.train.name}
            </CardTitle>
          </CardHeader>
          <CardContent className='p-6'>
            {data && (
              <div className='space-y-4'>
                {ticketDetails.map(detail => (
                  <div className='flex justify-between'>
                    <span className='font-semibold'>{detail.label}</span>
                    <span>{detail.data}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className='flex justify-between'>
            <div className='gap-4 flex'>
              <Button variant='outline' onClick={downloadPDF}>
                <Download className='mr-2 h-4 w-4' />
                Download
              </Button>
              <Button
                onClick={() => {
                  if (navigator.clipboard) {
                    navigator.clipboard
                      .writeText(window.location.href)
                      .then(() => toast.success('Link Copied To Clippoard'))
                      .catch(() =>
                        toast.error('Error While copying link to clipboard'),
                      )
                  } else {
                    toast.error('Clippoard Api not supported')
                  }
                }}
              >
                <Share2 className='mr-2 h-4 w-4' />
                Share
              </Button>
            </div>
            <div>
              <Button
                variant='destructive'
                onClick={async () => {
                  await cancelTicket({ ticket: data.pnr._id })
                  toast.success('Ticket Cancelled')
                  navigate('/dashboard/bookings')
                }}
              >
                <TicketSlashIcon className='mr-2 h-4 w-4' />
                Cancel
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </>
  )
}
