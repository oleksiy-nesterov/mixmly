import { useState } from 'react';
import { Button } from '@/components/Button';
import { env } from '@/env';
import { useStore } from '@/store/Store';
import { Content, DialogContainer, FullscreenDialog } from '@react-spectrum/s2';
import { ConfirmDialog } from '../ConfirmDialog';
import { ExerciseSettingsDialog } from '../ExerciseSettingsDialog';

type StartupActiveDialog = 'confirmNewGame' | 'exerciseSettings' | null;

type StartupDialogProps = {
  onContinueGame: () => void;
  onStartNewGame: () => void;
};

export const StartupDialog = ({
  onContinueGame,
  onStartNewGame,
}: StartupDialogProps) => {
  const hasCurrentGame = useStore((state) => state.currentTokens.length > 0);
  const [activeDialog, setActiveDialog] = useState<StartupActiveDialog>(null);

  return (
    <>
      <FullscreenDialog
        aria-label={env.VITE_PROJECT_TITLE}
        variant="fullscreenTakeover"
        UNSAFE_className="back"
        isKeyboardDismissDisabled
      >
        <Content UNSAFE_className="flex flex-col items-center justify-center gap-4">
          <img
            alt={env.VITE_PROJECT_TITLE}
            src="/og-image.webp"
            className="w-full max-w-[420px] object-contain"
          />
          {hasCurrentGame && (
            <Button variant="genai" size="XL" onPress={onContinueGame}>
              Continue Game
            </Button>
          )}
          <Button
            size="XL"
            onPress={() => {
              if (hasCurrentGame) {
                setActiveDialog('confirmNewGame');
                return;
              }
              onStartNewGame();
            }}
          >
            New Game
          </Button>
        </Content>
      </FullscreenDialog>
      <DialogContainer onDismiss={() => setActiveDialog(null)}>
        {activeDialog === 'confirmNewGame' ? (
          <ConfirmDialog
            description="Are you sure you want to start a new game? Your previous game will be lost."
            confirmLabel="Yes, Start New Game"
            onCancel={() => setActiveDialog(null)}
            onConfirm={() => setActiveDialog('exerciseSettings')}
          />
        ) : null}
        {activeDialog === 'exerciseSettings' ? (
          <ExerciseSettingsDialog
            saveLabel="Start Game"
            onSave={() => {
              setActiveDialog(null);
              onStartNewGame();
            }}
          />
        ) : null}
      </DialogContainer>
    </>
  );
};
