"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The possible error codes given as reasons for closed websocket connections.
 *
 * Custom error codes are allowed to be in the range between 4000 and 4999.
 *
 * See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
 */
var MessageError;
(function (MessageError) {
    /**
     * The error code indicating that there was actually no error. Is used when leaving a room.
     */
    MessageError[MessageError["NormalClosure"] = 1000] = "NormalClosure";
    /**
     * Indicates that the connection was closed abnormally, i.e. without a close frame.
     *
     * Reserved value, which means is only received as an error code, cannot be used as a status code
     * for close manually.
     */
    MessageError[MessageError["AbnormalClosure"] = 1006] = "AbnormalClosure";
    MessageError[MessageError["InvalidPayload"] = 4000] = "InvalidPayload";
    MessageError[MessageError["RoomNotFound"] = 4001] = "RoomNotFound";
    MessageError[MessageError["NicknameInUse"] = 4002] = "NicknameInUse";
    MessageError[MessageError["Other"] = 4003] = "Other";
})(MessageError = exports.MessageError || (exports.MessageError = {}));
var MessageType;
(function (MessageType) {
    MessageType[MessageType["EnterRoom"] = 0] = "EnterRoom";
    MessageType[MessageType["RoomEntered"] = 1] = "RoomEntered";
    MessageType[MessageType["NewUser"] = 2] = "NewUser";
    MessageType[MessageType["UserLeft"] = 3] = "UserLeft";
    MessageType[MessageType["Text"] = 4] = "Text";
    MessageType[MessageType["NextPath"] = 5] = "NextPath";
    MessageType[MessageType["UndoPath"] = 6] = "UndoPath";
    MessageType[MessageType["ClearSketching"] = 7] = "ClearSketching";
    MessageType[MessageType["CompleteSketching"] = 8] = "CompleteSketching";
    MessageType[MessageType["NextSketcher"] = 9] = "NextSketcher";
})(MessageType = exports.MessageType || (exports.MessageType = {}));
function extractMessage(messageData) {
    var json;
    try {
        json = JSON.parse(messageData);
    }
    catch (err) {
        throw new Error("Invalid format " + event);
    }
    if (typeof json.type !== "number") {
        throw new Error("Invalid message format");
    }
    return json;
}
exports.extractMessage = extractMessage;
function prepareMessage(event) {
    return JSON.stringify(event);
}
exports.prepareMessage = prepareMessage;
//# sourceMappingURL=message.js.map