import es from './es';
import en from './en';

export const DEFAULT_LANGUAGE = 'es';

export const LOCALES = {
  es: 'es-CO',
  en: 'en-US',
};

const DICTIONARIES = { es, en };

const lookup = (dictionary, key) => key.split('.').reduce((node, part) => node?.[part], dictionary);

const interpolate = (text, params = {}) => text.replace(/\{(\w+)\}/g, (match, name) => params[name] ?? match);

export const translate = (language, message, params) => {
  if (!message) {
    return '';
  }
  if (typeof message === 'object') {
    return translate(language, message.key, message.params);
  }

  const text = lookup(DICTIONARIES[language], message) ?? lookup(es, message);
  return typeof text === 'string' ? interpolate(text, params) : message;
};
