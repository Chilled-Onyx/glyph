"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
class Cache extends Map {
    constructor(iterable = undefined) {
        super(iterable);
        if (config_1.default.caching) {
            this.startCacheClear();
        }
    }
    _clearCache() {
        const now = (new Date()).getTime();
        for (const [domain, icon] of this.entries()) {
            if (now > (new Date(icon.headers.expires)).getTime()) {
                this.delete(domain);
            }
        }
    }
    set(key, value) {
        if (config_1.default.caching) {
            super.set(key, value);
        }
        return this;
    }
    startCacheClear() {
        if (undefined === this._cacheClearInterval) {
            this._cacheClearInterval = setInterval(this._clearCache.bind(this), config_1.default.cacheClearingIntervalSeconds * 1000);
        }
        return this;
    }
    stopClearCache() {
        if (undefined !== this._cacheClearInterval) {
            clearInterval(this._cacheClearInterval);
        }
        return this;
    }
}
exports.default = Cache;
