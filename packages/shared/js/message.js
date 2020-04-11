"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * The possible error resonse codes used for handling messages. Since the error code is passed to
 * websocket.close it must start be between 4000 and 4999.
 * See https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
 */
var MessageError;
(function (MessageError) {
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
    MessageType[MessageType["CompleteSketching"] = 6] = "CompleteSketching";
    MessageType[MessageType["NextSketcher"] = 7] = "NextSketcher";
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