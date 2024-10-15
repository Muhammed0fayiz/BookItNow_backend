export class OtpUser {
  static find() {
    throw new Error("Method not implemented.");
  }
  static findOneAndUpdate(arg0: { email: string; }, arg1: { otp: string; }, arg2: { new: boolean; }) {
    throw new Error("Method not implemented.");
  }
  static updateOne(arg0: { email: string; }, arg1: { otp: any; }) {
    throw new Error("Method not implemented.");
  }
  static findOne(arg0: { email: string; otp: string | undefined; }) {
    throw new Error("Method not implemented.");
  }
  constructor(
    public readonly username: string,     
    public readonly email: string,
    public readonly password: string,    

    public readonly _id?: string,
    public readonly otp?: number  
  ) {}
}

export interface OtpUserDocument {
  username: string;      
  email: string;
  password: string;      
  _id: string;
  otp:  number;          
}
