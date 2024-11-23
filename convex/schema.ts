import { defineSchema, defineTable } from 'convex/server'
import { v } from 'convex/values'

export default defineSchema({
  user: defineTable({
    first_name: v.string(),
    last_name: v.string(),
    user_name: v.string(),
    email: v.string(),
    phone: v.string(),
    password: v.string(),
  }),
})
