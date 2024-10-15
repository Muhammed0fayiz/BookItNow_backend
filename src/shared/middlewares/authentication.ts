import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Extend Request interface to include user property
interface AuthenticatedRequest extends Request {
    user?: string | JwtPayload;
}

// Middleware function to authenticate JWT
const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    // Check if the authorization header is present
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Extract token from 'Bearer <token>'

        // Verify the token
        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }

            // Store the decoded user information in req.user
            req.user = decoded;
            next(); // Proceed to the next middleware or route handler
        });
    } else {
        // If no token is found, send an unauthorized response
        res.status(401).json({ message: 'Access token is missing' });
    }
};

export default authenticateJWT;
