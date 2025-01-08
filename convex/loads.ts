import dayjs from 'dayjs';
import { v } from 'convex/values';
import { mutation, query } from "../convex/_generated/server";

type UploadResult = {
  uploadUrl: string;
  storageId: string;
};

export const addLoad = mutation({
  args: {
    currentLocation: v.string(),
    destinationLocation: v.string(),
    weight: v.number(),
    weightUnit: v.union(v.literal('kg'), v.literal('ton')),
    truckLength: v.number(),
    lengthUnit: v.union(v.literal('m'), v.literal('ft')),
    contactNumber: v.string(),
    staffContactNumber: v.string(), 
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

export const generateUploadUrl = mutation({
  args: {
    loadId: v.id('loads'),
  },
  async handler(ctx, args) {
    const load = await ctx.db.get(args.loadId);
    if (!load) {
      throw new Error('Load not found');
    }

    const url = await ctx.storage.generateUploadUrl();

    return {
      uploadUrl: url,
      storageId: url.split('/').pop() || '', 
    };
  },
});


export const uploadReceipt = mutation({
  args: {
    loadId: v.id('loads'),
    storageId: v.string(),
  },
  async handler(ctx, args) {
    const load = await ctx.db.get(args.loadId);
    if (!load) {
      throw new Error('Load not found');
    }

    console.log('Updating load with storage ID:', args.storageId);

    await ctx.db.patch(args.loadId, {
      receiptStorageId: args.storageId,
    });
    return load;
  },
});


export const generateDownloadUrl = mutation({
  args: {
    storageId: v.string(),
  },
  async handler(ctx, args) {
    try {
      console.log('Generating download URL for storage ID:', args.storageId);
      const downloadUrl = await ctx.storage.getUrl(args.storageId);
      console.log('Generated download URL:', downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.error('Download URL generation error:', error);
      throw error;
    }
  },
});


export const deleteLoad = mutation({
  args: {
    loadId: v.id('loads'),
  },
  async handler(ctx, args) {
    const load = await ctx.db.get(args.loadId);
    if (!load) {
      throw new Error('Load not found');
    }

    if (load.receiptStorageId) {
      try {
        const actualStorageId = load.receiptStorageId.includes('token=')
          ? load.receiptStorageId.split('token=')[1]
          : load.receiptStorageId;

        await ctx.storage.delete(actualStorageId);
      } catch (error) {
        console.error('Storage deletion error:', error);
      }
    }

    await ctx.db.delete(args.loadId);
  },
});

export const updateLoad = mutation({
  args: {
    loadId: v.id('loads'),
    currentLocation: v.string(),
    destinationLocation: v.string(),
    weight: v.number(),
    weightUnit: v.union(v.literal('kg'), v.literal('ton')),
    truckLength: v.number(),
    lengthUnit: v.union(v.literal('m'), v.literal('ft')),
    contactNumber: v.string(),
    staffContactNumber: v.string(), 
  },
  async handler(ctx, args) {
    const { loadId, ...updateData } = args;
    const load = await ctx.db.get(loadId);

    if (!load) {
      throw new Error('Load not found');
    }

    await ctx.db.patch(loadId, updateData);
    return await ctx.db.get(loadId);
  },
});
