// import { Request, Response, NextFunction } from 'express';
// import jwt from 'jsonwebtoken';
// import axios from 'axios';
// import dotenv from 'dotenv';
// import { JwtPayload } from 'jsonwebtoken';

// dotenv.config();

// // Axios instance for API calls (if needed)
// const axiosInstance = axios.create({
//     baseURL: process.env.API_BASE_URL, // Set your API base URL in .env
//     timeout: 5000,
// });

// // Define user roles and protected paths
// const userProtectedPaths = ['/profile', '/home', '/events', '/upcoming-events'];
// const performerProtectedPaths = [
//     '/performer-dashboard',
//     '/performer-events',
//     '/performer-profile',
//     '/event-management',
//     '/eventupdate',
// ];

// const authPath = '/auth';

// // Middleware function
// const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
//     const token = req.cookies?.userToken; // Extract token from cookies

//     // Helper function to decode and verify JWT
//     const decodeToken = (token: string): JwtPayload | null => {
//         try {
//             return jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
//         } catch (err) {
//             console.error('Token verification failed:', err);
//             return null;
//         }
//     };

//     if (token) {
//         try {
//             const user = decodeToken(token);

//             if (!user || !user.id || !user.role) {
//                 throw new Error('Invalid token');
//             }

//             // Fetch user data from the backend API to verify block status
//             const response = await axiosInstance.get(`/getUser/${user.id}`);
//             const userData = response.data.response;

//             if (user.role === 'user') {
//                 if (userData.isblocked) {
//                     res.clearCookie('userToken'); // Clear token cookie
//                     return res.redirect(authPath); // Redirect to auth page
//                 }

//                 if (!userProtectedPaths.includes(req.path)) {
//                     return res.redirect('/home');
//                 }
//             } else if (user.role === 'performer') {
//                 if (userData.isPerformerBlocked) {
//                     res.clearCookie('userToken'); // Clear token cookie
//                     return res.redirect(authPath); // Redirect to auth page
//                 }

//                 if (!performerProtectedPaths.includes(req.path)) {
//                     return res.redirect('/performer-dashboard');
//                 }
//             } else {
//                 // Unknown role, redirect to auth page
//                 return res.redirect(authPath);
//             }

//             // User or performer is authorized
//             next();
//         } catch (error) {
//             console.error('Error in authMiddleware:', error);

//             if (error instanceof Error) {
//                 res.clearCookie('userToken'); // Clear token cookie
//                 return res.redirect(authPath);
//             } else {
//                 return res.status(500).json({ error: 'Unexpected error occurred' });
//             }
//         }
//     } else {
//         // No token, check if trying to access protected paths
//         if (userProtectedPaths.includes(req.path) || performerProtectedPaths.includes(req.path)) {
//             return res.redirect(authPath);
//         }

//         next(); // No token but accessing non-protected path
//     }
// };

// export default authMiddleware;
