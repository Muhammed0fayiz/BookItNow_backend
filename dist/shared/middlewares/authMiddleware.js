"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const userModel_1 = require("../../infrastructure/models/userModel");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.userToken;
        console.log('token', token);
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, 'loginsecrit');
        req.user = decoded;
        const user = yield userModel_1.UserModel.findById(decoded.id);
        console.log('USER', user);
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
    }
    catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
});
exports.default = authMiddleware;
