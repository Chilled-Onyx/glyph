"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
class Request extends http_1.IncomingMessage {
    constructor(socket) {
        super(socket);
        this.allowsCache = false;
        this.domain = '';
        this.url = '/';
        this.on('data', () => { }); /* Believe it or not, without this line NodeJS cannot process requests */
        this.on('end', this._handlerEnd.bind(this));
    }
    _handlerEnd() {
        const noCachePragma = this.getHeader('pragma') === 'no-cache';
        const noCacheControl = this.getHeader('cache-control') === 'no-cache';
        this.domain = this.url.split('/')[1];
        this.allowsCache = (!noCacheControl && !noCachePragma);
        this.emit('ready');
    }
    getHeader(headerName, defaultValue = '') {
        if (undefined === this.headers[headerName]) {
            return defaultValue;
        }
        return this.headers[headerName];
    }
}
exports.default = Request;
