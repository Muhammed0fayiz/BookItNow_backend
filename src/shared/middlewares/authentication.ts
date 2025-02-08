import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';


interface AuthenticatedRequest extends Request {
    user?: string | JwtPayload;
}


const authenticateJWT = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;


    if (authHeader) {
        const token = authHeader.split(' ')[1]; 

      
        jwt.verify(token, process.env.JWT_SECRET as string, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Invalid token' });
            }

 
            req.user = decoded;
            next(); 
        });
    } else {
   
        res.status(401).json({ message: 'Access token is missing' });
    }
};

export default authenticateJWT;
