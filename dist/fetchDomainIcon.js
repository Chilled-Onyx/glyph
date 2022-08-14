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
const node_dns_1 = require("node:dns");
const getIcon_1 = __importDefault(require("./getIcon"));
const faviconRegex = /<link[^>]+rel=.(icon|shortcut icon|alternate icon)[^>]+>/ig;
const hrefMatch = /href=['"]([^"|^>]+)['"]/;
const fetchDomainIcon = (domain) => __awaiter(void 0, void 0, void 0, function* () {
    /** Check domain actually exists. */
    try {
        yield node_dns_1.promises.resolve(domain);
    }
    catch (_a) {
        return null;
    }
    let icon = null;
    /** Attempt to fetch favicon first */
    try {
        icon = yield (0, getIcon_1.default)(`https://${domain}/favicon.ico`);
    }
    catch (_b) { }
    /** Attempt to fetch site and get favicon from html */
    try {
        const fetchDomain = yield fetch(`https://${domain}`);
        const fetchUrl = new URL(fetchDomain.url);
        const fetchDomainText = yield fetchDomain.text();
        let tempMatch = fetchDomainText.match(faviconRegex);
        if (null !== tempMatch) {
            tempMatch = tempMatch[tempMatch.length - 1].match(hrefMatch);
            if (null !== tempMatch) {
                icon = yield (0, getIcon_1.default)((new URL(tempMatch[1], `${fetchUrl.protocol}//${fetchUrl.hostname}`)).href);
            }
        }
    }
    catch (_c) { }
    return icon;
});
exports.default = fetchDomainIcon;
