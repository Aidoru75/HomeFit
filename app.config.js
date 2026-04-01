export default ({ config }) => {
  const isFree = process.env.EXPO_PUBLIC_APP_TIER === 'free';

  return {
    ...config,
    name: isFree ? 'HomeFit Free' : 'HomeFit',
    slug: 'HomeFit',
    scheme: isFree ? 'homefitfree' : 'homefit',
    version: '1.1.3',
    orientation: 'default',
    icon: isFree ? './assets/icon-free.png' : './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: isFree ? './assets/splash-icon-free.png' : './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: isFree ? 'com.aidoru.HomeFitFree' : 'com.aidoru.HomeFit',
    },
    android: {
      versionCode: 10,
      adaptiveIcon: {
        foregroundImage: isFree ? './assets/adaptive-icon-free.png' : './assets/adaptive-icon.png',
        backgroundImage: isFree ? './assets/adaptive-icon-free-bg.png' : './assets/adaptive-icon-bg.png',
      },
      edgeToEdgeEnabled: true,
      permissions: [
        'android.permission.RECORD_AUDIO',
        'android.permission.MODIFY_AUDIO_SETTINGS',
      ],
      package: isFree ? 'com.aidoru.HomeFitFree' : 'com.aidoru.HomeFit',
    },
    web: {
      favicon: isFree ? './assets/favicon-free.png' : './assets/favicon.png',
    },
    plugins: ['expo-audio', 'expo-asset', 'expo-localization', 'expo-sharing', './plugins/withHomeFitFileAssociation', './plugins/withDisableLint'],
    extra: {
      eas: {
        projectId: '94a5c8f3-6876-485f-af16-a57e83350a30',
      },
    },
  };
};
