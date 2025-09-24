import * as Notifications from 'expo-notifications';
import { isDevice } from 'expo-device';
import { Platform } from 'react-native';
import { isDailyNotificationScheduled, markDailyNotificationScheduled } from './storage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldSetBadge: false,
    shouldPlaySound: false,
  }),
});

async function requestPermissionsAsync() {
  if (!isDevice) return false;
  const settings = await Notifications.getPermissionsAsync();
  if (settings.status !== 'granted') {
    const res = await Notifications.requestPermissionsAsync();
    return res.status === 'granted';
  }
  return true;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('daily-wisdom', {
    name: 'Daily Wisdom',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

export async function ensureDailyWisdomScheduled() {
  const has = await isDailyNotificationScheduled();
  if (has) return;

  const granted = await requestPermissionsAsync();
  if (!granted) return;

  await ensureAndroidChannel();

  // Schedule every day at 9:00 AM local time
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Nonna’s daily wisdom 🇮🇹',
      body: 'Come here, bambino! Nonna has fresh advice for you today.',
      sound: null,
    },
    trigger: { hour: 9, minute: 0, repeats: true },
  });

  await markDailyNotificationScheduled();
}
