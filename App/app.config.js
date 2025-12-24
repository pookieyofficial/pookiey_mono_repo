import 'dotenv/config';

export default {
  expo: {
    name: "Pookiey",
    slug: "pookieycom",
    version: "1.0.1",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "pookiey",
    userInterfaceStyle: "light",
    newArchEnabled: false,
    platforms: ["ios", "android"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.pookiey.pookiey",
      icon: "./assets/images/icon.png",
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
        "android.permission.READ_EXTERNAL_STORAGE",
        "android.permission.WRITE_EXTERNAL_STORAGE",
        "android.permission.READ_MEDIA_IMAGES",
        "android.permission.READ_MEDIA_VIDEO",
      ],
      package: "com.pookiey.pookiey",
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY,
        },
      },
    },

    plugins: [
      "expo-router",
      "expo-font",
      "expo-secure-store",
      "expo-web-browser",
      "./plugins/withTwilioVoiceAndroid",
      [
        "expo-audio",
        {
          "microphonePermission": "Allow Pookiey to access your microphone."
        }
      ],

      [
        "expo-splash-screen",
        {
          image: "./assets/images/icon.png",
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
          contactsPermission: "Allow Pookiey to access your contacts.",
        },
      ],

      [
        "expo-image-picker",
        {
          photosPermission:
            "Pookiey requires access to your photos to upload profile pictures.",
          cameraPermission:
            "Pookiey requires access to your camera to take profile pictures.",
        },
      ],
      [
        "expo-media-library",
        {
          photosPermission: "Allow Pookiey to access your photos to save stories.",
          savePhotosPermission: "Allow Pookiey to save photos to your gallery.",
          isAccessMediaLocationEnabled: true,
        },
      ],
      "expo-font",
      "expo-secure-store",
      "expo-web-browser",
    ],

    experiments: {
      typedRoutes: true,
    },

    // Enable EAS Update (OTA updates)
    updates: {
      // EAS Update URL (must match your EAS projectId)
      url: "https://u.expo.dev/c18e1abf-a6cc-4ba0-bc5b-3d59cee190b9",
      // Check for updates on app start (0 = immediately)
      fallbackToCacheTimeout: 0,
    },
    // Use app version as the runtime version so OTA updates only apply to compatible binaries
    runtimeVersion: {
      policy: "appVersion",
    },

    extra: {
      router: {},
      eas: {
        projectId: "c18e1abf-a6cc-4ba0-bc5b-3d59cee190b9",
      },
    },

    owner: "pookiey.official",
  },
};
