import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../../infrastructure/models/userModel';
import jwt from 'jsonwebtoken';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Extract token from cookies or headers
        console.log('1')
        const token = req.cookies?.userToken;
        console.log('2',token)
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Decode and verify the token
        const decoded = jwt.verify(token, 'loginsecrit' as string) as { id: string; role: string };
        console.log('deco',decoded)
        req.user = decoded; // Attach user info to request for later use
        console.log('deco',decoded)
        // Fetch the user from the database to validate their status
        const user = await UserModel.findById(decoded.id);
        console.log('2',user)
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check user's block status
        if (decoded.role === 'user' && user.isblocked) {
            return res.status(403).json({ message: 'User is blocked' });
        }

        if (decoded.role === 'performer' && user.isPerformerBlocked) {
            return res.status(403).json({ message: 'Performer is blocked' });
        }

        // Allow the request to proceed to the next middleware or route
        next();
    } catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default authMiddleware;
