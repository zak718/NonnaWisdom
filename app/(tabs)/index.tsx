import React, { useEffect, useRef, useState } from 'react';
import { Platform, Animated, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import {
  NativeBaseProvider,
  Box,
  VStack,
  HStack,
  Button,
  Input,
  Text,
  Center,
  Heading,
  useTheme,
} from 'native-base';

import { generateWisdom, PERSONALITIES, Personality } from '@/lib/nonna';
import { addFavorite, getFavorites, setPremium } from '@/lib/storage';

function Card(props: React.ComponentProps<typeof Box>) {
  return (
    <Box bg="white" _dark={{ bg: 'coolGray.800' }} rounded="2xl" shadow="3" p="4" {...props} />
  );
}

export default function HomeScreen() {
  const [question, setQuestion] = useState('');
  const [personality, setPersonality] = useState<Personality>('Sicilian Nonna');
  const [response, setResponse] = useState<string>('');
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [favoritesCount, setFavoritesCount] = useState<number>(0);
  const [italianVoice, setItalianVoice] = useState<string | undefined>(undefined);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    const init = async () => {
      // Unlimited mode: skipping usage limit initialization
      const favs = await getFavorites();
      setFavoritesCount(favs.length);
    };
    void init();
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadVoices = async () => {
      try {
        const voices = await Speech.getAvailableVoicesAsync();
        const it =
          voices.find((v) => v.language?.toLowerCase().startsWith('it')) ||
          voices.find((v) => /ital/i.test(v.name || ''));
        if (mounted) setItalianVoice(it?.identifier);
      } catch {
        // ignore voice loading errors
      }
    };
    void loadVoices();
    return () => {
      mounted = false;
      Speech.stop();
    };
  }, []);

  const onAskNonna = async () => {
    if (!question.trim()) {
      Alert.alert('Mamma mia!', 'Type a question for Nonna first, amore.');
      return;
    }

    // Unlimited mode: skipping daily limit checks
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const advice = generateWisdom(question.trim(), personality);
    setResponse(advice);
    animateResponse();
    speakItalian(advice);
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
    // Unlimited mode: no remaining counter to update
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

  const speakItalian = (text: string) => {
    if (!text) return;
    Speech.stop();
    Speech.speak(text, {
      language: 'it-IT',
      voice: italianVoice,
      rate: 0.7,
      pitch: 0.8,
      volume: 1.0,
      onDone: () => {},
    });
  };

  // Unlimited mode: no remaining label

  const onRecognizeGesture = () => {
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
    <NativeBaseProvider>
      <Box flex={1} bg="muted.50" _dark={{ bg: 'coolGray.900' }}>
        <Box overflow="hidden" roundedBottom="3xl" shadow="6">
          <LinearGradient
            colors={['#6366F1', '#8B5CF6', '#F472B6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingTop: 56, paddingBottom: 20, paddingHorizontal: 16 }}
          >
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
                      colorScheme={selected ? 'purple' : 'coolGray'}
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
                  colorScheme="purple"
                  rounded="lg"
                  shadow="2"
                >
                  Ask Nonna for Wisdom 🤌
                </Button>
                <Link href="/superstition" asChild>
                  <Button flex={1} colorScheme="emerald" rounded="lg" shadow="2">
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
                >
                  Upgrade to Premium – Unlimited Advice 💎
                </Button>
              )}

              <Button
                onPress={onRecognizeGesture}
                variant="subtle"
                colorScheme="coolGray"
                rounded="lg"
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
                    colorScheme="dark"
                    rounded="lg"
                    variant="solid"
                  >
                    Hear Nonna Speak 🎤
                  </Button>
                  <Button
                    flex={1}
                    onPress={onSaveFavorite}
                    colorScheme="rose"
                    rounded="lg"
                    variant="subtle"
                  >
                    Save to Favorites ❤️
                  </Button>
                </HStack>
              ) : null}
            </VStack>
          </Card>
        </VStack>
      </Box>
    </NativeBaseProvider>
  );
}
