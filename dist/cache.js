"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Cache extends Map {
    constructor() {
        super();
        this.startCacheClear();
    }
    _clearCache() {
        const now = (new Date()).getTime();
        let expired = 0;
        console.log('Checking for cache expiration.');
        console.log(`Current cache count: ${this.size}`);
        [...this].forEach((cacheEntry) => {
            const [domain, icon] = cacheEntry;
            const expires = (new Date(icon.headers.expires)).getTime();
            if (now > expires) {
                expired++;
                this.delete(domain);
            }
        });
        console.log(`Expired ${expired} icons.`);
    }
    startCacheClear() {
        if (undefined !== this._cacheClearInterval) {
            return this;
        }
        this._cacheClearInterval = setInterval(this._clearCache.bind(this), 1000 * 60);
        return this;
    }
    stopClearCache() {
        if (undefined === this._cacheClearInterval) {
            return this;
        }
        clearInterval(this._cacheClearInterval);
        return this;
    }
}
exports.default = Cache;
