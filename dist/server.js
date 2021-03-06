"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const getIcon_1 = __importDefault(require("./getIcon"));
const cache = {};
const getCache = (domain) => {
    if (undefined === cache[domain]) {
        return null;
    }
    const icon = cache[domain];
    const now = (new Date()).getTime();
    const expires = (new Date(icon.expires)).getTime();
    if (now > expires) {
        delete cache[domain];
        return null;
    }
    return icon;
};
const faviconRegex = /<link[^>]+rel=.(icon|shortcut icon|alternate icon)[^>]+>/ig;
const hrefMatch = /href=['"]([^>]+)['"]/;
const server = (0, http_1.createServer)((request, response) => __awaiter(void 0, void 0, void 0, function* () {
    request.url || (request.url = '/');
    const domain = request.url.split('/')[1];
    if (domain === 'favicon.ico' || domain === '') {
        response.statusCode = 404;
        response.end();
        return;
    }
    const cacheIcon = getCache(domain);
    if (null !== cacheIcon) {
        const etagMatches = undefined !== request.headers['if-none-match'] && request.headers['if-none-match'] === cacheIcon.etag;
        const notModified = undefined !== request.headers['if-modified-since'] &&
            (new Date(request.headers['if-modified-since'])).getTime() < (new Date(cacheIcon.lastModified)).getTime();
        if (etagMatches || notModified) {
            response.statusCode = 304;
            return response.end();
        }
        response.writeHead(200, {
            'content-type': cacheIcon.type,
            'content-length': cacheIcon.content.length,
            'expires': cacheIcon.expires,
            'last-modified': cacheIcon.lastModified,
            'etag': cacheIcon.etag
        });
        return response.end(cacheIcon.content);
    }
    let iconLocation = new URL(`http://${domain}/favicon.ico`);
    try {
        const fetchDomain = yield fetch(`http://${domain}`);
        const fetchDomainText = yield fetchDomain.text();
        let tempMatch = fetchDomainText.match(faviconRegex);
        if (null !== tempMatch) {
            tempMatch = tempMatch[0].match(hrefMatch);
            if (null !== tempMatch) {
                iconLocation = new URL(tempMatch[1], `http://${domain}`);
            }
        }
    }
    catch (_a) {
        /** Domain doesn't exist or isn't serving http **/
        response.statusCode = 404;
        response.end();
        return;
    }
    try {
        const icon = yield (0, getIcon_1.default)(iconLocation.href);
        cache[domain] = icon;
        response.writeHead(200, {
            'content-type': icon.type,
            'content-length': icon.content.length,
            'expires': icon.expires,
            'last-modified': icon.lastModified,
            'etag': icon.etag
        });
        response.end(icon.content);
    }
    catch (_b) {
        /** 404 on the icon url itself - serve default icon **/
    }
}));
server.listen(80);
