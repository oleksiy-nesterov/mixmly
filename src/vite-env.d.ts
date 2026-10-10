/// <reference types="vite/client" />

declare const APP_VERSION: string;

declare module '*.svg' {
  const content: string;
  export default content;
}

type PublicAppEnv = {
  readonly VITE_PROJECT_NAME: string;
  readonly VITE_PROJECT_TITLE: string;
  readonly VITE_PROJECT_DESCRIPTION: string;
  readonly VITE_PROJECT_KEYWORDS: string;
  readonly VITE_PROJECT_URL: string;
};
