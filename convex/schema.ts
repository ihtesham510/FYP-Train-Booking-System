import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  user: defineTable({
    first_name: v.string(),
    last_name: v.string(),
    user_name: v.string(),
    gender: v.union(v.literal('male'), v.literal('female')),
    email: v.string(),
    image_url: v.optional(
      v.object({ url: v.string(), storageId: v.id('_storage') }),
    ),
    phone: v.string(),
    password: v.string(),
  }),
  train: defineTable({
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
  }),
  pnr: defineTable({
    bookingId: v.id('booking'),
    trainId: v.id('train'),
    userId: v.id('user'),
    status: v.union(
      v.literal('pending'),
      v.literal('cancelled'),
      v.literal('departed'),
    ),
    last_updated: v.number(),
  }),
  booking: defineTable({
    userId: v.id('user'),
    trainId: v.id('train'),
    name: v.string(),
    source: v.string(),
    destination: v.string(),
    arrivalTime: v.string(),
    departureTime: v.string(),
    distance: v.number(),
    email: v.string(),
    phone: v.string(),
    class: v.string(),
    seats: v.number(),
    farePaid: v.union(v.number(), v.null()),
    fare: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('cancelled'),
      v.literal('departed'),
    ),
  }),
})
