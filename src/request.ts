import type Glyph from './types';
import { Socket } from 'net';
import { IncomingMessage } from 'http';


class Request extends IncomingMessage {
  public allowsCache: boolean = false;
  public domain: string = '';
  public url: string = '/';

  constructor(socket: Socket) {
    super(socket);

    this.on('data', () => {}); /* Believe it or not, without this line NodeJS cannot process requests */
    this.on('end', this._handlerEnd.bind(this));
  }

  protected _handlerEnd() {
    const noCachePragma: boolean  = this.getHeader('pragma') === 'no-cache';
    const noCacheControl: boolean = this.getHeader('cache-control') === 'no-cache';

    this.domain      = this.url.split('/')[1];
    this.allowsCache = (!noCacheControl && !noCachePragma);
    this.emit('ready');
  }

  public getHeader(headerName: string, defaultValue: string = '') {
    if(undefined === this.headers[headerName]) {
      return defaultValue;
    }

    return this.headers[headerName];
  }
}

export default Request as typeof Glyph.Request;