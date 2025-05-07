import { v } from 'convex/values';
import { defineSchema, defineTable } from 'convex/server';

export default defineSchema({
    users: defineTable({
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
        documentUrl: v.optional(v.string()),
        createdAt: v.string(),
        pushToken: v.optional(v.string()),
    }),
    loads: defineTable({
        currentLocations: v.array(v.string()), 
        destinationLocations: v.array(v.string()),
        weight: v.number(),
        weightUnit: v.union(v.literal('kg'), v.literal('ton')),
        truckLength: v.number(),
        lengthUnit: v.union(v.literal('m'), v.literal('ft')),
        contactNumber: v.string(),
        staffContactNumber: v.string(),
        bodyType: v.union(
            v.literal('open body'),
            v.literal('covered'),
            v.literal('flatbed')
        ),
        products: v.string(),
        createdAt: v.string(),
        receiptStorageId: v.optional(v.string()),
        receiptUrl: v.optional(v.string()),
        isOwner: v.optional(v.boolean()),
    }),
    receipts: defineTable({
        storageId: v.string(),
        url: v.string(),
        createdAt: v.string(),
        type: v.string(),
    }),
});