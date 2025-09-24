import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, TextInput, View, Pressable, Animated, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

import { generateWisdom, PERSONALITIES, Personality, speakWisdom } from '@/lib/nonna';
import { addFavorite, getFavorites, getUsageStatus, tryConsumeQuestion, setPremium } from '@/lib/storage';

export default function HomeScreen() {
  const [question, setQuestion] = useState('');
  const [personality, setPersonality] = useState<Personality>('Sicilian Nonna');
  const [response, setResponse] = useState<string>('');
  const [remaining, setRemaining] = useState<number>(3);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    const init = async () => {
      const usage = await getUsageStatus();
      setRemaining(usage.remaining);
      setIsPremium(usage.isPremium);

      const favs = await getFavorites();
      setFavoritesCount(favs.length);

    };
    void init();
  }, []);

  const onAskNonna = async () => {
    if (!question.trim()) {
      Alert.alert('Mamma mia!', 'Type a question for Nonna first, amore.');
      return;
    }

    const result = await tryConsumeQuestion();
    if (!result.allowed) {
      setRemaining(result.remaining);
      if (!result.isPremium) {
        Alert.alert(
          'Out of daily questions',
          'Upgrade to Premium for unlimited Nonna advice. Nonna is waiting! 🍝',
        );
      }
      return;
    }

    setRemaining(result.remaining);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const advice = generateWisdom(question.trim(), personality);
    setResponse(advice);
    animateResponse();
    speakWisdom(advice);
  };

  const onSaveFavorite = async () => {
    if (!response) return;
    await addFavorite(response);
    const favs = await getFavorites();
    setFavoritesCount(favs.length);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved ❤️', 'Nonna will remember this one.');
  };

  const onUpgrade = async () => {
    await setPremium(true);
    setIsPremium(true);
    setRemaining(Infinity as unknown as number);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Grazie mille!', 'Premium unlocked. Nonna is yours, senza limiti! 💃');
  };

  const animateResponse = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.98);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();
  };

  const remainingLabel = useMemo(() => {
    if (isPremium) return 'Unlimited';
    return `${remaining} left today`;
  }, [isPremium, remaining]);

  const onRecognizeGesture = () => {
    // Fun placeholder for gesture recognition
    const gestures = [
      '🤌 The classic “Ma che vuoi?” pinch detected. Translation: Use more garlic.',
      '🤟 Cornicello detected! You are protected from the malocchio today.',
      '✋ Open palm gesture detected. Nonna says: enough drama, eat something.',
      '👉 Pointing gesture detected. Respect your elders and call your mother!',
    ];
    const pick = gestures[Math.floor(Math.random() * gestures.length)];
    setResponse(`Madonna santissima! Gesture recognized: ${pick}`);
    animateResponse();
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
      <LinearGradient
        colors={['#CE2B37', '#FFFFFF', '#009246']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.headerGradient}
      >
        <ThemedText type="title" style={styles.title}>Nonna’s Wisdom & Superstition Oracle 🇮🇹</ThemedText>
        <ThemedText type="subtitle" style={styles.subtitle}>
          Ask with respect, eat with gusto. 🍝🍷
        </ThemedText>

        <View style={styles.personalityRow}>
          {PERSONALITIES.map((p) => {
            const selected = p === personality;
            return (
              <Pressable
                key={p}
                onPress={() => setPersonality(p)}
                style={[styles.personalityChip, selected && styles.personalityChipSelected]}
              >
                <ThemedText style={[styles.personalityText, selected && styles.personalityTextSelected]}>
                  {p.replace(' Nonna', '')}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.counterRow}>
          <ThemedText type="defaultSemiBold">Questions: {remainingLabel}</ThemedText>
          <ThemedText>Favorites: {favoritesCount}</ThemedText>
        </View>
      </LinearGradient>

      <ThemedView style={styles.content}>
        <TextInput
          value={question}
          onChangeText={setQuestion}
          placeholder="Ask Nonna anything… (love, food, life, superstition)"
          placeholderTextColor="#666"
          style={styles.input}
          multiline
        />

        <View style={styles.actionsRow}>
          <Pressable
            onPress={onAskNonna}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.buttonPressed]}
          >
            <ThemedText style={styles.primaryButtonText}>Ask Nonna for Wisdom 🤌</ThemedText>
          </Pressable>

          <Link href="/superstition" asChild>
            <Pressable style={({ pressed }) => [styles.secondaryButton, pressed && styles.buttonPressed]}>
              <ThemedText style={styles.secondaryButtonText}>Check Superstition 🔮</ThemedText>
            </Pressable>
          </Link>
        </View>

        {!isPremium && (
          <Pressable
            onPress={onUpgrade}
            style={({ pressed }) => [styles.upgradeButton, pressed && styles.buttonPressed]}
          >
            <ThemedText style={styles.upgradeButtonText}>Upgrade to Premium – Unlimited Advice 💎</ThemedText>
          </Pressable>
        )}

        <Pressable
          onPress={onRecognizeGesture}
          style={({ pressed }) => [styles.gestureButton, pressed && styles.buttonPressed]}
        >
          <ThemedText style={styles.gestureButtonText}>Recognize Hand Gesture (beta) ✋🤌</ThemedText>
        </Pressable>

        <LinearGradient
          colors={['rgba(206,43,55,0.15)', 'rgba(255,255,255,0.5)', 'rgba(0,146,70,0.15)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.responseContainer}
        >
          <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
            {response ? (
              <ThemedText style={styles.responseText}>{response}</ThemedText>
            ) : (
              <ThemedText style={styles.responsePlaceholder}>
                Nonna is listening… ask her anything. Mamma mia! 🍕
              </ThemedText>
            )}
          </Animated.View>
        </LinearGradient>

        {response ? (
          <Pressable
            onPress={onSaveFavorite}
            style={({ pressed }) => [styles.favoriteButton, pressed && styles.buttonPressed]}
          >
            <ThemedText style={styles.favoriteButtonText}>Save to Favorites ❤️</ThemedText>
          </Pressable>
        ) : null}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: 40,
  },
  headerGradient: {
    paddingTop: 56,
    paddingBottom: 20,
    paddingHorizontal: 16,
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: 6,
  },
  personalityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 16,
  },
  personalityChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#888',
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  personalityChipSelected: {
    backgroundColor: '#009246',
    borderColor: '#009246',
  },
  personalityText: {
    fontSize: 12,
  },
  personalityTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  counterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
  },
  content: {
    padding: 16,
    gap: 12,
  },
  input: {
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    fontSize: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#CE2B37',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#009246',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.85,
  },
  upgradeButton: {
    backgroundColor: '#222',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  upgradeButtonText: {
    color: '#FFD700',
    fontWeight: '700',
  },
  gestureButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  gestureButtonText: {
    fontWeight: '600',
  },
  responseContainer: {
    minHeight: 140,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
  },
  responsePlaceholder: {
    fontSize: 16,
    color: '#666',
  },
});
