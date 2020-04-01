"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var MessageType;
(function (MessageType) {
    MessageType[MessageType["EnterRoom"] = 0] = "EnterRoom";
    MessageType[MessageType["Text"] = 1] = "Text";
    MessageType[MessageType["NextPath"] = 2] = "NextPath";
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