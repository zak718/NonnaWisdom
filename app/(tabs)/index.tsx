import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';

import { generateWisdom, PERSONALITIES, Personality } from '@/lib/nonna';
import { addFavorite, getFavorites, setPremium } from '@/lib/storage';

export default function HomeScreen() {
  const [question, setQuestion] = useState('');
  const [personality, setPersonality] = useState<Personality>('Sicilian Nonna');
  const [response, setResponse] = useState<string>('');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);

  const [isAsking, setIsAsking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isGesturing, setIsGesturing] = useState(false);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const favs = await getFavorites();
        if (mounted) setFavoritesCount(favs.length);
      } catch (err) {
        console.error('Failed to load favorites', err);
        Alert.alert('Error', 'Error loading favorites. Please try again.');
      }
    };
    void init();
    return () => {
      mounted = false;
    };
  }, []);

  const onAskNonna = async () => {
    if (isAsking) return;
    if (!question.trim()) {
      Alert.alert('Mamma mia!', 'Type a question for Nonna first, amore.');
      return;
    }

    setIsAsking(true);
    try {
      const advice = generateWisdom(question.trim(), personality);
      setResponse(advice);
    } catch (err) {
      console.error('onAskNonna error', err);
      Alert.alert('Oops', 'Nonna is tired. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };

  const onSaveFavorite = async () => {
    if (isSaving || !response) return;
    setIsSaving(true);
    try {
      await addFavorite(response);
      const favs = await getFavorites();
      setFavoritesCount(favs.length);
      Alert.alert('Saved ❤️', 'Nonna will remember this one.');
    } catch (err) {
      console.error('Failed to save favorite', err);
      Alert.alert('Error', 'Could not save favorite. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const onUpgrade = async () => {
    if (isUpgrading) return;
    setIsUpgrading(true);
    try {
      await setPremium(true);
      setIsPremium(true);
      Alert.alert('Grazie mille!', 'Premium unlocked. Nonna is yours, senza limiti! 💃');
    } catch (err) {
      console.error('Upgrade failed', err);
      Alert.alert('Error', 'Upgrade failed. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const onRecognizeGesture = () => {
    if (isGesturing) return;
    setIsGesturing(true);
    try {
      const gestures = [
        '🤌 The classic “Ma che vuoi?” pinch detected. Translation: Use more garlic.',
        '🤟 Cornicello detected! You are protected from the malocchio today.',
        '✋ Open palm gesture detected. Nonna says: enough drama, eat something.',
        '👉 Pointing gesture detected. Respect your elders and call your mother!',
      ];
      const pick = gestures[Math.floor(Math.random() * gestures.length)];
      setResponse(`Madonna santissima! Gesture recognized: ${pick}`);
    } catch (err) {
      console.error('Gesture recognition failed', err);
      Alert.alert('Error', 'Gesture recognition failed. Try again.');
    } finally {
      setTimeout(() => setIsGesturing(false), 600);
    }
  };

  const onGoToSuperstition = () => {
    Alert.alert(
      'Superstition Checker',
      'Please switch to the Superstition tab to use the camera-based checker.'
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Nonna’s Wisdom & Superstition Oracle 🇮🇹</Text>
          <Text style={styles.headerSubtitle}>Ask with respect, eat with gusto. 🍝🍷</Text>

          <View style={styles.personalityRow}>
            {PERSONALITIES.map((p) => {
              const selected = p === personality;
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPersonality(p)}
                  style={[styles.personalityChip, selected && styles.personalityChipSelected]}
                  disabled={isAsking}
                >
                  <Text style={[styles.personalityText, selected && styles.personalityTextSelected]}>
                    {p.replace(' Nonna', '')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsText}>Favorites: {favoritesCount}</Text>
            {isPremium ? <Text style={styles.premiumBadge}>Premium</Text> : null}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHint}>Ask Nonna anything… (love, food, life, superstition)</Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Type your question"
            placeholderTextColor="#868e96"
            style={styles.input}
            multiline
            editable={!isAsking}
          />

          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={onAskNonna}
              disabled={isAsking || !question.trim()}
              style={[styles.primaryButton, (isAsking || !question.trim()) && styles.buttonDisabled]}
            >
              <Text style={styles.primaryButtonText}>
                {isAsking ? 'Thinking…' : 'Ask Nonna for Wisdom 🤌'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onGoToSuperstition}
              style={[styles.secondaryButton]}
            >
              <Text style={styles.secondaryButtonText}>Check Superstition 🔮</Text>
            </TouchableOpacity>
          </View>

          {!isPremium && (
            <TouchableOpacity
              onPress={onUpgrade}
              disabled={isUpgrading}
              style={[styles.outlineButton, isUpgrading && styles.buttonDisabled]}
            >
              <Text style={styles.outlineButtonText}>
                {isUpgrading ? 'Upgrading…' : 'Upgrade to Premium – Unlimited Advice 💎'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={onRecognizeGesture}
            disabled={isGesturing}
            style={[styles.tertiaryButton, isGesturing && styles.buttonDisabled]}
          >
            <Text style={styles.tertiaryButtonText}>
              {isGesturing ? 'Analyzing…' : 'Recognize Hand Gesture (beta) ✋🤌'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardHint}>Nonna’s Response</Text>
          <View style={styles.responseBox}>
            {response ? (
              <Text style={styles.responseText}>{response}</Text>
            ) : (
              <Text style={styles.responsePlaceholder}>Nonna is listening… Mamma mia! 🍕</Text>
            )}
          </View>

          {response ? (
            <View style={styles.actionsRow}>
              <TouchableOpacity
                onPress={onSaveFavorite}
                disabled={isSaving}
                style={[styles.outlineButton, isSaving && styles.buttonDisabled, { flex: 1 }]}
              >
                <Text style={styles.outlineButtonText}>
                  {isSaving ? 'Saving…' : 'Save to Favorites ❤️'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const COLORS = {
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#495057',
  subtle: '#868e96',
  primary: '#007bff',
  primaryDark: '#0069d9',
  border: '#e9ecef',
  shadow: '#000000',
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 32,
  },
  header: {
    backgroundColor: '#eef2f7',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.09,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.subtle,
    textAlign: 'center',
  },
  personalityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
  },
  personalityChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#ffffff',
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  personalityChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  personalityText: {
    fontSize: 12,
    color: COLORS.text,
  },
  personalityTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  statsText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  premiumBadge: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 14,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHint: {
    fontSize: 12,
    color: COLORS.subtle,
    marginBottom: 8,
  },
  input: {
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#ffffff',
    padding: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 3,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '700',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  outlineButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: 10,
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  tertiaryButton: {
    backgroundColor: '#f1f3f5',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tertiaryButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  responseBox: {
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#ffffff',
    padding: 14,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  responseText: {
    fontSize: 16,
    lineHeight: 24,
    color: COLORS.text,
  },
  responsePlaceholder: {
    fontSize: 16,
    color: COLORS.subtle,
  },
});
