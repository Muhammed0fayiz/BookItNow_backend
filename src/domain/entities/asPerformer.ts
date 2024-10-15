

import mongoose, { Document } from 'mongoose'; // Import mongoose and Document

// Define the User class
export class asPerformer{
    constructor(
        public readonly username: string,
        public readonly email: string,
        public readonly password: string,
        public readonly isVerified: boolean,
        public readonly isPerformerBlocked: boolean,
        public readonly _id?: string
    ) {}
}


export interface asPerformerDocument extends Document {
    isPerfomerBlock: boolean;
    email: string;
    password: string;
    username: string;
    isVerified: boolean;
    isPerformerBlocked: boolean;
    _id: string; 
}