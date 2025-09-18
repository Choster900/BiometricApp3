export interface EnvConfig {
  API_URL: string;
  API_KEY: string;
  APP_VERSION: string;
  ENVIRONMENT: string;
  DEBUG_MODE: boolean;
  MAX_RETRY_ATTEMPTS: number;
  TIMEOUT_MS: number;
  COMPANY_NAME: string;
  SUPPORT_EMAIL: string;
}

declare module '@expo/config' {
  interface ExpoConfig {
    extra: EnvConfig;
  }
}