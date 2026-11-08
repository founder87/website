/// <reference types="astro/client" />

declare const __SITE_SETTINGS__: Readonly<{
  origin: string;
  indexable: boolean;
  contactEmail: string;
  contactEnabled: boolean;
  contactProvider: string;
}>;
