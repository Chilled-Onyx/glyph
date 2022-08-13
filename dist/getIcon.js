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
const crypto_1 = require("crypto");
const getIcon2 = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield fetch(url);
    const iconContent = yield response.blob();
    const etag = (0, crypto_1.createHash)('md5').update(URL.createObjectURL(iconContent)).digest('hex');
    const icon = {
        expires: response.headers.get('expires') || twelveHoursFromNow().toUTCString(),
        lastModified: response.headers.get('last-modified') || (new Date()).toUTCString(),
        type: iconContent.type,
        href: url,
        content: iconContent,
        etag
    };
    return icon;
});
const twelveHoursFromNow = () => {
    const date = new Date();
    date.setTime(date.getTime() + (1000 * 60 * 60 * 12));
    return date;
};
exports.default = getIcon2;
