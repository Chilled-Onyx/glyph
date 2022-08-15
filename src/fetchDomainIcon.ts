import Glyph from './types';
import getIcon from './getIcon';

const faviconRegex: RegExp = /<link[^>]+rel=.(icon|shortcut icon|alternate icon)[^>]+>/ig;
const hrefMatch: RegExp = /href=['"]([^"|^>]+)['"]/;

const fetchDomainIcon = async (domain: string): Promise<Glyph.Icon | null> => {
  let icon: Glyph.Icon | null = null;

  /** Attempt to fetch favicon first */
  try {
    icon = await getIcon(`https://${domain}/favicon.ico`);
  } catch {}

  /** Attempt to fetch site and get favicon from html */
  try {
    const fetchDomain: Response    = await fetch(`https://${domain}`);
    const fetchUrl: URL            = new URL(fetchDomain.url);
    const fetchDomainText: string  = await fetchDomain.text();
    let tempMatch: string[] | null = fetchDomainText.match(faviconRegex);

    if(null !== tempMatch) {
      tempMatch = tempMatch[tempMatch.length - 1].match(hrefMatch);
      if(null !== tempMatch) {
        icon = await getIcon((new URL(tempMatch[1], `${fetchUrl.protocol}//${fetchUrl.hostname}`)).href);
      }
    }
  } catch {}

  return icon;
};

export default fetchDomainIcon;