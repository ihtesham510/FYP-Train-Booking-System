import { mutation, query } from './_generated/server'
import { ConvexError, v } from 'convex/values'
import { encrypt, decrypt } from './lib'

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
      password: encrypt(args.password),
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
      if (decrypt(user.password) !== args.password) return null
      return user._id
    }
    if (args.email) {
      const user = await ctx.db
        .query('user')
        .filter(q => q.eq(q.field('email'), args.email))
        .first()
      if (!user) return null
      if (decrypt(user.password) !== args.password) return null
      return user._id
    }
    if (args.phone) {
      const user = await ctx.db
        .query('user')
        .filter(q => q.eq(q.field('phone'), args.phone))
        .first()
      if (!user) return null
      if (decrypt(user.password) !== args.password) return null
      return user._id
    }
  },
})

export const updateUser = mutation({
  args: {
    userId: v.id('user'),
    first_name: v.optional(v.string()),
    last_name: v.optional(v.string()),
    user_name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    password: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId)
    if (!user) throw new ConvexError('User not found')
    return await ctx.db.patch(args.userId, {
      first_name: args.first_name ?? user.first_name,
      last_name: args.last_name ?? user.last_name,
      email: args.email ?? user.email,
      user_name: args.user_name ?? user.user_name,
      phone: args.phone ?? user.phone,
      password: args.password ? encrypt(args.password) : user.password,
    })
  },
})

export const deleteUser = mutation({
  args: { userId: v.id('user') },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId)
    if (user?.image_url) {
      await ctx.storage.delete(user.image_url.storageId)
    }
    return await ctx.db.delete(args.userId)
  },
})

export const updateProfileImage = mutation({
  args: {
    userId: v.id('user'),
    image_url: v.optional(
      v.object({ url: v.string(), storageId: v.id('_storage') }),
    ),
  },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId)
    if (user?.image_url) {
      await ctx.storage.delete(user.image_url.storageId)
    }
    return await ctx.db.patch(args.userId, { image_url: args.image_url })
  },
})

export const getUploadUrl = mutation({
  async handler(ctx) {
    return await ctx.storage.generateUploadUrl()
  },
})

export const getImageUrl = query({
  args: { storageId: v.id('_storage') },
  async handler(ctx, args) {
    return await ctx.storage.getUrl(args.storageId)
  },
})
