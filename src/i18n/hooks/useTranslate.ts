import { useTranslation } from 'react-i18next';

interface UseTranslateOptions {
  ns?: string;
  defaultValue?: string;
}

export function useTranslate(key: string, options?: UseTranslateOptions) {
  const { t } = useTranslation(options?.ns || 'common');
  return t(key, { defaultValue: options?.defaultValue || key });
}
