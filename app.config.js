export default ({ config }) => {
  const isFree = process.env.EXPO_PUBLIC_APP_TIER === 'free';

  return {
    ...config,
    name: isFree ? 'HomeFit Free' : 'HomeFit',
    slug: 'HomeFit',
    scheme: isFree ? 'homefitfree' : 'homefit',
    version: '1.0.1',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: isFree ? 'com.aidoru.HomeFitFree' : 'com.aidoru.HomeFit',
    },
    android: {
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.MODIFY_AUDIO_SETTINGS',
      ],
      package: isFree ? 'com.aidoru.HomeFitFree' : 'com.aidoru.HomeFit',
    },
    web: {
      favicon: './assets/favicon.png',
    },
    plugins: ['expo-audio'],
    extra: {
      eas: {
        projectId: '94a5c8f3-6876-485f-af16-a57e83350a30',
      },
    },
  };
};
