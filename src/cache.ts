import type Glyph from './types';
import config from './config';

class Cache extends Map<string, Glyph.Icon> {
  protected _cacheClearInterval: NodeJS.Timer | undefined;

  constructor(iterable: Iterable<any> | undefined = undefined) {
    super(iterable);

    if(config.caching) {
      this.startCacheClear();
    }
  }

  protected _clearCache() {
    const now: number = (new Date()).getTime();

    for(const [domain, icon] of this.entries()) {
      if(now > (new Date(icon.headers.expires)).getTime()) {
        this.delete(domain);
      }
    }
  }

  public set(key: string, value: Glyph.Icon): this {
    if(config.caching) {
      super.set(key, value);
    }

    return this;
  }

  public startCacheClear(): this {
    if(undefined === this._cacheClearInterval) {
      this._cacheClearInterval = setInterval(this._clearCache.bind(this), config.cacheClearingIntervalSeconds * 1000);
    }

    return this;
  }

  public stopClearCache(): this {
    if(undefined !== this._cacheClearInterval) {
      clearInterval(this._cacheClearInterval);
    }

    return this;
  }
}

export default Cache;