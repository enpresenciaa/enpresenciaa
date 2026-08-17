/**
 * Environment configuration for En Presenciaa.
 * Supports: local | preview | production
 *
 * @type {'local' | 'preview' | 'production'}
 */
const process = require("node:process");

const APP_ENV = process.env.EXPO_PUBLIC_APP_ENV ?? "local";

const { version } = require("./package.json");

// Bundle IDs per environment
const BUNDLE_IDS = {
  local: "com.enpresenciaa.app",
  preview: "com.enpresenciaa.app",
  production: "com.enpresenciaa.app",
};

// Android package names per environment
const PACKAGES = {
  local: "com.enpresenciaa.app",
  preview: "com.enpresenciaa.app",
  production: "com.enpresenciaa.app",
};

// URL schemes per environment
const SCHEMES = {
  local: "enpresenciaa",
  preview: "enpresenciaa",
  production: "enpresenciaa",
};

// App names per environment
const NAMES = {
  local: "En Presenciaa (Local)",
  preview: "En Presenciaa (Preview)",
  production: "En Presenciaa",
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
