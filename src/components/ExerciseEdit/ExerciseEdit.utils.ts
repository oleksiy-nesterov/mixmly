import type { Exercise, ExerciseOperation } from './ExerciseEdit.types';
import { getExpressionResult } from '@/utils/math.ts';

const getRandomInteger = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const getRandomItem = <T>(items: T[]) =>
  items[getRandomInteger(0, items.length - 1)];

const getNumbers = (min: number, max: number) =>
  Array.from({ length: max - min + 1 }, (_, index) => min + index);

const getDivisionPair = (exercise: Exercise) => {
  const numbers = getNumbers(exercise.minNumber, exercise.maxNumber);
  const candidates = numbers.flatMap((first) =>
    numbers.flatMap((second) => {
      if (second === 0 || first % second !== 0) {
        return [];
      }
      return [{ first, second }];
    }),
  );
  return candidates.length > 0 ? getRandomItem(candidates) : null;
};

export const setupExercise = (exercise: Exercise): string => {
  const example = (operation: ExerciseOperation) => {
    let first;
    let second;

    if (operation === '/') {
      const divisionPair = getDivisionPair(exercise);

      if (!divisionPair) {
        return '';
      }

      first = divisionPair.first;
      second = divisionPair.second;
    } else {
      first = getRandomInteger(exercise.minNumber, exercise.maxNumber);
      second = getRandomInteger(exercise.minNumber, exercise.maxNumber);

      if (operation === '+' && exercise.limitResultToRange) {
        second = getRandomInteger(0, exercise.maxNumber - first);
      }

      if (operation === '-') {
        if (first < second) {
          [first, second] = [second, first];
        }
      }
    }

    const result = getExpressionResult(first, second, operation);
    return `${first}${operation}${second}=${result}`;
  };

  if (exercise.operations.length === 0) {
    return '';
  }

  return Array.from({ length: exercise.count }, () =>
    example(getRandomItem(exercise.operations)),
  ).join('\n');
};

export const canLimitResultToRange = (operations: ExerciseOperation[]) =>
  operations.includes('+');
