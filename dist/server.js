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
const cache_1 = __importDefault(require("./cache"));
const request_1 = __importDefault(require("./request"));
const getIcon_1 = __importDefault(require("./getIcon"));
const cache = new cache_1.default();
const faviconRegex = /<link[^>]+rel=.(icon|shortcut icon|alternate icon)[^>]+>/ig;
const hrefMatch = /href=['"]([^>]+)['"]/;
const requestHandler = (request, response) => __awaiter(void 0, void 0, void 0, function* () {
    request.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
        if (request.domain === 'favicon.ico' || request.domain === '') {
            response.statusCode = 404;
            response.end();
            return;
        }
        const cacheIcon = cache.get(request.domain);
        if (undefined !== cacheIcon && request.allowsCache) {
            const etagMatches = request.getHeader('if-none-match') === cacheIcon.etag;
            const notModified = (new Date(request.getHeader('if-modified-since', Date.now().toString()))).getTime() < (new Date(cacheIcon.lastModified)).getTime();
            if (etagMatches || notModified) {
                response.statusCode = 304;
                return response.end();
            }
            response.writeHead(200, {
                'content-type': cacheIcon.type,
                'content-length': cacheIcon.content.size,
                'expires': cacheIcon.expires,
                'last-modified': cacheIcon.lastModified,
                'etag': cacheIcon.etag
            });
            return response.end(Buffer.from(yield cacheIcon.content.arrayBuffer()));
        }
        let iconLocation = new URL(`http://${request.domain}/favicon.ico`);
        try {
            const fetchDomain = yield fetch(`http://${request.domain}`);
            const fetchDomainText = yield fetchDomain.text();
            let tempMatch = fetchDomainText.match(faviconRegex);
            if (null !== tempMatch) {
                tempMatch = tempMatch[0].match(hrefMatch);
                if (null !== tempMatch) {
                    iconLocation = new URL(tempMatch[1], `http://${request.domain}`);
                }
            }
        }
        catch (_a) {
            /** Domain doesn't exist or isn't serving http **/
            console.log('Sending 404 - 1');
            response.statusCode = 404;
            return response.end();
        }
        const icon = yield (0, getIcon_1.default)(iconLocation.href);
        if (null === icon) {
            response.statusCode = 404;
            return response.end();
        }
        cache.set(request.domain, icon);
        response.writeHead(200, {
            'content-type': icon.type,
            'content-length': icon.content.size,
            'expires': icon.expires,
            'last-modified': icon.lastModified,
            'etag': icon.etag
        });
        response.end(Buffer.from(yield icon.content.arrayBuffer()));
    }));
});
const server = (0, http_1.createServer)({ IncomingMessage: request_1.default }, requestHandler);
server.listen(80);
console.log('Server started');
