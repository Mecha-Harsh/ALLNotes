"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Y = require("yjs");
var y_websocket_1 = require("y-websocket");
var doc = new Y.Doc();
var wsProvider = new y_websocket_1.WebsocketProvider('ws://localhost:1234', 'my-roomname', doc);
wsProvider.on('status', function (event) {
    console.log(event.status); // logs "connected" or "disconnected"
});
