import { Locale } from '../i18n/locale';

export type LocalizedText = Readonly<Partial<Record<Locale, string>>>;
