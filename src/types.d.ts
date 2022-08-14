import type{ IncomingMessage } from 'http';

declare namespace Glyph {
  type Icon = {
    headers: {
      'content-type': string;
      'content-length': number;
      etag: string;
      expires: string;
      'last-modified': string;
    };
    content: Buffer
  };

  type Cache = Map<string, Glyph.Icon>;

  class Request extends IncomingMessage {
    public allowsCache: boolean;
    public domain: string;
    public url: string;

    public getHeader(headerName: string, defaultValue?: string): string;
  }
}

export default Glyph;