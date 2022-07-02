"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Cache {
    constructor() {
        this._cache = {};
        setInterval(() => {
            let expired = 0;
            console.log('Checking for cache expiration.');
            Object.keys(this._cache).forEach((domain) => {
                const icon = this._cache[domain];
                const now = (new Date()).getTime();
                const expires = (new Date(icon.expires)).getTime();
                if (now > expires) {
                    expired++;
                    delete this._cache[domain];
                }
            });
            console.log(`Expired ${expired} icons.`);
        }, 1000 * 60);
    }
    get(domain) {
        return this._cache[domain] || null;
    }
    set(domain, icon) {
        this._cache[domain] = icon;
        return this;
    }
}
exports.default = Cache;
