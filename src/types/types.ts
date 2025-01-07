import { Id } from "../../convex/_generated/dataModel";

export type User = {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    isAdmin: boolean;
};

export type Load = {
    _id: Id<'loads'>;
    currentLocation: string;
    destinationLocation: string;
    weight: number;
    weightUnit: 'kg' | 'ton';
    truckLength: number;
    lengthUnit: 'm' | 'ft';
    contactNumber: string;
    email: string;
    createdAt: string;
    receiptStorageId?: string;
    isOwner?: boolean;
};
