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
})
