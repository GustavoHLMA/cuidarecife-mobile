import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack initialRouteName="index">
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="glicemia" options={{ headerShown: false }} />
        <Stack.Screen name="pressao" options={{ headerShown: false }} />
        <Stack.Screen name="cuidados" options={{ headerShown: false }} />
        <Stack.Screen name="prescricao" options={{ headerShown: false }} />
        <Stack.Screen name="registropressao" options={{ headerShown: false }} />
        <Stack.Screen name="iniciarmrpa" options={{ headerShown: false }} />
        <Stack.Screen name="dicaspressao" options={{ headerShown: false }} />
        <Stack.Screen name="farmacias" options={{ headerShown: false }} />
        <Stack.Screen name="dicasglicemia" options={{ headerShown: false }} />
        <Stack.Screen name="explore" options={{ headerShown: false }} />
        <Stack.Screen name="ajuda" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
