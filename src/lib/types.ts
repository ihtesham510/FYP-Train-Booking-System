import { api } from '@convex/_generated/api'

export type User = NonNullable<(typeof api.user.getUser)['_returnType']>
