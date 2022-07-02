import type Glyph from './types';

class Cache implements Glyph.Cache {
  protected _cache: {[domain: string]: Glyph.Icon} = {};

  constructor() {
    setInterval(() => {
      let expired: number = 0;
      console.log('Checking for cache expiration.');

      Object.keys(this._cache).forEach((domain: string) => {
        const icon: Glyph.Icon = this._cache[domain];
        const now: Number      = (new Date()).getTime();
        const expires: Number  = (new Date(icon.expires)).getTime();

        if(now > expires) {
          expired++;
          delete this._cache[domain];
        }
      });

      console.log(`Expired ${expired} icons.`);
    }, 1000 * 60);
  }

  public get(domain: string): Glyph.Icon | null {
    return this._cache[domain] || null;
  }

  public set(domain: string, icon: Glyph.Icon): this {
    this._cache[domain] = icon;

    return this;
  }
}

export default Cache;