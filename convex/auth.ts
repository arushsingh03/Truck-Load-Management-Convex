import { v } from 'convex/values';
import { api } from './_generated/api';
import { action } from './_generated/server';
import { hashPassword, comparePasswords } from './utils';

export const register: any = action({
    args: {
        name: v.string(),
        phone: v.string(),
        email: v.string(),
        password: v.string(),
        address: v.string(),
        isAdmin: v.boolean(),
    },
    async handler(ctx, args) {
        const hashedPassword = await hashPassword(args.password);

        // Here we'll use the hashedPassword when creating the user
        return await ctx.runMutation(api.users.insertUser, {
            ...args,
            password: hashedPassword,
        });
    },
});
export const login: any = action({
    args: {
        phone: v.string(),
        password: v.string(),
    },
    async handler(ctx, args) {
        const user = await ctx.runQuery(api.users.getUser, {
            phone: args.phone
        });

        if (!user) {
            throw new Error('User not found');
        }

        const isValid = await comparePasswords(args.password, user.password);
        if (!isValid) {
            throw new Error('Invalid password');
        }

        return user;
    },
});