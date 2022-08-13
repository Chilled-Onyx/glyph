import type Glyph from './types';

class Cache extends Map<string, Glyph.Icon> {
  protected _cacheClearInterval: NodeJS.Timer | undefined;

  constructor() {
    super();

    this.startCacheClear();
  }

  protected _clearCache() {
    const now: number = (new Date()).getTime();
    let expired: number = 0;
    console.log('Checking for cache expiration.');

    [...this].forEach((cacheEntry) => {
      const [ domain, icon ] = cacheEntry;
      const expires          = (new Date(icon.expires)).getTime();

      if(now > expires) {
        expired++;
        this.delete(domain);
      }
    });

    console.log(`Expired ${expired} icons.`);
  }

  public startCacheClear(): this {
    if(undefined !== this._cacheClearInterval) {
      return this;
    }

    this._cacheClearInterval = setInterval(this._clearCache.bind(this), 1000 * 60);
    return this;
  }

  public stopClearCache(): this {
    if(undefined === this._cacheClearInterval) {
      return this;
    }

    clearInterval(this._cacheClearInterval);
    return this;
  }
}

export default Cache;