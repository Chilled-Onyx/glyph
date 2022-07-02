import type{ IncomingMessage } from 'http';

declare namespace Glyph {
  type Icon = {
    lastModified: string;
    type: string;
    href: string;
    content: string;
    expires: string;
    etag: string;
  };

  class Request extends IncomingMessage {
    public allowsCache: boolean;
    public domain: string;
    public url: string;

    public getHeader(headerName: string, defaultValue?: string): string;
  }
}

export default Glyph;