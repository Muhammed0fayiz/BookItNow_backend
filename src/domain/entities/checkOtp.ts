export class checkOtp {
    constructor(
    
      public readonly email: string,
      public readonly otp?: string        
    ) {}
  }
  
  export interface OtpUserDocument {
       
    email: string;
  
    otp: string;          
  }
  