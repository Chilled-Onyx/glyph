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

  interface Cache {
    get: (domain: string) => Glyph.Icon | null;
    set: (domain: string, icon: Glyph.Icon) => Glyph.Cache;
  }

  class Request extends IncomingMessage {
    public allowsCache: boolean;
    public domain: string;
    public url: string;

    public getHeader(headerName: string, defaultValue?: string): string;
  }
}

export default Glyph;