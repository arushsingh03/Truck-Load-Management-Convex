import { v } from 'convex/values';
import { api } from './_generated/api';
import { action } from './_generated/server';
import { hashPassword, comparePasswords } from './utils';
import { Id } from './_generated/dataModel';

type UserType = 'driver' | 'motorOwner' | 'transporter' | 'admin';

interface User {
    _id: Id<'users'>;
    name: string;
    phone: string;
    transportName: string;
    password: string;
    address: string;
    userType: UserType;
    isAdmin: boolean;
    isApproved: boolean;
    documentUrl?: string;
    createdAt: string;
}

interface ResetPasswordResponse {
    _id: Id<'users'>;
    name: string;
    phone: string;
    transportName: string;
    password: string;
    address: string;
    userType: UserType;
    isAdmin: boolean;
    isApproved: boolean;
    documentUrl?: string;
    createdAt: string;
}

export const register = action({
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
        documentUrl: v.optional(v.string()), // Changed from documentUrl to documentUrl
    },
    handler: async (
        ctx,
        args
    ): Promise<Id<'users'>> => {
        const hashedPassword = await hashPassword(args.password);

        return await ctx.runMutation(api.users.insertUser, {
            ...args,
            password: hashedPassword,
            isAdmin: false,
            isApproved: false,
        });
    },
});


export const login = action({
    args: {
        phone: v.string(),
        password: v.string()
    },
    handler: async (ctx, args): Promise<User> => {
        const user = await ctx.runQuery(api.users.getUser, {
            phone: args.phone
        }) as User | null;

        if (!user) {
            throw new Error("Invalid credentials");
        }

        const isValidPassword = await comparePasswords(args.password, user.password);

        if (!isValidPassword) {
            throw new Error("Invalid password");
        }

        if (!user.isApproved) {
            throw new Error("Account not approved");
        }

        return user;
    },
});


export const resetPassword = action({
    args: {
        phone: v.string(),
        newPassword: v.string()
    },
    handler: async (
        ctx,
        args
    ): Promise<ResetPasswordResponse> => {
        const user = await ctx.runQuery(api.users.getUser, {
            phone: args.phone
        });

        if (!user) {
            throw new Error("User not found with this phone number");
        }

        const hashedPassword = await hashPassword(args.newPassword);

        const updatedUser = await ctx.runMutation(api.users.updatePassword, {
            userId: user._id,
            hashedPassword: hashedPassword
        });

        if (!updatedUser) {
            throw new Error("Failed to update password");
        }

        return updatedUser as ResetPasswordResponse;
    }
});