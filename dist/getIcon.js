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
const node_crypto_1 = require("node:crypto");
const getIcon = (url, alreadySwitchedProtocol = false) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield fetch(url);
        if (response.status >= 400)
            return null;
        const iconContent = yield response.blob();
        /** TODO: Clean this up */
        if (iconContent.type.split('/')[0] !== 'image' && iconContent.type !== 'application/octet-stream')
            return null;
        const etag = (0, node_crypto_1.createHash)('md5').update(Buffer.from(yield iconContent.arrayBuffer())).digest('hex');
        const twelveHoursFromNowDate = twelveHoursFromNow();
        const expiresDate = (new Date(response.headers.get('expires') || ''));
        const expires = (expiresDate > twelveHoursFromNowDate) ? expiresDate : twelveHoursFromNowDate;
        const type = (iconContent.type === 'application/octet-stream') ? 'image/x-icon' : iconContent.type;
        const content = Buffer.from(yield iconContent.arrayBuffer());
        return {
            headers: {
                'content-type': type,
                'content-length': iconContent.size,
                etag,
                expires: expires.toUTCString(),
                'last-modified': response.headers.get('last-modified') || (new Date()).toUTCString()
            },
            content
        };
    }
    catch (_a) {
        return null;
    }
});
const twelveHoursFromNow = () => {
    const date = new Date();
    date.setTime(date.getTime() + (1000 * 60 * 60 * 12));
    return date;
};
exports.default = getIcon;
