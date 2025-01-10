import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { hashPassword } from './utils';

export const insertUser = mutation({
    args: {
        name: v.string(),
        phone: v.string(),
        transportName: v.string(),
        password: v.string(),
        address: v.string(),
        userType: v.union(
            v.literal('driver'),
            v.literal('motorOwner'),
            v.literal('transporter'),
            v.literal('admin')
        ),
        isAdmin: v.boolean(),
        isApproved: v.boolean(),
        documentStorageId: v.optional(v.string()),
    },
    async handler(ctx, args) {
        return await ctx.db.insert('users', {
            ...args,
            createdAt: new Date().toISOString(),
        });
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
        transportName: v.string(),
        address: v.string(),
        userType: v.union(
            v.literal('driver'),
            v.literal('motorOwner'),
            v.literal('transporter'),
            v.literal('admin')
        ),
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
            transportName: args.transportName,
            address: args.address,
            userType: args.userType,
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
            transportName: updatedUser.transportName,
            address: updatedUser.address,
            userType: updatedUser.userType,
            isAdmin: updatedUser.isAdmin,
            isApproved: updatedUser.isApproved,
            documentStorageId: updatedUser.documentStorageId,
            createdAt: updatedUser.createdAt,
        };
    },
});


export const updatePassword = mutation({
    args: {
        userId: v.id("users"),
        hashedPassword: v.string()
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        
        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(args.userId, {
            password: args.hashedPassword
        });

        return await ctx.db.get(args.userId);
    }
});