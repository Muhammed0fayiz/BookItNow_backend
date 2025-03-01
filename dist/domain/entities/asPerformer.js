"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asPerformer = void 0;
class asPerformer {
    constructor(username, email, password, isVerified, isPerformerBlocked, _id) {
        this.username = username;
        this.email = email;
        this.password = password;
        this.isVerified = isVerified;
        this.isPerformerBlocked = isPerformerBlocked;
        this._id = _id;
    }
}
exports.asPerformer = asPerformer;
