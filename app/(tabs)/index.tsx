import React, { useEffect, useRef, useState } from 'react';
import { Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import {
  Box,
  ScrollView,
  VStack,
  HStack,
  Button,
  Input,
  Text,
  Heading,
  useToast,
} from 'native-base';

import { generateWisdom, PERSONALITIES, Personality } from '@/lib/nonna';
import { addFavorite, getFavorites, setPremium } from '@/lib/storage';

function Card(props: React.ComponentProps<typeof Box>) {
  return (
    <Box
      bg="white"
      _dark={{ bg: 'coolGray.800', borderColor: 'coolGray.700' }}
      rounded="2xl"
      shadow="4"
      p="4"
      borderWidth="1"
      borderColor="muted.100"
      {...props}
    />
  );
}

export default function HomeScreen() {
  const [question, setQuestion] = useState('');
  const [personality, setPersonality] = useState<Personality>('Sicilian Nonna');
  const [response, setResponse] = useState<string>('');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [italianVoice, setItalianVoice] = useState<string | undefined>(undefined);
  const [isAsking, setIsAsking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoadingVoices, setIsLoadingVoices] = useState(false);
  const [isGesturing, setIsGesturing] = useState(false);

  const toast = useToast();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return Promise.race<T>([
      promise,
      new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Operation timed out')), ms)),
    ]);
  }

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      try {
        const favs = await withTimeout(getFavorites(), 5000);
        if (mounted) setFavoritesCount(favs.length);
      } catch (err) {
        console.error('Failed to load favorites', err);
        toast.show({ description: 'Error loading favorites. Please try again.' });
      }
    };
    void init();
    return () => {
      mounted = false;
    };
  }, [toast]);

  useEffect(() => {
    let mounted = true;
    setIsLoadingVoices(true);
    const loadVoices = async () => {
      try {
        const voices = await withTimeout(Speech.getAvailableVoicesAsync(), 5000);
        const it =
          voices.find((v) => v.language?.toLowerCase().startsWith('it')) ||
          voices.find((v) => /ital/i.test(v.name || ''));
        if (mounted) setItalianVoice(it?.identifier);
      } catch (e) {
        console.error('Voice loading failed or timed out', e);
        if (mounted) toast.show({ description: "Italian voice unavailable, using device's default." });
      } finally {
        if (mounted) setIsLoadingVoices(false);
      }
    };
    void loadVoices();
    return () => {
      mounted = false;
      Speech.stop();
    };
  }, [toast]);

  const onAskNonna = async () => {
    if (isAsking) return;
    if (!question.trim()) {
      Alert.alert('Mamma mia!', 'Type a question for Nonna first, amore.');
      return;
    }

    setIsAsking(true);
    try {
      try {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } catch {}

      const advice = generateWisdom(question.trim(), personality);
      setResponse(advice);
      animateResponse();
      speakItalian(advice);
    } catch (err) {
      console.error('onAskNonna error', err);
      toast.show({ description: 'Nonna is tired. Please try again.' });
    } finally {
      setIsAsking(false);
    }
  };

  const onSaveFavorite = async () => {
    if (isSaving || !response) return;
    setIsSaving(true);
    try {
      await withTimeout(addFavorite(response), 5000);
      const favs = await withTimeout(getFavorites(), 5000);
      setFavoritesCount(favs.length);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      Alert.alert('Saved ❤️', 'Nonna will remember this one.');
    } catch (err) {
      console.error('Failed to save favorite', err);
      toast.show({ description: 'Could not save favorite. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const onUpgrade = async () => {
    if (isUpgrading) return;
    setIsUpgrading(true);
    try {
      await withTimeout(setPremium(true), 5000);
      setIsPremium(true);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {}
      Alert.alert('Grazie mille!', 'Premium unlocked. Nonna is yours, senza limiti! 💃');
    } catch (err) {
      console.error('Upgrade failed', err);
      toast.show({ description: 'Upgrade failed. Please try again.' });
    } finally {
      setIsUpgrading(false);
    }
  };

  const animateResponse = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.98);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, friction: 6 }),
    ]).start();
  };

  const speakItalian = (text: string) => {
    if (!text) return;
    try {
      setIsSpeaking(true);
      Speech.stop();
      Speech.speak(text, {
        language: 'it-IT',
        voice: italianVoice,
        rate: 0.7,
        pitch: 0.8,
        volume: 1.0,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
      });
    } catch (err) {
      console.error('Speech failed', err);
      setIsSpeaking(false);
      toast.show({ description: 'Unable to speak right now.' });
    }
  };

  // Unlimited mode: no remaining label

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
      animateResponse();
    } catch (err) {
      console.error('Gesture recognition failed', err);
      toast.show({ description: 'Gesture recognition failed. Try again.' });
    } finally {
      setTimeout(() => setIsGesturing(false), 600);
    }
  };

  return (
    <Box flex={1} bg="muted.50" _dark={{ bg: 'coolGray.900' }}>
      <ScrollView flex={1} contentContainerStyle={{ paddingBottom: 24 }}>
        <Box overflow="hidden" roundedBottom="3xl" shadow="6">
          <LinearGradient
            colors={['#6366F1', '#8B5CF6', '#F472B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16 }}
          >
            <Box safeAreaTop />
            <VStack space="2" alignItems="center">
              <Heading size="lg" color="white" textAlign="center">
                Nonna’s Wisdom & Superstition Oracle 🇮🇹
              </Heading>
              <Text color="white" opacity={0.9} textAlign="center">
                Ask with respect, eat with gusto. 🍝🍷
              </Text>

              <HStack flexWrap="wrap" space="2" justifyContent="center" mt="3">
                {PERSONALITIES.map((p) => {
                  const selected = p === personality;
                  return (
                    <Button
                      key={p}
                      size="sm"
                      variant={selected ? 'solid' : 'subtle'}
                      colorScheme={selected ? 'primary' : 'coolGray'}
                      rounded="full"
                      onPress={() => setPersonality(p)}
                    >
                      {p.replace(' Nonna', '')}
                    </Button>
                  );
                })}
              </HStack>

              <HStack
                mt="3"
                bg="white"
                _dark={{ bg: 'coolGray.800' }}
                px="4"
                py="2"
                rounded="lg"
                space="4"
                alignItems="center"
              >
                <Text fontWeight="bold">Favorites: {favoritesCount}</Text>
              </HStack>
              {isLoadingVoices ? (
                <Text mt="2" color="white" opacity={0.8}>
                  Preparing Nonna’s voice…
                </Text>
              ) : null}
            </VStack>
          </LinearGradient>
        </Box>

        <VStack space="4" px="4" py="4">
          <Card>
            <VStack space="3">
              <Text fontSize="xs" color="muted.500">
                Ask Nonna anything… (love, food, life, superstition)
              </Text>
              <Input
                value={question}
                onChangeText={setQuestion}
                placeholder="Type your question"
                variant="filled"
                bg="muted.100"
                _dark={{ bg: 'coolGray.700' }}
                rounded="lg"
                size="md"
              />
              <HStack space="3">
                <Button
                  flex={1}
                  onPress={onAskNonna}
                  colorScheme="primary"
                  rounded="lg"
                  shadow="2"
                  isLoading={isAsking}
                  isDisabled={isAsking || !question.trim()}
                >
                  Ask Nonna for Wisdom 🤌
                </Button>
                <Link href="/superstition" asChild>
                  <Button flex={1} colorScheme="primary" rounded="lg" shadow="2" variant="outline">
                    Check Superstition 🔮
                  </Button>
                </Link>
              </HStack>

              {!isPremium && (
                <Button
                  onPress={onUpgrade}
                  variant="outline"
                  colorScheme="amber"
                  rounded="lg"
                  isLoading={isUpgrading}
                  isDisabled={isUpgrading}
                >
                  Upgrade to Premium – Unlimited Advice 💎
                </Button>
              )}

              <Button
                onPress={onRecognizeGesture}
                variant="subtle"
                colorScheme="coolGray"
                rounded="lg"
                isDisabled={isGesturing}
              >
                Recognize Hand Gesture (beta) ✋🤌
              </Button>
            </VStack>
          </Card>

          <Card>
            <VStack space="3">
              <Text fontSize="xs" color="muted.500">
                Nonna’s Response
              </Text>
              <Box
                rounded="lg"
                borderWidth={1}
                borderColor="muted.200"
                _dark={{ borderColor: 'coolGray.700' }}
                overflow="hidden"
              >
                <LinearGradient
                  colors={['rgba(99,102,241,0.08)', 'rgba(139,92,246,0.08)', 'rgba(244,114,182,0.08)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ padding: 16 }}
                >
                  <Animated.View style={{ opacity: fadeAnim, transform: [{ scale: scaleAnim }] }}>
                    {response ? (
                      <Text fontSize="md">{response}</Text>
                    ) : (
                      <Text color="muted.500">Nonna is listening… Mamma mia! 🍕</Text>
                    )}
                  </Animated.View>
                </LinearGradient>
              </Box>

              {response ? (
                <HStack space="3">
                  <Button
                    flex={1}
                    onPress={() => speakItalian(response)}
                    colorScheme="primary"
                    rounded="lg"
                    variant="solid"
                    isLoading={isSpeaking}
                    isDisabled={isSpeaking || !response}
                  >
                    Hear Nonna Speak 🎤
                  </Button>
                  <Button
                    flex={1}
                    onPress={onSaveFavorite}
                    colorScheme="rose"
                    rounded="lg"
                    variant="subtle"
                    isLoading={isSaving}
                    isDisabled={isSaving || !response}
                  >
                    Save to Favorites ❤️
                  </Button>
                </HStack>
              ) : null}
            </VStack>
          </Card>
        </VStack>
      </ScrollView>
    </Box>
  );
}
