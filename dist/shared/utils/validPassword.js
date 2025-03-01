"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidPassword = isValidPassword;
function isValidPassword(password) {
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{5,}$/;
    return passwordRegex.test(password);
}
