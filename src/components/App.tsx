import { useCallback, useEffect, useRef, useState } from 'react';
import { Game, type GameRef } from '@/components/Game';
import { MainActions } from '@/components/MainActions';
import {
  AchievementDialog,
  StartupDialog,
  WinDialog,
} from '@/components/dialogs';
import { DialogContainer, Provider } from '@react-spectrum/s2';
import { useColorScheme } from '@/hooks/useColorScheme.ts';
import { useStore } from '@/store/Store';
import { debounce } from '@/utils/debounce';

type ActiveDialog = 'startup' | 'win' | null;

const START_GAME_DELAY = 100;

const App = () => {
  const colorScheme = useColorScheme();
  const currentExercise = useStore((state) => state.currentExercise);
  const gameRef = useRef<GameRef>(null);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>('startup');
  const [achievementDialogIds, setAchievementDialogIds] = useState<string[]>(
    [],
  );

  useEffect(
    () =>
      useStore.subscribe((state, previousState) => {
        const newIds = state.achievements.filter(
          (id) => !previousState.achievements.includes(id),
        );

        if (newIds.length > 0) {
          setAchievementDialogIds((currentIds) => [
            ...new Set([...currentIds, ...newIds]),
          ]);
        }
      }),
    [],
  );

  const closeDialog = () => {
    if (achievementDialogIds.length > 0) {
      setAchievementDialogIds([]);
      return;
    }

    if (activeDialog === 'win') {
      setActiveDialog('startup');
      return;
    }
    setActiveDialog(null);
  };

  const showWinDialog = useCallback(() => {
    setActiveDialog('win');
  }, [setActiveDialog]);

  return (
    <Provider
      background="layer-1"
      colorScheme={colorScheme}
      elementType="main"
      UNSAFE_className="relative flex flex-1 overflow-hidden"
    >
      <div className="relative flex flex-1 overflow-hidden">
        <Game
          ref={gameRef}
          className="size-full"
          onCompleteGame={showWinDialog}
        />
      </div>
      <MainActions
        className="absolute top-6 right-6"
        onResetGame={(exercise) => {
          gameRef.current?.startNewGame(exercise);
        }}
        onRestoreCompletedExample={(tokens) => {
          gameRef.current?.restoreTokens(tokens);
        }}
      />
      <DialogContainer onDismiss={closeDialog}>
        {achievementDialogIds.length > 0 ? (
          <AchievementDialog ids={achievementDialogIds} />
        ) : activeDialog === 'win' ? (
          <WinDialog />
        ) : activeDialog === 'startup' ? (
          <StartupDialog
            onContinueGame={() => {
              setActiveDialog(null);
              debounce(() => {
                gameRef.current?.continueGame();
              }, START_GAME_DELAY)();
            }}
            onStartNewGame={() => {
              setActiveDialog(null);
              debounce(() => {
                gameRef.current?.startNewGame(currentExercise);
              }, START_GAME_DELAY)();
            }}
          />
        ) : null}
      </DialogContainer>
    </Provider>
  );
};

export default App;
