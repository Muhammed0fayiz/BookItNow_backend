"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseStatus = void 0;
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["OK"] = 200] = "OK";
    ResponseStatus[ResponseStatus["Created"] = 201] = "Created";
    ResponseStatus[ResponseStatus["Accepted"] = 202] = "Accepted";
    ResponseStatus[ResponseStatus["BadRequest"] = 400] = "BadRequest";
    ResponseStatus[ResponseStatus["Unauthorized"] = 401] = "Unauthorized";
    ResponseStatus[ResponseStatus["Forbidden"] = 403] = "Forbidden";
    ResponseStatus[ResponseStatus["NotFound"] = 404] = "NotFound";
    ResponseStatus[ResponseStatus["Conflict"] = 409] = "Conflict";
    ResponseStatus[ResponseStatus["InternalSeverError"] = 500] = "InternalSeverError";
    ResponseStatus[ResponseStatus["NoContent"] = 204] = "NoContent";
})(ResponseStatus || (exports.ResponseStatus = ResponseStatus = {}));
