import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { type Exercise } from '@/components/ExerciseEdit';
import { ACHIEVEMENTS } from '@/components/Achievements/Achievement.constants';

export type ColorScheme = 'system' | 'light' | 'dark';

export type Stats = {
  totalTime: number;
  newGamesCount: number;
  continueGamesCount: number;
  completedGameCount: number;
  completedExampleCount: number;
  restoredExampleCount: number;
  gameRestoredExampleCount: number;
  clicksCount: number;
  dragsCount: number;
  plusCount: number;
  minusCount: number;
  divideCount: number;
  multiplyCount: number;
  doubleDigitCount: number;
  digitCount: number;
  digitSum: number;
  digitMax: number;
};

type Store = {
  completedExamples: string[][];
  addCompletedExample: (tokens: string[]) => void;
  removeCompletedExample: (index: number) => string[] | null;
  clearCompletedExamples: () => void;

  currentExercise: Exercise;
  setCurrentExercise: (exercise: Exercise) => void;

  currentTokens: string[];
  setCurrentTokens: (tokens: string[]) => void;

  stats: Stats;
  addStats: (stats: Partial<Stats>) => void;
  setStats: (stats: Partial<Stats>) => void;

  achievements: string[];

  colorScheme: ColorScheme;
  setColorScheme: (colorScheme: ColorScheme) => void;
};

const STORE_NAME = 'mixmly';

const initialExercise: Exercise = {
  minNumber: 1,
  maxNumber: 10,
  operations: ['+', '-'],
  count: 25,
  limitResultToRange: true,
};

const initialStats: Stats = {
  totalTime: 0,
  newGamesCount: 0,
  continueGamesCount: 0,
  completedGameCount: 0,
  completedExampleCount: 0,
  restoredExampleCount: 0,
  gameRestoredExampleCount: 0,
  clicksCount: 0,
  dragsCount: 0,
  plusCount: 0,
  minusCount: 0,
  divideCount: 0,
  multiplyCount: 0,
  doubleDigitCount: 0,
  digitCount: 0,
  digitSum: 0,
  digitMax: 0,
};

const getNextAchievements = (stats: Stats, achievements: string[]) => [
  ...achievements,
  ...ACHIEVEMENTS.filter(
    ({ id, progress }) => !achievements.includes(id) && progress(stats) >= 1,
  ).map(({ id }) => id),
];

export const useStore = create<Store>()(
  persist(
    (set) => ({
      completedExamples: [],
      clearCompletedExamples: () => set({ completedExamples: [] }),
      addCompletedExample: (tokens) =>
        set((state) => ({
          completedExamples: [...state.completedExamples, tokens],
        })),
      removeCompletedExample: (index) => {
        let removedTokens: string[] | null = null;

        set((state) => {
          const tokens = state.completedExamples[index];

          if (!tokens) {
            return state;
          }

          removedTokens = tokens;

          return {
            completedExamples: state.completedExamples.filter(
              (_, itemIndex) => itemIndex !== index,
            ),
          };
        });

        return removedTokens;
      },

      currentExercise: initialExercise,
      setCurrentExercise: (currentExercise) =>
        set({
          currentTokens: [],
          completedExamples: [],
          currentExercise,
        }),

      currentTokens: [],
      setCurrentTokens: (tokens) => set({ currentTokens: tokens }),

      colorScheme: 'system',
      setColorScheme: (colorScheme) => set({ colorScheme }),

      achievements: [],
      stats: initialStats,
      setStats: (stats) =>
        set((state) => {
          const nextStats = { ...state.stats, ...stats };

          return {
            stats: nextStats,
            achievements: getNextAchievements(nextStats, state.achievements),
          };
        }),
      addStats: (stats) =>
        set((state) => {
          const nextStats = { ...state.stats };

          (
            Object.entries(stats) as Array<[keyof Stats, number | undefined]>
          ).forEach(([key, value]) => {
            if (typeof value === 'number') {
              if (key === 'digitMax') {
                nextStats[key] = Math.max(nextStats[key], value);
              } else {
                nextStats[key] += value;
              }
            }
          });

          return {
            stats: nextStats,
            achievements: getNextAchievements(nextStats, state.achievements),
          };
        }),
    }),
    {
      name: STORE_NAME,
      partialize: ({
        currentExercise,
        completedExamples,
        currentTokens,
        stats,
        achievements,
        colorScheme,
      }) => ({
        currentExercise,
        completedExamples,
        currentTokens,
        stats,
        achievements,
        colorScheme,
      }),
    },
  ),
);

if (typeof localStorage !== 'undefined' && !localStorage.getItem(STORE_NAME)) {
  useStore.getState().setCurrentExercise(initialExercise);
}
