import { mutation, query } from './_generated/server'
import { v } from 'convex/values'
export const getUser = query({
  args: { userId: v.optional(v.id('user')) },
  async handler(ctx, args) {
    if (!args.userId) return null
    return await ctx.db.get(args.userId)
  },
})

export const createUser = mutation({
  args: {
    first_name: v.string(),
    last_name: v.string(),
    user_name: v.string(),
    email: v.string(),
    phone: v.string(),
    password: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query('user')
      .filter(q => q.eq(q.field('email'), args.email))
      .first()
    if (user) return null
    return await ctx.db.insert('user', {
      ...args,
    })
  },
})

export const userExists = query({
  args: { email: v.string() },
  async handler(ctx, args) {
    return await ctx.db
      .query('user')
      .filter(q => q.eq(q.field('email'), args.email))
      .first()
      .then(data => !!data)
  },
})

export const signInUser = mutation({
  args: {
    user_name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    password: v.string(),
  },
  async handler(ctx, args) {
    for (const key of Object.keys(args)) {
      if (key === 'password') break
      if (args[key as keyof typeof args]) {
        const user = await ctx.db
          .query('user')
          .filter(q =>
            q.eq(
              q.field(key as keyof typeof args),
              args[key as keyof typeof args],
            ),
          )
          .first()

        if (!user) return null
        if (user.password !== args.password) return 'wrong password'
        return user._id
      }
    }
  },
})

export const updateUser = mutation({
  args: {
    userId: v.id('user'),
    first_name: v.string(),
    last_name: v.string(),
    user_name: v.string(),
    email: v.string(),
    phone: v.string(),
    password: v.string(),
  },
  async handler(ctx, args) {
    return await ctx.db.patch(args.userId, args)
  },
})

export const deleteUser = mutation({
  args: { userId: v.id('user') },
  async handler(ctx, args) {
    return await ctx.db.delete(args.userId)
  },
})
