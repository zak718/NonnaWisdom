import * as Speech from 'expo-speech';

export type Personality =
  | 'Sicilian Nonna'
  | 'Roman Nonna'
  | 'Neapolitan Nonna'
  | 'Tuscan Nonna';

export const PERSONALITIES: Personality[] = [
  'Sicilian Nonna',
  'Roman Nonna',
  'Neapolitan Nonna',
  'Tuscan Nonna',
];

const EXCLAMATIONS = [
  'Mamma mia!',
  'Madonna santissima!',
  'Aye bambino!',
  'Uffa!',
  'Per l’amor di Dio!',
];

const CULTURE_BITS = [
  'You need to eat more, you look skinny like a spaghetti.',
  'Don’t go outside with wet hair, you’ll catch the malocchio from the wind.',
  'Respect your elders or the sauce will never come out right.',
  'Olive oil fixes everything — emotions, joints, frying, marriage.',
  'If the sauce sticks to the spoon, life will stick to you too. Capito?',
];

const FOOD = [
  'Eat some lasagna.',
  'Have a bowl of pasta e fagioli.',
  'A plate of carbonara will solve this.',
  'Some fresh cannoli and you’ll think clearer.',
  'Here, take some leftover parmigiana.',
];

const ACTIONS = [
  'Call your mother.',
  'Drink water and mind your business.',
  'Wear a scarf, even in summer.',
  'Say three Hail Marys, then throw salt over your left shoulder.',
  'Sweep the negative energy out the door, not into the house.',
];

const byPersonality: Record<Personality, string[]> = {
  'Sicilian Nonna': [
    'In Sicily we face problems with a wooden spoon and a stare.',
    'Don’t test fate, the sea is watching and so is Zia Carmela.',
  ],
  'Roman Nonna': [
    'In Roma, even the statues judge you if you don’t listen to Nonna.',
    'Take a passeggiata and breathe — life is long like the Tiber.',
  ],
  'Neapolitan Nonna': [
    'A Napoli, we sing our problems away and then we eat.',
    'Mind the malocchio — wear a cornicello and keep garlic close.',
  ],
  'Tuscan Nonna': [
    'Simple ingredients, simple decisions. Pane, olio, e calma.',
    'If it’s not worth a good ribollita, it’s not worth worrying.',
  ],
};

export function generateWisdom(question: string, personality: Personality): string {
  const ex = pick(EXCLAMATIONS);
  const bit = pick(CULTURE_BITS);
  const food = pick(FOOD);
  const act = pick(ACTIONS);
  const per = pick(byPersonality[personality]);
  const closer = [
    'Now sit, eat, and listen.',
    'No more nonsense, capito?',
    'I’m not yelling, I’m passionate.',
    'Do as I say or I’ll tell your aunt.',
  ];

  return [
    `${ex} ${capitalize(personality)} has heard your question: “${question}”`,
    per,
    bit,
    `${act} ${food}`,
    pick(closer),
  ].join(' ');
}

export function speakWisdom(text: string) {
  // Slightly slower and lower pitch for “Nonna” tone
  Speech.speak(text, {
    language: 'en-US',
    pitch: 0.9,
    rate: 0.95,
    onDone: () => {},
  });
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
