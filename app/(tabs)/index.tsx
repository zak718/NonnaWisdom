import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as Speech from 'expo-speech';
import { MaterialCommunityIcons, FontAwesome, Ionicons, MaterialIcons } from '@expo/vector-icons';

import { generateWisdom as baseGenerateWisdom, PERSONALITIES, Personality } from '@/lib/nonna';
 // Storage features temporarily disabled for basic functionality

// Rich variety response engine for Nonna
type Topic =
  | 'love'
  | 'food'
  | 'work'
  | 'family'
  | 'money'
  | 'health'
  | 'weather'
  | 'luck'
  | 'study'
  | 'travel'
  | 'home'
  | 'friendship'
  | 'fashion'
  | 'holiday'
  | 'default';

const EXCLAMAZIONI = [
  'Mamma mia!',
  'Madonna santissima!',
  'Aye bambino!',
  'Per l’amor di Dio!',
  'Uffa!',
  'Santo cielo!',
  'Gesù, Giuseppe e Maria!',
];

const CLOSERS = [
  'Adesso mangia e respira, capito?',
  'No more nonsense — Nonna knows best.',
  'Go, go — do it subito, then call your mother.',
  'Say three Hail Marys and don’t argue with me.',
  'Now sit, eat, and listen to your elders.',
  'A biscotto solves many problems.',
];

const FOOD_BITS = [
  'Eat some lasagna and think with a full heart.',
  'Make a proper sauce — low and slow — wisdom comes with the aroma.',
  'A little espresso and a cornetto will give you courage.',
  'Some parmigiana and a nap, then decide.',
  'Pasta e fagioli never betrayed anyone.',
  'A bowl of minestrone when it’s cold, it heals the soul.',
];

const PERSONALITY_FLAIR: Record<Personality, string[]> = {
  'Sicilian Nonna': [
    'In Sicilia, we stare down problems like the sun stares at the sea.',
    'Don’t tempt the malocchio — wear the cornicello and walk tall.',
    'The Sicilian wind brings omens; respect them and wear a scarf.',
  ],
  'Roman Nonna': [
    'In Roma, even the statues will judge you if you ignore wisdom.',
    'Take a passeggiata near something beautiful; your mind will follow.',
    'Remember, the Tiber flows slow — so should your temper.',
  ],
  'Neapolitan Nonna': [
    'In Napoli we sing to our problems, then drown them in sauce.',
    'Mind the hands! Gesture with passion and cook with more.',
    'The Vesuvio sleeps but Nonna’s advice erupts — listen!',
  ],
  'Tuscan Nonna': [
    'Pane, olio e calma — simple ingredients, simple heart.',
    'If it doesn’t pair with ribollita, it’s not worth the stress.',
    'Walk the hills and breathe; the answer is in the olive trees.',
  ],
};

const TOPIC_TEMPLATES: Record<Topic, string[]> = {
  love: [
    'Matters of the heart are like al dente pasta — firm but tender. If they don’t respect you, throw them back in the pot.',
    'Amore is like olive oil: if it’s good, it makes everything better; if it’s rancid, throw it out immediately.',
    'If they don’t text you back, marry the pasta. Pasta never leaves you.',
    'True love brings peace, not headaches. Headaches are from cheap wine, capito?',
  ],
  food: [
    'If the sauce is bland, so is the plan. More garlic, more patience.',
    'Don’t rush the soffritto; don’t rush your decisions.',
    'Salt the water like the sea, and season your life the same.',
    'Cook for someone and you’ll know their soul by how they eat.',
  ],
  work: [
    'At work, keep your head high and your lunch homemade.',
    'A bad boss is like overcooked pasta — you can’t fix it, you change the pot.',
    'Ask for what you deserve — even the Pope asks for espresso.',
    'Do your job with pride; gossip is like burnt garlic, stinks up everything.',
  ],
  family: [
    'Family is like sauce — sometimes it boils over, but it feeds everyone.',
    'Call your mother. If you don’t, I will come find you.',
    'Respect your elders or your sauce will never come out right.',
    'A Sunday lunch can fix a week of nonsense.',
  ],
  money: [
    'Money is like flour — store it well, use it wisely.',
    'If you can’t afford it twice, you can’t afford it. Except for good olive oil.',
    'Save for a rainy day — and for a proper coffee machine.',
    'Pay your debts like you salt your pasta — on time and enough.',
  ],
  health: [
    'Wear a scarf — I don’t care if it’s summer.',
    'Drink water, sleep well, and stop arguing with strangers on the internet.',
    'A walk after dinner, then you live to 100.',
    'Olive oil for the joints, laughter for the soul.',
  ],
  weather: [
    'If it rains, make polenta; if it shines, take a passeggiata.',
    'When the wind howls, close the windows and don’t anger the spirits.',
    'Snow? Perfect day for soup and cards with the family.',
    'Thunder means bake bread and tell stories.',
  ],
  luck: [
    'I sense the malocchio. Wear the cornicello and throw salt over your left shoulder.',
    'A black cat crossed your path? Pet a dog and you’re even.',
    'Spilled salt means you have clumsy hands — fix it with a prayer and a biscotto.',
    'Touch iron, not wood — Nonna said so.',
  ],
  study: [
    'Study like you’re making tiramisu — careful, layered, with love.',
    'Write it by hand; the brain remembers what the hands respect.',
    'Take breaks; even sauce needs to rest.',
    'Bring snacks. Knowledge enters faster with biscotti.',
  ],
  travel: [
    'Travel light, like good focaccia — simple and satisfying.',
    'If you’re lost, ask for directions and bring a smile.',
    'Never travel hungry — bad decisions are made on an empty stomach.',
    'Take pictures, then put the phone away and live.',
  ],
  home: [
    'Sweep the floor outward — keep the bad luck outside.',
    'Open the windows and let yesterday’s air leave.',
    'Plant basil on the balcony; good smells invite good days.',
    'Keep your table set for gratitude, not for dust.',
  ],
  friendship: [
    'A true friend brings soup. A fake friend brings drama.',
    'Break bread with those who break silence for you.',
    'If they mock your Nonna, release them like overcooked spaghetti.',
    'Choose friends who pass the sauce properly.',
  ],
  fashion: [
    'Dress with respect — even the tomatoes are watching.',
    'Black is elegant, but a red scarf chases away gloom.',
    'Shoes comfortable, posture proud — you are somebody’s treasure.',
    'Iron your shirt; wrinkles are for old men and bad sheets.',
  ],
  holiday: [
    'On Christmas, forgive and eat. On Easter, hope and eat. On Sunday, rest and eat.',
    'Make the good cookies and hide a few for yourself.',
    'Set another place at the table — abundance invites abundance.',
    'Sing loudly so the neighbors know you’re alive.',
  ],
  default: [
    'Breathe. Then cook something simple — answers rise like steam.',
    'Don’t argue with fools; argue with sauce, it listens.',
    'Light a candle, clean your room, and call your aunt.',
    'If the plan feels wrong, it probably is. Trust your stomach.',
  ],
};

const SEASONAL_SPICE = [
  'If it’s too hot, eat cold pasta salad and stop complaining.',
  'When it’s chilly, put on a sweater — I don’t care about your “style.”',
  'If it rains today, invite someone for soup.',
  'Sunny days are for forgiveness and gelato.',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function categorizeTopic(q: string): Topic {
  const s = q.toLowerCase();
  const has = (words: string[]) => words.some((w) => s.includes(w));
  if (has(['love', 'heart', 'crush', 'date', 'marry', 'relationship'])) return 'love';
  if (has(['food', 'cook', 'pasta', 'sauce', 'recipe', 'eat', 'kitchen'])) return 'food';
  if (has(['work', 'job', 'boss', 'career', 'office', 'promotion'])) return 'work';
  if (has(['family', 'mother', 'father', 'nonna', 'nonno', 'kids', 'children', 'sibling'])) return 'family';
  if (has(['money', 'rent', 'debt', 'bills', 'salary', 'pay'])) return 'money';
  if (has(['sick', 'health', 'doctor', 'cold', 'exercise', 'diet'])) return 'health';
  if (has(['weather', 'rain', 'snow', 'sun', 'wind', 'storm'])) return 'weather';
  if (has(['luck', 'superstition', 'malocchio', 'evil eye', 'black cat', 'salt'])) return 'luck';
  if (has(['study', 'school', 'exam', 'homework', 'university'])) return 'study';
  if (has(['travel', 'trip', 'flight', 'train', 'vacation'])) return 'travel';
  if (has(['home', 'house', 'apartment', 'room', 'clean'])) return 'home';
  if (has(['friend', 'friendship', 'bestie', 'buddy'])) return 'friendship';
  if (has(['fashion', 'clothes', 'dress', 'wear', 'outfit'])) return 'fashion';
  if (has(['christmas', 'easter', 'holiday', 'sunday'])) return 'holiday';
  return 'default';
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function generateRichWisdom(question: string, personality: Personality): string {
  const topic = categorizeTopic(question);
  const ex = pick(EXCLAMAZIONI);
  const flair = pick(PERSONALITY_FLAIR[personality]);
  const core = pick(TOPIC_TEMPLATES[topic]);
  const food = pick(FOOD_BITS);
  const seasonal = pick(SEASONAL_SPICE);
  const closer = pick(CLOSERS);

  // At least 20+ templates are spread across topics. Final string stitches multiple layers.
  return [
    `${ex} ${cap(personality)} has heard your question: “${question}”`,
    flair,
    core,
    seasonal,
    food,
    closer,
  ].join(' ');
}

export default function HomeScreen() {
  const [question, setQuestion] = useState('');
  const [personality, setPersonality] = useState<Personality>('Sicilian Nonna');
  const [response, setResponse] = useState<string>('');
  const [isAsking, setIsAsking] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Basic mode: no startup work needed
  }, []);

  useEffect(() => {
    return () => {
      try {
        Speech.stop();
      } catch {}
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
      const advice =
        generateRichWisdom(question.trim(), personality) ||
        baseGenerateWisdom(question.trim(), personality);
      setResponse(advice);
    } catch (err) {
      console.error('onAskNonna error', err);
      Alert.alert('Oops', 'Nonna is tired. Please try again.');
    } finally {
      setIsAsking(false);
    }
  };




  const speakNonna = () => {
    if (!response) return;
    console.log('speakNonna called');
    setIsSpeaking(true);
    try {
      Speech.stop();
      Speech.speak(response, {
        language: 'it',
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (e) {
      setIsSpeaking(false);
      Alert.alert('Speech error', 'Unable to speak right now.');
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
                  activeOpacity={0.8}
                >
                  <Text style={[styles.personalityText, selected && styles.personalityTextSelected]}>
                    {p.replace(' Nonna', '')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.statsRow}>
            <Text style={styles.statsText}><Text style={styles.statsLabel}>Questions:</Text> Unlimited</Text>
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
              activeOpacity={0.8}
              style={[styles.primaryButton, (isAsking || !question.trim()) && styles.buttonDisabled]}
            >
              {isAsking ? (
                <View style={styles.buttonContentRow}>
                  <ActivityIndicator color="#ffffff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>Thinking…</Text>
                </View>
              ) : (
                <View style={styles.buttonContentRow}>
                  <MaterialCommunityIcons name="pasta" size={18} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryButtonText}>Ask Nonna for Wisdom</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onGoToSuperstition}
              activeOpacity={0.8}
              style={[styles.secondaryButton]}
            >
              <View style={styles.buttonContentRow}>
                <MaterialIcons name="photo-camera" size={18} color={COLORS.secondary} style={{ marginRight: 8 }} />
                <Text style={styles.secondaryButtonText}>Check Superstition</Text>
              </View>
            </TouchableOpacity>
          </View>

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
                onPress={speakNonna}
                disabled={isSpeaking || !response}
                activeOpacity={0.8}
                style={[styles.primaryButton, (isSpeaking || !response) && styles.buttonDisabled, { flex: 1 }]}
              >
                <Text style={styles.primaryButtonText}>
                  {isSpeaking ? 'Speaking…' : 'Hear Nonna'}
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
  text: '#333333',
  subtle: '#868e96',
  primary: '#006633',   // Italian green
  secondary: '#CD212A', // Italian red
  accent: '#FFFFFF',    // White
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
    borderTopWidth: 4,
    borderTopColor: '#CD212A',
    borderBottomWidth: 4,
    borderBottomColor: '#006633',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.05)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSubtitle: {
    marginTop: 6,
    fontSize: 16,
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
    fontSize: 16,
    color: COLORS.text,
  },
  personalityTextSelected: {
    color: '#ffffff',
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 12,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 2,
  },
  statsText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 16,
  },
  statsLabel: {
    color: COLORS.text,
    fontWeight: '700',
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
    fontSize: 16,
    color: COLORS.subtle,
    marginBottom: 8,
  },
  input: {
    minHeight: 64,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#f8f9fa',
    padding: 12,
    fontSize: 16,
    color: '#000',
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
    borderRadius: 8,
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
    fontSize: 16,
  },
  buttonContentRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.secondary,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  secondaryButtonText: {
    color: COLORS.secondary,
    fontWeight: '700',
    fontSize: 16,
  },
  outlineButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    marginTop: 10,
  },
  outlineButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  tertiaryButton: {
    backgroundColor: '#f1f3f5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  tertiaryButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  responseBox: {
    minHeight: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#ffffff',
    padding: 20,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    elevation: 2,
  },
  responseText: {
    fontSize: 17,
    lineHeight: 24,
    color: COLORS.text,
  },
  responsePlaceholder: {
    fontSize: 16,
    color: COLORS.subtle,
  },
});
