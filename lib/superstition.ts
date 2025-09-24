export type SuperstitionResult = {
  title: string;
  description: string;
  ritual: string;
  icon: string;
};

const SUPERSTITIONS: SuperstitionResult[] = [
  {
    icon: '🧂',
    title: 'Spilled Salt',
    description: 'You angered the kitchen spirits!',
    ritual: 'Throw a pinch of salt over your left shoulder while whispering 3 Hail Marys. Then eat a tomato. Subito.',
  },
  {
    icon: '🧹',
    title: 'Broom Touched Your Feet',
    description: 'Oh no, that sweeps your chances of marriage!',
    ritual: 'Spit lightly three times on the broom, step over it backwards, and eat some tiramisu for balance.',
  },
  {
    icon: '☂️',
    title: 'Opened Umbrella Indoors',
    description: 'Seven years of drizzle on your soul.',
    ritual: 'Close it, spin it three times clockwise, and say “scusami” to the house. Then light a candle.',
  },
  {
    icon: '🐱',
    title: 'Black Cat Crossed Your Path',
    description: 'He’s cute but mischievous.',
    ritual: 'Make the sign of the cross, touch iron, and pet a dog if available. A biscotto also helps.',
  },
  {
    icon: '🧿',
    title: 'Malocchio (Evil Eye)',
    description: 'Someone is jealous of your sauce.',
    ritual: 'Wear a cornicello, dab olive oil on your forehead, and say Nonna’s blessing before bed.',
  },
];

export async function analyzePhotoAsync(_uri: string): Promise<SuperstitionResult> {
  // Simulate “AI” by picking a plausible superstition.
  const pick = SUPERSTITIONS[Math.floor(Math.random() * SUPERSTITIONS.length)];
  // Add slight delay for UX
  await new Promise((r) => setTimeout(r, 600));
  return pick;
}
