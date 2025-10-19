import 'dotenv/config';

export default {
  expo: {
    name: "Pookiey",
    slug: "pookiey",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "pookiey",
    userInterfaceStyle: "light",
    newArchEnabled: true,

    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.pookiey.pookiey",
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "Pookiey needs your location to show you matches nearby.",
        NSLocationAlwaysUsageDescription:
          "Pookiey needs your location to show you matches nearby.",
      },
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
      },
    },

    android: {
      softwareKeyboardLayoutMode: "resize",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      permissions: [
        "android.permission.READ_CONTACTS",
        "android.permission.WRITE_CONTACTS",
        "android.permission.RECORD_AUDIO",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.ACCESS_FINE_LOCATION",
      ],
      package: "com.pookiey.pookiey",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },

    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/favicon.png",
    },

    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission:
            "Allow Pookiey to use your location to show you matches nearby.",
          locationAlwaysPermission:
            "Allow Pookiey to use your location to show you matches nearby.",
          locationWhenInUsePermission:
            "Allow Pookiey to use your location to show you matches nearby.",
        },
      ],
      [
        "expo-contacts",
        {
          contactsPermission: "Allow The Dating App to access your contacts.",
        },
      ],
      [
        "expo-image-picker",
        {
          photosPermission:
            "The Dating App requires access to your photos to upload profile pictures.",
          cameraPermission:
            "The Dating App requires access to your camera to take profile pictures.",
        },
      ],
      "expo-font",
      "expo-secure-store",
      "expo-web-browser",
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      router: {},
      eas: {
        projectId: "bf4420c6-9f01-4b1c-a6f3-a233e8509b1e",
      },
    },

    owner: "shadow-developer",
  },
};
