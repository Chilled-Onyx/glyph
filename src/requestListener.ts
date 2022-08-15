import type Glyph from './types';
import type { ServerResponse, RequestListener } from 'node:http';

import Cache from './cache';
import fetchDomainIcon from './fetchDomainIcon';

const cache = new Cache();

const requestListener = (request: Glyph.Request, response: ServerResponse) => {
  request.on('ready', async () => {
    /** This server doesn't have a favicon, and you must provide a domain to get a favicon for */
    if(request.domain === 'favicon.ico' || request.domain === '') {
      response.statusCode = 404;
      response.end();
      return;
    }

    const cacheIcon: Glyph.Icon | undefined = cache.get(request.domain);
    if(undefined !== cacheIcon && request.allowsCache) {
      const etagMatches: boolean = request.getHeader('if-none-match') === cacheIcon.headers.etag;
      const notModified: boolean = (new Date(request.getHeader('if-modified-since', Date.now().toString()))).getTime() < (new Date(cacheIcon.headers['last-modified'])).getTime();

      if(etagMatches || notModified) {
        response.statusCode = 304;
        return response.end();
      }

      response.writeHead(200, cacheIcon.headers);
      return response.end(await cacheIcon.content);
    }

    let icon: Glyph.Icon | null = await fetchDomainIcon(request.domain);

    if(null === icon) {
      response.statusCode = 404;
      return response.end();
    }

    cache.set(request.domain, icon);

    response.writeHead(200, icon.headers);
    response.end(await icon.content);
  });
};

export default requestListener as RequestListener;