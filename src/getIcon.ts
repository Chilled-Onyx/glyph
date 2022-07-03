import type Glyph from './types';

import { get as getHTTP, IncomingMessage }  from 'http';
import { get as getHTTPS } from 'https';
import { Transform } from 'stream';
import { createHash } from 'crypto';

const getIcon = (url: string): Promise<Glyph.Icon | null> => {
  return new Promise((resolve, reject) => {
    const get = url.startsWith('https') ? getHTTPS : getHTTP;

    get(url, (response: IncomingMessage) => {
      let testStream: BodyStream = new BodyStream();

      response.pipe(testStream);

      response.on('end', async () => {
        if(undefined !== response.statusCode && response.statusCode >= 300 && response.statusCode <= 399) {
          resolve(await getIcon(response.headers['location']!));
          return;
        }

        const iconContent: Buffer = testStream.read();

        if(undefined !== response.statusCode && response.statusCode >= 400 && response.statusCode <= 599) {
          resolve(null);
        }

        const etag: string        = createHash('md5').update(iconContent).digest('hex');

        resolve({
          expires: response.headers['expires'] || twelveHoursFromNow().toUTCString(),
          lastModified: response.headers['last-modified'] || (new Date()).toUTCString(),
          type: response.headers['content-type'] || 'image/png',
          href: url,
          content: iconContent.toString(),
          etag
        });
      });
    })
    .on('error', () => resolve(null));
  });
};

class BodyStream extends Transform {
  public _write(chunk: Buffer, encoding: BufferEncoding, cb:(error?: Error | null) => void) {
    this.push(chunk);
    cb();
  }
}

const twelveHoursFromNow: () => Date = (): Date => {
  const date: Date = new Date();
  date.setTime(date.getTime() + (1000 * 60 * 60 * 12));
  return date;
};

export default getIcon;