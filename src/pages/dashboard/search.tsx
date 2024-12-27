import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { capitalizeWords, cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { format } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  ExternalLinkIcon,
  LoaderCircle,
} from 'lucide-react'
import { useQuery } from '@/cache/useQuery'
import { api } from '@convex/_generated/api'
import { useState } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Link } from 'react-router-dom'
const Search = () => {
  const formSchema = z.object({
    fromStation: z.string(),
    toStation: z.string(),
    trainScheduleDate: z.coerce.date(),
  })

  const [query, setQuery] = useState<z.infer<typeof formSchema>>()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      trainScheduleDate: new Date(),
    },
  })

  const onSubmit = (values: z.infer<typeof formSchema>) => setQuery(values)

  const trains = useQuery(api.train.getTrains, {
    source: query?.fromStation,
    destination: query?.toStation,
    dateOfJourney: query?.trainScheduleDate.toLocaleDateString() as any,
  })
  const stations = useQuery(api.train.getStations)
  const stationsData = stations
    ? stations.map(st => ({
        label: capitalizeWords(st),
        value: st,
      }))
    : []

  return (
    <>
      <div className='grid lg:flex h-auto px-10'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-8  w-[25%] max-w-3xl mx-auto py-10'
          >
            <FormField
              control={form.control}
              name='fromStation'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>From Station</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value
                            ? stationsData.find(
                                train => train.value === field.value,
                              )?.label
                            : 'Select Station'}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-[200%] p-0'>
                      <Command>
                        <CommandInput placeholder='Search Stations...' />
                        <CommandList>
                          <CommandEmpty>No Stations found.</CommandEmpty>
                          <CommandGroup>
                            {stationsData.map(station => (
                              <CommandItem
                                value={station.label}
                                key={station.value}
                                onSelect={() => {
                                  form.setValue('fromStation', station.value)
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    station.value === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                                {station.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='toStation'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>To Station</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant='outline'
                          role='combobox'
                          className={cn(
                            'w-full justify-between',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value
                            ? stationsData.find(
                                station => station.value === field.value,
                              )?.label
                            : 'Select Station'}
                          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-[200%] p-0'>
                      <Command>
                        <CommandInput placeholder='Search Station...' />
                        <CommandList>
                          <CommandEmpty>No Station found.</CommandEmpty>
                          <CommandGroup>
                            {stationsData.map(station => (
                              <CommandItem
                                value={station.label}
                                key={station.value}
                                onSelect={() => {
                                  form.setValue('toStation', station.value)
                                }}
                              >
                                <Check
                                  className={cn(
                                    'mr-2 h-4 w-4',
                                    station.value === field.value
                                      ? 'opacity-100'
                                      : 'opacity-0',
                                  )}
                                />
                                {station.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='trainScheduleDate'
              render={({ field }) => (
                <FormItem className='flex flex-col'>
                  <FormLabel>Date of Journey</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground',
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type='submit'>Submit</Button>
          </form>
        </Form>
        {trains && trains.length !== 0 ? (
          <ScrollArea className='w-[75%] h-[85vh] lg:ml-10 ml-10 mt-8'>
            <Table>
              <TableCaption>A list of available trains.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[100px]'>Train No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Departure</TableHead>
                  <TableHead>Arrival</TableHead>
                  <TableHead>Journey</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className='text-right'>Total Seats</TableHead>
                  <TableHead className='w-[60px]'>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trains.map(train => (
                  <TableRow key={train._id}>
                    <TableCell className='font-medium'>
                      {train.trainNumber}
                    </TableCell>
                    <TableCell>{train.name}</TableCell>
                    <TableCell>{train.departureTime}</TableCell>
                    <TableCell>{train.arrivalTime}</TableCell>
                    <TableCell>{`${train.source}-${train.destination}`}</TableCell>
                    <TableCell>{train.dateOfJourney}</TableCell>
                    <TableCell className='text-right'>
                      {train.seats.reduce((acc, cur) => acc + cur.seats, 0)}
                    </TableCell>
                    <TableCell>
                      <Link to={`/dashboard/search/checkout/${train._id}`}>
                        <Button
                          variant='outline'
                          size='icon'
                          className='float-right'
                        >
                          <ExternalLinkIcon className='h-4 w-4' />
                          <span className='sr-only'>Checkout</span>
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        ) : (
          <div className='w-[75%] h-[85vh] lg:ml-10 ml-10 mt-8 flex justify-center items-center'>
            {trains ? (
              <h1 className='text-3xl font-bold text-primary/50'>
                No Trains found.
              </h1>
            ) : (
              <LoaderCircle size={15} className='animate-spin' />
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default Search
