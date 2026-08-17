/**
 * Type-safe re-export of app-env.js for use in src/ code.
 */

export type AppEnv = "local" | "preview" | "production";

interface EnvConfig {
  APP_ENV: AppEnv;
  NAME: string;
  SCHEME: string;
  BUNDLE_ID: string;
  PACKAGE: string;
  API_URL: string;
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Env: EnvConfig = require("./app-env.js");

export default Env;
