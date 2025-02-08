import { Request, Response, NextFunction } from 'express';
import { UserModel } from '../../infrastructure/models/userModel';
import jwt from 'jsonwebtoken';

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
     
          
        const token = req.cookies?.userToken;

        console.log('token',token);
        
    
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, 'loginsecrit' as string) as { id: string; role: string };
   
        req.user = decoded; 
     
  
        const user = await UserModel.findById(decoded.id);

        console.log('USER',user);
        

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

  
        if (decoded.role === 'user' && user.isblocked) {
            return res.status(403).json({ message: 'User is blocked' });
        }

        if (decoded.role === 'performer' && user.isPerformerBlocked) {
            return res.status(403).json({ message: 'Performer is blocked' });
        }


        next();
    } catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

export default authMiddleware;
