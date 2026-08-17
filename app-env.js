/**
 * Environment configuration for Subscribed.
 * Supports: local | preview | production
 *
 * @type {'local' | 'preview' | 'production'}
 */
const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV ?? "local";

const { version } = require("./package.json");

// Bundle IDs per environment
const BUNDLE_IDS = {
  local: "com.subscribed.app.local",
  preview: "com.subscribed.app.preview",
  production: "com.subscribed.app",
};

// Android package names per environment
const PACKAGES = {
  local: "com.subscribed.app.local",
  preview: "com.subscribed.app.preview",
  production: "com.subscribed.app",
};

// URL schemes per environment
const SCHEMES = {
  local: "subscribed.local",
  preview: "subscribed.preview",
  production: "subscribed",
};

// App names per environment
const NAMES = {
  local: "Subscribed (Local)",
  preview: "Subscribed (Preview)",
  production: "Subscribed",
};

// API URL per environment
const API_URLS = {
  local: "https://subscribed-apis.onrender.com",
  preview: "https://subscribed-apis.onrender.com",
  production: "https://subscribed-apis.onrender.com",
};

const Env = {
  APP_ENV,
  NAME: NAMES[APP_ENV],
  SCHEME: SCHEMES[APP_ENV],
  BUNDLE_ID: BUNDLE_IDS[APP_ENV],
  PACKAGE: PACKAGES[APP_ENV],
  VERSION: version,
  API_URL: process.env.EXPO_PUBLIC_API_URL ?? API_URLS[APP_ENV],
};

module.exports = Env;
