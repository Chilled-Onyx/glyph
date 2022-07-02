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
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = require("http");
const https_1 = require("https");
const stream_1 = require("stream");
const crypto_1 = require("crypto");
const getIcon = (url) => {
    return new Promise((resolve, reject) => {
        const get = url.startsWith('https') ? https_1.get : http_1.get;
        get(url, (response) => {
            let testStream = new BodyStream();
            response.pipe(testStream);
            response.on('end', () => __awaiter(void 0, void 0, void 0, function* () {
                if (undefined !== response.statusCode && response.statusCode >= 300 && response.statusCode <= 399) {
                    resolve(yield getIcon(response.headers['location']));
                    return;
                }
                const iconContent = testStream.read();
                const etag = (0, crypto_1.createHash)('md5').update(iconContent).digest('hex');
                resolve({
                    expires: response.headers['expires'] || twelveHoursFromNow().toUTCString(),
                    lastModified: response.headers['last-modified'] || (new Date()).toUTCString(),
                    type: response.headers['content-type'] || 'image/png',
                    href: url,
                    content: iconContent,
                    etag
                });
            }));
        })
            .on('error', reject);
    });
};
class BodyStream extends stream_1.Transform {
    _write(chunk, encoding, cb) {
        this.push(chunk);
        cb();
    }
}
const twelveHoursFromNow = () => {
    const date = new Date();
    date.setTime(date.getTime() + (1000 * 60 * 60 * 12));
    return date;
};
exports.default = getIcon;
