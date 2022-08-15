"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fs_1 = require("node:fs");
let config = {
    httpPort: 80,
    caching: true,
    cacheClearingIntervalSeconds: 60
};
if ((0, node_fs_1.existsSync)('.env')) {
    const configFile = JSON.parse((0, node_fs_1.readFileSync)('.env').toString());
    config = Object.assign(config, configFile);
}
exports.default = config;
