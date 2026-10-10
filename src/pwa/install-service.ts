import { useStore } from 'zustand';
import { createStore } from 'zustand/vanilla';

const DEFAULT_START_URL = '/';

type BeforeInstallPromptEvent = Event & {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt: () => Promise<void>;
};

export type PwaLaunchMode = 'browser' | 'standalone';

const installStore = createStore<{
  installPrompt: BeforeInstallPromptEvent | null;
  launchMode: PwaLaunchMode;
  setLaunchMode: (launchMode: PwaLaunchMode) => void;
}>()((set) => ({
  installPrompt: null,
  launchMode: 'browser',
  setLaunchMode: (launchMode) => {
    set({ launchMode });
  },
}));

export class InstallService {
  private static mediaQuery: MediaQueryList | null = null;

  private static handleBeforeInstallPrompt = (event: Event) => {
    const promptEvent = event as BeforeInstallPromptEvent;
    promptEvent.preventDefault();
    installStore.setState({
      installPrompt: promptEvent,
    });
  };

  private static handleAppInstalled = () => {
    installStore.setState({
      installPrompt: null,
    });
  };

  private static handleDisplayModeChange = () => {
    const launchMode: PwaLaunchMode = this.isStandalone
      ? 'standalone'
      : 'browser';
    installStore.getState().setLaunchMode(launchMode);
  };

  private static uninitialize() {
    if (typeof window === 'undefined') {
      return;
    }
    window.removeEventListener(
      'beforeinstallprompt',
      this.handleBeforeInstallPrompt,
    );
    window.removeEventListener('appinstalled', this.handleAppInstalled);
    this.mediaQuery?.removeEventListener(
      'change',
      this.handleDisplayModeChange,
    );
  }

  static initialize() {
    if (typeof window === 'undefined') {
      return;
    }
    this.uninitialize();
    this.handleDisplayModeChange();

    this.mediaQuery = window.matchMedia('(display-mode: standalone)');
    window.addEventListener(
      'beforeinstallprompt',
      this.handleBeforeInstallPrompt,
    );
    window.addEventListener('appinstalled', this.handleAppInstalled);
    this.mediaQuery.addEventListener('change', this.handleDisplayModeChange);
  }

  static get launchMode() {
    return installStore.getState().launchMode;
  }

  static get installPrompt() {
    return installStore.getState().installPrompt;
  }

  static get isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (
        window.navigator as Navigator & {
          standalone?: boolean;
        }
      ).standalone === true
    );
  }

  static async getStartUrl() {
    const manifestLink = document.querySelector<HTMLLinkElement>(
      'link[rel="manifest"]',
    );

    if (!manifestLink?.href) {
      return new URL(DEFAULT_START_URL, window.location.origin).toString();
    }

    try {
      const response = await fetch(manifestLink.href);

      if (!response.ok) {
        return new URL(DEFAULT_START_URL, window.location.origin).toString();
      }

      const manifest = (await response.json()) as {
        start_url?: string;
      };

      if (!manifest.start_url) {
        return new URL(DEFAULT_START_URL, window.location.origin).toString();
      }

      return new URL(manifest.start_url, manifestLink.href).toString();
    } catch {
      return new URL(DEFAULT_START_URL, window.location.origin).toString();
    }
  }

  static clearInstallPrompt() {
    installStore.setState({ installPrompt: null });
  }
}

export const useInstallService = () => {
  const installPrompt = useStore(installStore, (state) => state.installPrompt);
  const launchMode = useStore(installStore, (state) => state.launchMode);

  return {
    installPrompt,
    launchMode,
  };
};
