import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isLargeScreen = Math.min(width, height) >= 600;

  return {
    width,
    height,
    isLandscape,
    isLargeScreen,
    contentMaxWidth: isLargeScreen ? 600 : undefined,
  };
}
