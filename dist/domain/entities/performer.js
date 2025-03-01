"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Performer = void 0;
// Define the User class
class Performer {
    static findById(id) {
        throw new Error("Method not implemented.");
    }
    constructor(userId, bandName, mobileNumber, rating, description) {
        this.userId = userId;
        this.bandName = bandName;
        this.mobileNumber = mobileNumber;
        this.rating = rating;
        this.description = description;
    }
}
exports.Performer = Performer;
