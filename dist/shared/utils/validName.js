"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidFullName = isValidFullName;
function isValidFullName(fullName) {
    const fullNameRegex = /^[a-zA-Z\s]{3,}$/;
    return fullNameRegex.test(fullName);
}
