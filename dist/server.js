"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_http_1 = require("node:http");
const request_1 = __importDefault(require("./src/request"));
const requestListener_1 = __importDefault(require("./src/requestListener"));
const config_1 = __importDefault(require("./src/config"));
const server = (0, node_http_1.createServer)({ IncomingMessage: request_1.default }, requestListener_1.default);
server.listen(config_1.default.httpPort);
console.log(`Server started on port ${config_1.default.httpPort}`);
