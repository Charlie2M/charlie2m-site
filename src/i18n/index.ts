import en from './en';
import es from './es';
import de from './de';

export type Dict = typeof en;
export const languages = { en: 'English', es: 'Español', de: 'Deutsch' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'en';

const dicts: Record<Lang, Dict> = { en, es, de };

export function t(lang: Lang): Dict {
  return dicts[lang];
}

export type Page = 'home' | 'gaming' | 'future';
const slugs: Record<Page, string> = { home: '', gaming: 'gaming', future: 'future' };

/** Builds a URL for a page in a language. English lives at the root. */
export function pathFor(lang: Lang, page: Page, hash = ''): string {
  const parts = [lang === defaultLang ? '' : lang, slugs[page]].filter(Boolean);
  return '/' + parts.join('/') + (parts.length ? '/' : '') + hash;
}

/** Shared getStaticPaths for every page under src/pages/[...lang]/ */
export function langPaths() {
  return (Object.keys(languages) as Lang[]).map((lang) => ({
    params: { lang: lang === defaultLang ? undefined : lang },
    props: { lang },
  }));
}
