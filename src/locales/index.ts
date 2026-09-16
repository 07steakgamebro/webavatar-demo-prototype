import en from './en';
import th from './th';
import zh from './zh';
import ja from './ja';
import ko from './ko';
import es from './es';
import fr from './fr';

export const translations = {
  en,
  th,
  zh,
  ja,
  ko,
  es,
  fr,
} as const;

export type TranslationKey = string;
export default translations;
