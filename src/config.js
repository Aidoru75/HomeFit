// App tier configuration - controlled by EXPO_PUBLIC_APP_TIER env var at build time
// Defaults to 'pro' when not set (local development shows all features)
export const APP_TIER = process.env.EXPO_PUBLIC_APP_TIER || 'pro';
export const IS_PRO = APP_TIER !== 'free';
