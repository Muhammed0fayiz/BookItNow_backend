"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpUser = void 0;
class OtpUser {
    static find() {
        throw new Error("Method not implemented.");
    }
    static findOneAndUpdate(arg0, arg1, arg2) {
        throw new Error("Method not implemented.");
    }
    static updateOne(arg0, arg1) {
        throw new Error("Method not implemented.");
    }
    static findOne(arg0) {
        throw new Error("Method not implemented.");
    }
    constructor(username, email, password, _id, otp) {
        this.username = username;
        this.email = email;
        this.password = password;
        this._id = _id;
        this.otp = otp;
    }
}
exports.OtpUser = OtpUser;
