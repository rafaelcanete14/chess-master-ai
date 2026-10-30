import { DifficultyConfig, DifficultyLevel } from '../types/chess';

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  1: {
    level: 1,
    name: 'Beginner',
    title: 'Novice Bot',
    depth: 1,
    blunderRate: 0.55, // 55% chance to pick a random or weak legal move
    randomness: 250,   // High evaluation noise
    skillLevel: 1,
    thinkTimeMs: 400,
    description: 'Makes frequent mistakes and overlooks basic threats. Ideal for absolute beginners and kids.',
  },
  2: {
    level: 2,
    name: 'Easy',
    title: 'Apprentice Bot',
    depth: 2,
    blunderRate: 0.35,
    randomness: 160,
    skillLevel: 3,
    thinkTimeMs: 600,
    description: 'Understands basic captures but occasionally blunders pieces. Great for casual games.',
  },
  3: {
    level: 3,
    name: 'Casual',
    title: 'Club Player',
    depth: 3,
    blunderRate: 0.18,
    randomness: 90,
    skillLevel: 6,
    thinkTimeMs: 750,
    description: 'Recognizes basic tactics and captures undefended pieces. A fun sparring partner.',
  },
  4: {
    level: 4,
    name: 'Intermediate',
    title: 'Tactician Bot',
    depth: 4,
    blunderRate: 0.05,
    randomness: 40,
    skillLevel: 10,
    thinkTimeMs: 900,
    description: 'Develops pieces actively, protects the king, and searches for simple fork and pin tactics.',
  },
  5: {
    level: 5,
    name: 'Advanced',
    title: 'Strategist Bot',
    depth: 4,
    blunderRate: 0.0,
    randomness: 15,
    skillLevel: 14,
    thinkTimeMs: 1100,
    description: 'Solid positional play, active king safety, strong middlegame plans, and tactical alertness.',
  },
  6: {
    level: 6,
    name: 'Expert',
    title: 'Candidate Master',
    depth: 5,
    blunderRate: 0.0,
    randomness: 0,
    skillLevel: 17,
    thinkTimeMs: 1400,
    description: 'Deep tactical foresight with quiescence search on captures. Very challenging.',
  },
  7: {
    level: 7,
    name: 'Master',
    title: 'International Master',
    depth: 5,
    blunderRate: 0.0,
    randomness: 0,
    skillLevel: 19,
    thinkTimeMs: 1800,
    description: 'Extensive search with move ordering and positional mastery. Demands precise play.',
  },
  8: {
    level: 8,
    name: 'Grandmaster',
    title: 'Grandmaster AI',
    depth: 6,
    blunderRate: 0.0,
    randomness: 0,
    skillLevel: 20,
    thinkTimeMs: 2200,
    description: 'Peak calculation strength, quiescence search, and deep evaluation. Built for seasoned competitors.',
  },
};

export function getDifficultyConfig(level: DifficultyLevel): DifficultyConfig {
  return DIFFICULTY_CONFIGS[level] || DIFFICULTY_CONFIGS[4];
}

