// /convex/functions/getLoads.ts
import { query } from "../_generated/server";

export const getLoads = query(async ({ db }) => {
    return await db.query("loads").collect();
});
