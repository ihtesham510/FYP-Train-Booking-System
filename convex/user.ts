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
    gender: v.union(v.literal('male'), v.literal('female')),
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
  args: {
    email: v.optional(v.string()),
    username: v.optional(v.string()),
    phone_no: v.optional(v.string()),
  },
  async handler(ctx, args) {
    if (args.email) {
      return !!(await ctx.db
        .query('user')
        .filter(q => q.eq(q.field('email'), args.email))
        .first())
    }
    if (args.phone_no) {
      return !!(await ctx.db
        .query('user')
        .filter(q => q.eq(q.field('phone'), args.phone_no))
        .first())
    }
    if (args.username) {
      return !!(await ctx.db
        .query('user')
        .filter(q => q.eq(q.field('user_name'), args.username))
        .first())
    }
  },
})

export const authenticateUser = mutation({
  args: {
    username: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    password: v.string(),
  },
  async handler(ctx, args) {
    if (args.username) {
      const user = await ctx.db
        .query('user')
        .filter(q => q.eq(q.field('user_name'), args.username))
        .first()
      if (!user) return null
      if (user.password !== args.password) return null
      return user._id
    }
    if (args.email) {
      const user = await ctx.db
        .query('user')
        .filter(q => q.eq(q.field('email'), args.email))
        .first()
      if (!user) return null
      if (user.password !== args.password) return null
      return user._id
    }
    if (args.phone) {
      const user = await ctx.db
        .query('user')
        .filter(q => q.eq(q.field('phone'), args.phone))
        .first()
      if (!user) return null
      if (user.password !== args.password) return null
      return user._id
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
