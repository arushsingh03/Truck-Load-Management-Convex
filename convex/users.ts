import { v } from 'convex/values';
import { mutation, query } from './_generated/server';

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

export const updateProfile = mutation({
    args: {
        id: v.string(),
        name: v.string(),
        phone: v.string(),
        email: v.string(),
        address: v.string(),
    },
    async handler(ctx, args) {
        const existingUser = await ctx.db
            .query('users')
            .filter(q => q.eq(q.field('_id'), args.id))
            .unique();

        if (!existingUser) {
            throw new Error('User not found');
        }

        await ctx.db.patch(existingUser._id, {
            name: args.name,
            phone: args.phone,
            email: args.email,
            address: args.address,
        });

        const updatedUser = await ctx.db
            .query('users')
            .filter(q => q.eq(q.field('_id'), existingUser._id))
            .unique();

        if (!updatedUser) {
            throw new Error('Failed to fetch updated user');
        }

        return {
            id: updatedUser._id,
            name: updatedUser.name,
            phone: updatedUser.phone,
            email: updatedUser.email,
            address: updatedUser.address,
            isAdmin: updatedUser.isAdmin,
        };
    },
});