import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { NativeBaseProvider, extendTheme } from 'native-base';
import { LinearGradient } from 'expo-linear-gradient';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

const theme = extendTheme({
  colors: {
    primary: {
      50: '#EEF2FF',
      100: '#E0E7FF',
      200: '#C7D2FE',
      300: '#A5B4FC',
      400: '#818CF8',
      500: '#6366F1',
      600: '#5459E6',
      700: '#4546D9',
      800: '#3738CA',
      900: '#2E30B3',
    },
  },
  components: {
    Button: {
      defaultProps: { rounded: 'lg' },
    },
    Input: {
      defaultProps: { rounded: 'lg', variant: 'filled', bg: 'muted.100', _dark: { bg: 'coolGray.700' } },
    },
  },
});

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <NativeBaseProvider theme={theme} config={{ dependencies: { 'linear-gradient': LinearGradient } }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </NativeBaseProvider>
  );
}
