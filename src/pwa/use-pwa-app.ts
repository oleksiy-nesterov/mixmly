import { useEffect, useState } from 'react';

import { InstallService, useInstallService } from '@/pwa/install-service';

InstallService.initialize();

export const usePwaApp = () => {
  const { installPrompt, launchMode } = useInstallService();

  const [startUrl, setStartUrl] = useState(() =>
    new URL('/', window.location.origin).toString(),
  );

  useEffect(() => {
    InstallService.getStartUrl().then(setStartUrl);
  }, []);

  const installApp = async () => {
    if (!installPrompt) {
      return;
    }

    await installPrompt.prompt();
    const userChoice = await installPrompt.userChoice;
    if (userChoice.outcome === 'accepted') {
      InstallService.clearInstallPrompt();
    }
  };

  const openApp = () => {
    const openedWindow = window.open(startUrl, '_blank', 'noopener');
    return openedWindow !== null;
  };

  return {
    launchMode,
    canInstallApp: installPrompt !== null,
    canOpenApp: launchMode !== 'standalone' && installPrompt === null,
    openApp,
    installApp,
  };
};
