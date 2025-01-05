import { v } from 'convex/values';
import { defineSchema, defineTable } from 'convex/server';

export default defineSchema({
    users: defineTable({
        name: v.string(),
        phone: v.string(),
        email: v.string(),
        password: v.string(),
        address: v.string(),
        isAdmin: v.boolean(),
    }),
    loads: defineTable({
        currentLocation: v.string(),
        destinationLocation: v.string(),
        weight: v.number(),
        weightUnit: v.union(v.literal('kg'), v.literal('ton')),
        truckLength: v.number(),
        lengthUnit: v.union(v.literal('m'), v.literal('ft')),
        contactNumber: v.string(),
        email: v.string(),
        createdAt: v.string(),
    }),
});