export type User = {
    id: string;
    name: string;
    phone: string;
    email: string;
    address: string;
    isAdmin: boolean;
};

export type Load = {
    id: string;
    currentLocation: string;
    destinationLocation: string;
    weight: number;
    weightUnit: 'kg' | 'ton';
    truckLength: number;
    lengthUnit: 'm' | 'ft';
    contactNumber: string;
    email: string;
    createdAt: string;
    receiptStorageId: string | null;
};
