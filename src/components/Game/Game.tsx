import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type ComponentPropsWithoutRef,
} from 'react';
import { type Exercise } from '@/components/ExerciseEdit';
import { setupExercise } from '@/components/ExerciseEdit/ExerciseEdit.utils';
import { useStore } from '@/store/Store';
import { cn } from '@/utils/cn';
import Mixmly, { type MixmlyAction } from '@/mixmly';
import { getStatsForTokens, render } from '@/components/Game/Game.utils.ts';

type GameProps = ComponentPropsWithoutRef<'div'> & {
  onCompleteGame: () => void;
};

const GAME_TIMER_INTERVAL = 5000;

export type GameRef = {
  restoreTokens: (tokens: string[]) => void;
  startNewGame: (exercise: Exercise) => void;
  continueGame: () => void;
};

export const Game = forwardRef<GameRef, GameProps>(
  ({ className, onCompleteGame, ...props }, ref) => {
    const elementRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Mixmly | null>(null);
    const gameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const setCurrentExercise = useStore((state) => state.setCurrentExercise);
    const setCurrentTokens = useStore((state) => state.setCurrentTokens);
    const addCompletedExample = useStore((state) => state.addCompletedExample);
    const addStats = useStore((state) => state.addStats);
    const setStats = useStore((state) => state.setStats);

    const clearGameTimer = useCallback(() => {
      if (gameTimerRef.current === null) return;
      clearTimeout(gameTimerRef.current);
      gameTimerRef.current = null;
    }, []);

    const startGameTimer = useCallback(() => {
      if (gameTimerRef.current !== null) return;
      const tick = () => {
        addStats({ totalTime: GAME_TIMER_INTERVAL });
        gameTimerRef.current = setTimeout(tick, GAME_TIMER_INTERVAL);
      };
      gameTimerRef.current = setTimeout(tick, GAME_TIMER_INTERVAL);
    }, [addStats]);

    useImperativeHandle(
      ref,
      () => ({
        restoreTokens: (tokens) => {
          addStats({ restoredExampleCount: 1 });
          addStats({ gameRestoredExampleCount: 1 });
          gameRef.current?.load(tokens);
        },
        startNewGame: (exercise) => {
          addStats({ newGamesCount: 1 });
          setStats({ gameRestoredExampleCount: 0 });
          setCurrentExercise(exercise);
          gameRef.current?.start(setupExercise(exercise));
          startGameTimer();
        },
        continueGame: () => {
          const { currentTokens } = useStore.getState();
          if (currentTokens.length === 0) return;
          addStats({ continueGamesCount: 1 });
          gameRef.current?.load(currentTokens);
          startGameTimer();
        },
      }),
      [addStats, setCurrentExercise, setStats, startGameTimer],
    );

    useEffect(() => {
      const element = elementRef.current;

      if (!element?.parentElement) {
        return;
      }

      const game = new Mixmly({
        element: element,
        debug: false,
        onRender: render,
        onChange: (tokens: string[]) => {
          const { currentTokens } = useStore.getState();
          setCurrentTokens(tokens);
          if (currentTokens.length > 0 && tokens.length === 0) {
            clearGameTimer();
            addStats({ completedGameCount: 1 });
            onCompleteGame();
          }
        },
        onComplete: (tokens: string[]) => {
          addCompletedExample(tokens);
          addStats(getStatsForTokens(tokens));
        },
        onAction: (action: MixmlyAction) => {
          if (action === 'click') {
            addStats({ clicksCount: 1 });
          }
          if (action === 'drag') {
            addStats({ dragsCount: 1 });
          }
        },
      });

      gameRef.current = game;

      return () => {
        clearGameTimer();
        game.destroy();
        gameRef.current = null;
      };
    }, [
      addCompletedExample,
      addStats,
      clearGameTimer,
      onCompleteGame,
      setCurrentTokens,
    ]);

    return (
      <div
        {...props}
        ref={elementRef}
        className={cn('relative flex-1 overflow-hidden', className)}
      />
    );
  },
);
