import type Glyph from './types';

import { createHash } from 'crypto';

const getIcon2 = async (url: string) => {
  const response      = await fetch(url);
  const iconContent   = await response.blob();
  const etag: string  = createHash('md5').update(URL.createObjectURL(iconContent)).digest('hex');

  const icon: Glyph.Icon = {
    expires: response.headers.get('expires') || twelveHoursFromNow().toUTCString(),
    lastModified: response.headers.get('last-modified') || (new Date()).toUTCString(),
    type: iconContent.type,
    href: url,
    content: iconContent,
    etag
  };

  return icon;
}

const twelveHoursFromNow: () => Date = (): Date => {
  const date: Date = new Date();
  date.setTime(date.getTime() + (1000 * 60 * 60 * 12));
  return date;
};

export default getIcon2;