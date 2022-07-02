import {createServer, IncomingMessage, ServerResponse, Server} from 'http';
import getIcon, { Icon } from './getIcon';

const cache: {[domain: string]: Icon} = {};
const getCache: (domain: string) => Icon | null = (domain: string): Icon | null => {
  if(undefined === cache[domain]) {
    return null;
  }

  const icon: Icon = cache[domain];
  const now: number = (new Date()).getTime();
  const expires: number = (new Date(icon.expires)).getTime();

  if(now > expires) {
    delete cache[domain];
    return null;
  }

  return icon;
};

const faviconRegex: RegExp = /<link[^>]+rel=.(icon|shortcut icon|alternate icon)[^>]+>/ig;
const hrefMatch: RegExp = /href=['"]([^>]+)['"]/;

const server: Server = createServer(async (request: IncomingMessage, response: ServerResponse) => {
  request.url ||= '/';

  const domain: string = request.url.split('/')[1];

  if(domain === 'favicon.ico' || domain === '') {
    response.statusCode = 404;
    response.end();
    return;
  }

  const cacheIcon: Icon | null = getCache(domain);
  if(null !== cacheIcon) {
    const etagMatches: boolean = undefined !== request.headers['if-none-match'] && request.headers['if-none-match'] === cacheIcon.etag;
    const notModified: boolean = undefined !== request.headers['if-modified-since'] &&
                                 (new Date(request.headers['if-modified-since'])).getTime() < (new Date(cacheIcon.lastModified)).getTime();

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

  let iconLocation: URL = new URL(`http://${domain}/favicon.ico`);

  try {
    const fetchDomain: Response = await fetch(`http://${domain}`);
    const fetchDomainText: string = await fetchDomain.text();
    let tempMatch: string[] | null = fetchDomainText.match(faviconRegex);

    if(null !== tempMatch) {
      tempMatch = tempMatch[0].match(hrefMatch);
      if(null !== tempMatch) {
        iconLocation = new URL(tempMatch[1], `http://${domain}`);
      }
    }
  } catch {
    /** Domain doesn't exist or isn't serving http **/
    response.statusCode = 404;
    response.end();
    return;
  }

  try {
    const icon: Icon = await getIcon(iconLocation.href);
    cache[domain] = icon;

    response.writeHead(200, {
      'content-type': icon.type,
      'content-length': icon.content.length,
      'expires': icon.expires,
      'last-modified': icon.lastModified,
      'etag': icon.etag
    });
    response.end(icon.content);
  } catch {
    /** 404 on the icon url itself - serve default icon **/
  }
});

server.listen(80);