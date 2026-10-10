export type ExerciseOperation = '+' | '-' | '*' | '/';

export type Exercise = {
  minNumber: number;
  maxNumber: number;
  operations: ExerciseOperation[];
  count: number;
  limitResultToRange: boolean;
};
