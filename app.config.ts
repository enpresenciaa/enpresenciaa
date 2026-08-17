import type { ConfigContext, ExpoConfig } from "expo/config";

const Env = require("./app-env.js");

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: Env.NAME,
  slug: "enpresenciaa",
  version: Env.VERSION,
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: Env.SCHEME,
  userInterfaceStyle: "automatic",
  ios: {
    supportsTablet: true,
    bundleIdentifier: Env.BUNDLE_ID,
    infoPlist: {
      NSAppTransportSecurity: {
        NSAllowsArbitraryLoads: true,
        NSAllowsLocalNetworking: true,
      },
      ITSAppUsesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#ffffff",
    },
    package: Env.PACKAGE,
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-image",
    "expo-font",
    "expo-video",
    "expo-web-browser",
    "expo-secure-store",
    "@react-native-community/datetimepicker",
    [
      "expo-build-properties",
      {
        ios: { deploymentTarget: "17.0" },
      },
    ],
    // Force iOS 17.0 for all targets (app + Voltra widget extension) so Swift APIs compile
    "./plugins/withIosDeploymentTarget.js",
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    APP_ENV: Env.APP_ENV,
    API_URL: Env.API_URL,
    router: {},
    eas: {
      projectId: "your-project-id-here",
    },
  },
});
