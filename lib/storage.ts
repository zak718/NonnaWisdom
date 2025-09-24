import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  usage: 'usage:questions',
  premium: 'premium:enabled',
  favorites: 'favorites:quotes',
  notificationsScheduled: 'notifications:daily:scheduled',
};

type UsageState = { date: string; count: number };
const DAILY_LIMIT = 3;

function todayKey() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

export async function getUsageStatus(limit: number = DAILY_LIMIT) {
  const premium = await getPremium();
  if (premium) {
    return { isPremium: true, count: 0, remaining: Infinity as unknown as number, limit };
  }
  const raw = await AsyncStorage.getItem(KEYS.usage);
  const today = todayKey();
  let count = 0;
  if (raw) {
    try {
      const parsed: UsageState = JSON.parse(raw);
      if (parsed.date === today) count = parsed.count;
    } catch {}
  }
  const remaining = Math.max(0, limit - count);
  return { isPremium: false, count, remaining, limit };
}

export async function tryConsumeQuestion(limit: number = DAILY_LIMIT) {
  const status = await getUsageStatus(limit);
  if (status.isPremium) {
    return { allowed: true, remaining: Infinity as unknown as number, isPremium: true };
  }
  if (status.remaining <= 0) {
    return { allowed: false, remaining: 0, isPremium: false };
  }
  const today = todayKey();
  const newState: UsageState = { date: today, count: (status.count ?? 0) + 1 };
  await AsyncStorage.setItem(KEYS.usage, JSON.stringify(newState));
  return { allowed: true, remaining: Math.max(0, limit - newState.count), isPremium: false };
}

export async function getPremium() {
  const raw = await AsyncStorage.getItem(KEYS.premium);
  return raw === 'true';
}

export async function setPremium(enabled: boolean) {
  await AsyncStorage.setItem(KEYS.premium, enabled ? 'true' : 'false');
}

export async function getFavorites(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.favorites);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function addFavorite(text: string) {
  const current = await getFavorites();
  current.unshift(text);
  const pruned = current.slice(0, 200); // keep last 200
  await AsyncStorage.setItem(KEYS.favorites, JSON.stringify(pruned));
}

export async function removeFavoriteAt(index: number) {
  const current = await getFavorites();
  current.splice(index, 1);
  await AsyncStorage.setItem(KEYS.favorites, JSON.stringify(current));
}

export async function isDailyNotificationScheduled() {
  const flag = await AsyncStorage.getItem(KEYS.notificationsScheduled);
  return flag === 'true';
}

export async function markDailyNotificationScheduled() {
  await AsyncStorage.setItem(KEYS.notificationsScheduled, 'true');
}
