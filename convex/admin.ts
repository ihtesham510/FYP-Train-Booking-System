import internal from 'stream'
import { internalMutation, mutation, query } from './_generated/server'
import { ConvexError, v } from 'convex/values'

export const createTrain = internalMutation({
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
    return await ctx.db.insert('train', { ...args })
  },
})

export const checkTicket = internalMutation({
  args: {
    pnr: v.id('pnr'),
    fare: v.number(),
  },
  async handler(ctx, args) {
    const ticket = await ctx.db.get(args.pnr)
    if (!ticket) throw new ConvexError('Ticket Not Found')
    const booking = await ctx.db
      .query('booking')
      .filter(q => q.eq(q.field('_id'), ticket?.bookingId))
      .first()
    if (!booking) throw new ConvexError('booking not found')
    await ctx.db.patch(booking._id, {
      ...booking,
      status: 'departed',
      farePaid: args.fare,
    })
    return await ctx.db.delete(args.pnr)
  },
})
