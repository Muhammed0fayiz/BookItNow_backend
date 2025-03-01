"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const adminAuth = (req, res, next) => {
    if (req.session && req.session.admin) {
        // If the admin is logged in, allow access to the route
        next();
    }
    else {
        // Redirect to login page if admin is not logged in
        return res.status(401).json({ success: false, message: 'Unauthorized, please login as admin' });
    }
};
exports.adminAuth = adminAuth;
