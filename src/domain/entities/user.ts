import mongoose, { Document } from 'mongoose'; // Import mongoose and Document

// Define the User class
export class User {
    constructor(
        public readonly username: string,
        public readonly email: string,
        public readonly password: string,
        public readonly isVerified: boolean,
        public readonly isblocked: boolean,
        public readonly _id?: string
    ) {}
}


export interface UserDocument extends Document {
    isPerfomerBlock: boolean;
    email: string;
    password: string;
    username: string;
    isVerified: boolean;
    isblocked: boolean;
    _id: string; 
}