"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
// Define the User class
class User {
    constructor(username, email, password, isVerified, isblocked, _id) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.isVerified = isVerified;
        this.isblocked = isblocked;
        this._id = _id;
    }
}
exports.User = User;
