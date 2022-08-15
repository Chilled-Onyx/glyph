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
const cache_1 = __importDefault(require("./cache"));
const fetchDomainIcon_1 = __importDefault(require("./fetchDomainIcon"));
const cache = new cache_1.default();
const requestListener = (request, response) => {
    request.on('ready', () => __awaiter(void 0, void 0, void 0, function* () {
        /** This server doesn't have a favicon, and you must provide a domain to get a favicon for */
        if (request.domain === 'favicon.ico' || request.domain === '') {
            response.statusCode = 404;
            response.end();
            return;
        }
        const cacheIcon = cache.get(request.domain);
        if (undefined !== cacheIcon && request.allowsCache) {
            const etagMatches = request.getHeader('if-none-match') === cacheIcon.headers.etag;
            const notModified = (new Date(request.getHeader('if-modified-since', Date.now().toString()))).getTime() < (new Date(cacheIcon.headers['last-modified'])).getTime();
            if (etagMatches || notModified) {
                response.statusCode = 304;
                return response.end();
            }
            response.writeHead(200, cacheIcon.headers);
            return response.end(yield cacheIcon.content);
        }
        let icon = yield (0, fetchDomainIcon_1.default)(request.domain);
        if (null === icon) {
            response.statusCode = 404;
            return response.end();
        }
        cache.set(request.domain, icon);
        response.writeHead(200, icon.headers);
        response.end(yield icon.content);
    }));
};
exports.default = requestListener;
