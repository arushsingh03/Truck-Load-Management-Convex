import dayjs from 'dayjs';
import { v } from 'convex/values';
import { mutation, query } from "../convex/_generated/server";

export const addLoad = mutation({
  args: {
    currentLocation: v.string(),
    destinationLocation: v.string(),
    weight: v.number(),
    weightUnit: v.union(v.literal('kg'), v.literal('ton')),
    truckLength: v.number(),
    lengthUnit: v.union(v.literal('m'), v.literal('ft')),
    contactNumber: v.string(),
    email: v.string(),
  },
  async handler(ctx, args) {
    const load = await ctx.db.insert('loads', {
      ...args,
      createdAt: dayjs().format('YYYY-MM-DD'),
    });
    return load;
  },
});

export const getTodayLoads = query({
  args: {},
  async handler(ctx) {
    return ctx.db
      .query('loads')
      .filter((q) => 
        q.eq(q.field('createdAt'), dayjs().format('YYYY-MM-DD'))
      )
      .collect();
  },
});

export const getLoads = query({
  args: {
    dateFrom: v.string(),
    dateTo: v.string(),
    location: v.string(),
  },
  async handler(ctx, args) {
    let query = ctx.db.query('loads');

    if (args.dateFrom && args.dateTo) {
      query = query.filter((q) =>
        q.and(
          q.gte(q.field('createdAt'), args.dateFrom),
          q.lte(q.field('createdAt'), args.dateTo)
        )
      );
    }

    if (args.location) {
      query = query.filter((q) =>
        q.or(
          q.eq(q.field('currentLocation'), args.location),
          q.eq(q.field('destinationLocation'), args.location)
        )
      );
    }

    return query.collect();
  },
});