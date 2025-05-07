import { ReactNode } from "react";
import { Id } from "../../convex/_generated/dataModel";

export type UserType = 'driver' | 'motorOwner' | 'transporter' | 'admin';

export interface User {
    _id: string;
    name: string;
    phone: string;
    transportName: string;
    address: string;
    userType: 'driver' | 'motorOwner' | 'transporter' | 'admin';
    isAdmin: boolean;
    isApproved: boolean;
    documentUrl?: string;
    createdAt: string;
}

export type Load = {
    [x: string]: any;
    bodyType: any;
    products: any;
    date(date: any): unknown;
    address: any;
    location: ReactNode;
    description: ReactNode;
    status: any;
    id: string;
    receiptUrl: any;
    email: any;
    _id: Id<'loads'>;
    currentLocations: string[];
    destinationLocations: string[];
    weight: number;
    weightUnit: 'kg' | 'ton';
    truckLength: number;
    lengthUnit: 'm' | 'ft';
    contactNumber: string;
    staffContactNumber: string;
    createdAt: string;
    receiptStorageId?: string;
    isOwner?: boolean;
};