import type Glyph from './types';
import {createServer, ServerResponse, Server, RequestListener} from 'http';
import Cache from './cache';
import Request from './request';
import getIcon from './getIcon';

const cache = new Cache();

const faviconRegex: RegExp = /<link[^>]+rel=.(icon|shortcut icon|alternate icon)[^>]+>/ig;
const hrefMatch: RegExp = /href=['"]([^>]+)['"]/;

const requestHandler = async (request: Glyph.Request, response: ServerResponse) => {
  request.on('ready', async () => {
    if(request.domain === 'favicon.ico' || request.domain === '') {
      response.statusCode = 404;
      response.end();
      return;
    }

    const cacheIcon: Glyph.Icon | null = cache.get(request.domain);
    if(null !== cacheIcon && request.allowsCache) {
      const etagMatches: boolean = request.getHeader('if-none-match') === cacheIcon.etag;
      const notModified: boolean = (new Date(request.getHeader('if-modified-since', Date.now().toString()))).getTime() < (new Date(cacheIcon.lastModified)).getTime();

      if(etagMatches || notModified) {
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

    let iconLocation: URL = new URL(`http://${request.domain}/favicon.ico`);

    try {
      const fetchDomain: Response = await fetch(`http://${request.domain}`);
      const fetchDomainText: string = await fetchDomain.text();
      let tempMatch: string[] | null = fetchDomainText.match(faviconRegex);

      if(null !== tempMatch) {
        tempMatch = tempMatch[0].match(hrefMatch);
        if(null !== tempMatch) {
          iconLocation = new URL(tempMatch[1], `http://${request.domain}`);
        }
      }
    } catch {
      /** Domain doesn't exist or isn't serving http **/
      console.log('Sending 404 - 1');
      response.statusCode = 404;
      return response.end();
    }

    const icon: Glyph.Icon | null = await getIcon(iconLocation.href);

    if(null === icon) {
      response.statusCode = 404;
      return response.end();
    }

    cache.set(request.domain, icon);

    response.writeHead(200, {
      'content-type': icon.type,
      'content-length': icon.content.length,
      'expires': icon.expires,
      'last-modified': icon.lastModified,
      'etag': icon.etag
    });
    response.end(icon.content);
  });
};

const server: Server = createServer({IncomingMessage: Request}, requestHandler as unknown as RequestListener);

server.listen(80);