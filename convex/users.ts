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

export const getAllUsers = query({
    args: {},
    async handler(ctx) {
        const users = await ctx.db
            .query("users")
            .filter((q) => q.neq(q.field("userType"), "admin"))
            .collect();

        return users.map((user) => ({
            id: user._id,
            name: user.name,
            phone: user.phone,
            transportName: user.transportName,
            address: user.address,
            userType: user.userType,
            isAdmin: user.isAdmin,
            isApproved: user.isApproved,
            documentStorageId: user.documentStorageId,
            createdAt: user.createdAt
        }));
    },
});


export const toggleUserApproval = mutation({
    args: {
        userId: v.id("users"),
        isApproved: v.boolean()
    },
    async handler(ctx, args) {
        const user = await ctx.db.get(args.userId);

        if (!user) {
            throw new Error("User not found");
        }

        await ctx.db.patch(args.userId, {
            isApproved: args.isApproved
        });

        return await ctx.db.get(args.userId);
    }
});

export const generateUploadUrl = mutation({
    args: {
        userId: v.id("users"),
    },
    async handler(ctx, args) {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        const uploadUrl = await ctx.storage.generateUploadUrl();
        return uploadUrl;
    },
});

export const updateUserDocument = mutation({
    args: {
        userId: v.id("users"),
        storageId: v.string(),
    },
    async handler(ctx, args) {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        await ctx.db.patch(args.userId, {
            documentStorageId: args.storageId,
        });

        return await ctx.db.get(args.userId);
    },
});

export const getDocumentUrl = query({
    args: {
        storageId: v.optional(v.string())
    },
    async handler(ctx, args) {
        if (!args.storageId) return null;

        try {
            const url = await ctx.storage.getUrl(args.storageId);
            return url;
        } catch (error) {
            console.error("Error getting document URL:", error);
            return null;
        }
    },
});

export const getUserStatistics = query({
    args: {},
    async handler(ctx) {
        const users = await ctx.db
            .query("users")
            .filter((q) => q.neq(q.field("userType"), "admin"))
            .collect();

        const totalUsers = users.length;
        const approvedUsers = users.filter(user => user.isApproved).length;
        const pendingUsers = users.filter(user => !user.isApproved).length;

        return {
            total: totalUsers,
            approved: approvedUsers,
            pending: pendingUsers,
            approvalRate: totalUsers > 0 ? (approvedUsers / totalUsers * 100).toFixed(1) : 0
        };
    }
});
