import { mutation, query } from './_generated/server'
import { ConvexError, v } from 'convex/values'

export const addTrain = mutation({
  args: {
    name: v.string(),
    dateOfJourney: v.string(),
    trainNumber: v.string(),
    source: v.string(),
    destination: v.string(),
    arrivalTime: v.string(),
    departureTime: v.string(),
    distance: v.number(),
    seats: v.array(
      v.object({
        class: v.string(),
        seats: v.number(),
        price: v.number(),
      }),
    ),
  },
  async handler(ctx, args) {
    return await ctx.db.insert('train', {
      ...args,
      source: args.source.toLowerCase(),
      destination: args.destination.toLowerCase(),
    })
  },
})

export const getTrains = query({
  args: {
    source: v.optional(v.string()),
    destination: v.optional(v.string()),
    dateOfJourney: v.optional(v.string()),
  },
  async handler(ctx, args) {
    if (!args.source && !args.destination && !args.dateOfJourney)
      return await ctx.db.query('train').collect()

    console.log(args)
    return await ctx.db
      .query('train')
      .filter(q => q.eq(q.field('source'), args.source))
      .filter(q => q.eq(q.field('destination'), args.destination))
      .filter(q => q.eq(q.field('dateOfJourney'), args.dateOfJourney))
      .collect()
  },
})

export const getTrain = query({
  args: {
    trainId: v.id('train'),
  },
  async handler(ctx, args) {
    return await ctx.db.get(args.trainId)
  },
})

export const getStations = query({
  async handler(ctx) {
    const trains = await ctx.db.query('train').collect()
    return [
      ...new Set([
        ...trains.map(train => train.source),
        ...trains.map(train => train.destination),
      ]),
    ].sort((a, b) => a.localeCompare(b))
  },
})

export const bookTrain = mutation({
  args: {
    trainId: v.id('train'),
    userId: v.id('user'),
    class: v.string(),
    seats: v.number(),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
  },
  async handler(ctx, args) {
    const train = await ctx.db.get(args.trainId)
    if (!train) throw new ConvexError('Train Not Found')
    const seat = train.seats.find(seat => seat.class === args.class)
    if (seat!.seats < args.seats) return 'Not Enough Seats'
    await ctx.db.patch(train._id, {
      ...train,
      seats: train.seats.map(seat =>
        seat.class === args.class
          ? { ...seat, seats: seat.seats - args.seats }
          : seat,
      ),
    })
    const booking = await ctx.db.insert('booking', {
      farePaid: null,
      fare: seat!.price,
      userId: args.userId,
      trainId: args.trainId,
      source: train.source,
      destination: train.destination,
      arrivalTime: train.arrivalTime,
      seats: args.seats,
      departureTime: train.departureTime,
      distance: train.distance,
      class: args.class,
      phone: args.phone,
      name: args.name,
      email: args.email,
      status: 'pending',
    })

    await ctx.db.insert('pnr', {
      status: 'pending',
      bookingId: booking,
      trainId: train._id,
      userId: args.userId,
      last_updated: Date.now(),
    })
    return booking
  },
})

export const getTickets = query({
  args: {
    trainId: v.optional(v.id('train')),
    userId: v.optional(v.id('user')),
  },
  async handler(ctx, args) {
    if (args.trainId && args.userId)
      return await ctx.db
        .query('pnr')
        .filter(q => q.eq(q.field('userId'), args.userId))
        .filter(q => q.eq(q.field('trainId'), args.trainId))
        .collect()
  },
})

export const cancelTicket = mutation({
  args: { ticket: v.id('pnr') },
  async handler(ctx, args) {
    const ticket = await ctx.db.get(args.ticket)
    if (!ticket) throw new ConvexError('Ticket Not Found')
    const booking = await ctx.db
      .query('booking')
      .filter(q => q.eq(q.field('_id'), ticket?.bookingId))
      .first()
    if (!booking) throw new ConvexError('booking not found')
    const train = await ctx.db.get(booking.trainId)
    if (!train) throw new ConvexError('Train not found')
    await ctx.db.patch(train._id, {
      ...train,
      seats: train.seats.map(seat =>
        seat.class === booking.class
          ? { ...seat, seats: seat.seats + booking.seats }
          : seat,
      ),
    })
    await ctx.db.patch(booking._id, { ...booking, status: 'cancelled' })
    return await ctx.db.delete(args.ticket)
  },
})

export const getBookings = query({
  args: {
    filter: v.optional(
      v.union(
        v.literal('pending'),
        v.literal('cancelled'),
        v.literal('departed'),
      ),
    ),
    userId: v.id('user'),
  },
  async handler(ctx, args) {
    if (!args.filter)
      return await ctx.db
        .query('booking')
        .filter(q => q.eq(q.field('userId'), args.userId))
        .collect()
    return await ctx.db
      .query('booking')
      .filter(q => q.eq(q.field('userId'), args.userId))
      .filter(q => q.eq(q.field('status'), args?.filter))
      .collect()
  },
})
export const getTicket = query({
  args: { bookingId: v.id('booking') },
  async handler(ctx, args) {
    const pnr = await ctx.db
      .query('pnr')
      .filter(q => q.eq(q.field('bookingId'), args.bookingId))
      .first()
    if (!pnr) throw new ConvexError('Pnr not found')
    const train = await ctx.db.get(pnr.trainId)
    const booking = await ctx.db.get(pnr.bookingId)
    if (pnr && train && booking) return { pnr, train, booking }
  },
})
