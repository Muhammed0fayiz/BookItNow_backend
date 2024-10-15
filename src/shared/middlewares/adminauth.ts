import { Request, Response, NextFunction } from 'express';

declare module 'express-session' {
  interface SessionData {
    admin?: { email: string }; // Define the structure of your admin session object
  }
}

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.admin) {
    // If the admin is logged in, allow access to the route
    next();
  } else {
    // Redirect to login page if admin is not logged in
    return res.status(401).json({ success: false, message: 'Unauthorized, please login as admin' });
  }
};
