import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
export const insertUser = mutation({
    args: {
        name: v.string(),
        phone: v.string(),
        email: v.string(),
        password: v.string(),
        address: v.string(),
        isAdmin: v.boolean(),
    },
    async handler(ctx, args) {
        return await ctx.db.insert('users', args);
    },
});

export const getUser = query({
    args: {
        phone: v.string(),
    },
    async handler(ctx, args) {
        return await ctx.db
            .query('users')
            .filter((q) => q.eq(q.field('phone'), args.phone))
            .first();
    },
});