import type Glyph from './types';

import { createHash } from 'node:crypto';

const getIcon = async (url: string, alreadySwitchedProtocol = false): Promise<Glyph.Icon | null> => {
  try {
    const response      = await fetch(url);

    if(response.status >= 400) return null;

    const iconContent   = await response.blob();

    /** TODO: Clean this up */
    if(iconContent.type.split('/')[0] !== 'image' && iconContent.type !== 'application/octet-stream') return null;

    const etag: string           = createHash('md5').update(Buffer.from(await iconContent.arrayBuffer())).digest('hex');
    const twelveHoursFromNowDate = twelveHoursFromNow()
    const expiresDate            = (new Date(response.headers.get('expires') || ''));
    const expires                = (expiresDate > twelveHoursFromNowDate) ? expiresDate : twelveHoursFromNowDate;
    const type                   = (iconContent.type === 'application/octet-stream') ? 'image/x-icon' : iconContent.type;
    const content                = Buffer.from(await iconContent.arrayBuffer());

    return {
      headers: {
        'content-type': type,
        'content-length': iconContent.size,
        etag,
        expires: expires.toUTCString(),
        'last-modified': response.headers.get('last-modified') || (new Date()).toUTCString()
      },
      content
    };
  } catch {return null;}
}

const twelveHoursFromNow: () => Date = (): Date => {
  const date: Date = new Date();
  date.setTime(date.getTime() + (1000 * 60 * 60 * 12));
  return date;
};

export default getIcon;