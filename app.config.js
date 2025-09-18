import 'dotenv/config';

export default {
  expo: {
    name: "BiometricApp3",
    slug: "BiometricApp3",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    extra: {
      API_URL: process.env.API_URL || "https://api-prod.miapp.com",
      API_KEY: process.env.API_KEY || "prod_key",
      APP_VERSION: process.env.APP_VERSION || "1.0.0",
      ENVIRONMENT: process.env.ENVIRONMENT || "production",
      DEBUG_MODE: process.env.DEBUG_MODE === "true",
      MAX_RETRY_ATTEMPTS: parseInt(process.env.MAX_RETRY_ATTEMPTS || "5"),
      TIMEOUT_MS: parseInt(process.env.TIMEOUT_MS || "10000"),
      COMPANY_NAME: process.env.COMPANY_NAME || "Empresa",
      SUPPORT_EMAIL: process.env.SUPPORT_EMAIL || "support@empresa.com"
    },
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false
    },
    web: {
      favicon: "./assets/favicon.png"
    }
  }
};
