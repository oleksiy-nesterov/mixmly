import { useStore } from '@/store/Store.ts';
import { useEffect } from 'react';

const getSystemColorScheme = (): 'dark' | 'light' => {
  if (typeof window === 'undefined') {
    return 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

export const useColorScheme = () => {
  const scheme = useStore((state) => state.colorScheme);
  const colorScheme = scheme === 'system' ? getSystemColorScheme() : scheme;

  useEffect(() => {
    document.documentElement.classList.remove('dark', 'light');
    document.documentElement.classList.add(colorScheme);
  }, [colorScheme]);

  return colorScheme;
};
