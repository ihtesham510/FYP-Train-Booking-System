import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { PhoneInput } from '@/components/ui/phone-input'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { AlertCircleIcon, LoaderCircleIcon } from 'lucide-react'
import { useAuth } from '@/context/auth-context'
import { useParams } from 'react-router-dom'
import { useQuery } from '@/cache/useQuery'
import { api } from '@convex/_generated/api'
import { Id } from '@convex/_generated/dataModel'
import Notfound from '../404'
import { useMutation } from 'convex/react'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'

export default function CheckOut() {
  const { id } = useParams()
  const train = useQuery(api.train.getTrain, { trainId: id as Id<'train'> })
  const { user } = useAuth()
  const bookTrain = useMutation(api.train.bookTrain)
  const ticket = useQuery(api.train.getTickets, {
    userId: user?._id,
    trainId: train?._id,
  })
  const navigate = useNavigate()

  const formSchema = z.object({
    name: z.string().min(2),
    email: z.string(),
    phone: z.string().refine(isValidPhoneNumber, {
      message: 'Invalid phone number',
    }),
    class: z.string(),
    seats: z.coerce
      .number()
      .max(10, { message: 'You Cannot Book More then 10 seats.' }),
  })
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: `${user?.first_name} ${user?.last_name}`,
      email: user?.email,
      phone: user?.phone,
      seats: 1,
    },
  })
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const { name, email, phone, seats } = values
    if (user && train) {
      const res = await bookTrain({
        userId: user._id,
        trainId: train._id,
        email,
        phone,
        seats,
        name,
        class: values.class,
      })
      if (res === 'Not Enough Seats')
        return toast.error('Not Enough Seats Avaliable')
      toast.success('Booked Successfully')
      return navigate(`/dashboard/bookings/ticket/${res}`)
    }
  }
  const avaliableSeats =
    train && train!.seats.reduce((acc, cur) => acc + cur.seats, 0) !== 0
  if (!id) return <Notfound code={404} messege='Missing Train ID' />
  if (!train)
    return (
      <div className='w-full h-[85vh] flex justify-center items-center'>
        <LoaderCircleIcon className='animate-spin' />
      </div>
    )

  const isOverLimited = ticket && ticket.length > 3
  return (
    <div className='mx-10 py-4'>
      <h1 className='text-3xl font-bold mb-6'>Train Booking</h1>
      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Train Details</CardTitle>
          <CardDescription>Information about the train journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-2 gap-4'>
            {[
              { label: 'Train Name', value: train?.name },
              { label: 'Train Number', value: train?.trainNumber },
              { label: 'Source', value: train?.source },
              { label: 'Destination', value: train?.destination },
              { label: 'Departure Time', value: train?.departureTime },
              { label: 'Arrival Time', value: train?.arrivalTime },
              { label: 'Date of Journey', value: train?.dateOfJourney },
              { label: 'Distance', value: `${train?.distance} km` },
            ].map(detail => (
              <div key={detail.label}>
                <Label className='text-semibold text-md'>{detail.label}</Label>
                <p className='text-sm text-primary/85'>{detail.value}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className='mb-6'>
        <CardHeader>
          <CardTitle>Available Seats</CardTitle>
          <CardDescription>
            Select your preferred class and number of seats
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-3 gap-4'>
            {train.seats.map(seatClass => (
              <Card key={seatClass.class}>
                <CardHeader>
                  <CardTitle>{seatClass.class}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className='flex'>
                    Available Seats :
                    <p className='font-bold'>&nbsp;{seatClass.seats}</p>
                  </p>
                  <p className='flex'>
                    Price per Seat :
                    <p className='font-bold'>
                      &nbsp;Rs.&nbsp;{seatClass.price}/-
                    </p>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
      {ticket && ticket.length !== 0 && (
        <div
          className={`h-[5vh] w-full border-border border my-4 rounded-md p-4 py-10 flex justify-center items-center gap-4 ${isOverLimited && 'bg-destructive text-destructive-foreground'}`}
        >
          <AlertCircleIcon className='size-10' />
          <p>
            {isOverLimited
              ? 'You have already reached the booking limit'
              : 'You Already have bookings on this train'}
          </p>
        </div>
      )}

      {avaliableSeats ? (
        <Card>
          <CardHeader>
            <CardTitle>Book Your Seats</CardTitle>
            <CardDescription>
              Enter your details and select your seats
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className='space-y-4'>
                <FormField
                  control={form.control}
                  name='name'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder='shadcn' type='text' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>email</FormLabel>
                      <FormControl>
                        <Input placeholder='shadcn' type='email' {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='phone'
                  render={({ field }) => (
                    <FormItem className='flex flex-col items-start'>
                      <FormLabel>Phone number</FormLabel>
                      <FormControl className='w-full'>
                        <PhoneInput
                          placeholder='Placeholder'
                          {...field}
                          defaultCountry='TR'
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='class'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Class</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder='Select Your Class' />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {train.seats.map(seatClass => (
                            <SelectItem
                              key={seatClass.class}
                              value={seatClass.class}
                              disabled={seatClass.seats === 0}
                            >
                              {seatClass.class}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name='seats'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seats</FormLabel>
                      <FormControl>
                        <Input
                          placeholder='No of Seats'
                          type='number'
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button
                  type='submit'
                  disabled={
                    form.formState.isSubmitting || isOverLimited ? true : false
                  }
                >
                  {form.formState.isSubmitting ? (
                    <LoaderCircleIcon className='animate-spin' />
                  ) : (
                    'Book'
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      ) : (
        <div className='bg-destructive p-6 rounded-md text-xl font-semibold flex justify-center gap-5 items-center text-destructive-foreground'>
          <AlertCircleIcon className='size-10' /> No Seats Avaliable For
          Bookings
        </div>
      )}
    </div>
  )
}
