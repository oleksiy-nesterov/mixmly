import '../../css/dialogs.css';

import { useState, type ComponentPropsWithoutRef } from 'react';
import { Settings } from 'lucide-react';
import {
  CompletedExamplesDialog,
  ExerciseSettingsDialog,
  InstallDialog,
} from '@/components/dialogs';
import { type Exercise } from '@/components/ExerciseEdit';
import { type ColorScheme, useStore } from '@/store/Store';
import { cn } from '@/utils/cn';
import {
  ActionButton,
  ActionButtonGroup,
  DialogContainer,
  Menu,
  MenuItem,
  MenuTrigger,
  Text,
  Tooltip,
  TooltipTrigger,
} from '@react-spectrum/s2';
import Contrast from '@react-spectrum/s2/icons/Contrast';
import DeviceDesktopMobile from '@react-spectrum/s2/icons/DeviceDesktopMobile';
import Lighten from '@react-spectrum/s2/icons/Lighten';
import ViewList from '@react-spectrum/s2/icons/ViewList';
import BrightnessContrast from '@react-spectrum/s2/icons/BrightnessContrast';
import InfoCircle from '@react-spectrum/s2/icons/InfoCircle';

type MainActionsProps = ComponentPropsWithoutRef<'div'> & {
  onRestoreCompletedExample: (tokens: string[]) => void;
  onResetGame: (exercise: Exercise) => void;
};

type ActiveDialog = 'exercise' | 'completed' | 'install' | null;

const colorSchemeLabels: Record<ColorScheme, string> = {
  system: 'System theme',
  light: 'Light theme',
  dark: 'Dark theme',
};

export const MainActions = ({
  className,
  onResetGame,
  onRestoreCompletedExample,
  ...props
}: MainActionsProps) => {
  const colorScheme = useStore((state) => state.colorScheme);
  const setColorScheme = useStore((state) => state.setColorScheme);
  const [activeDialog, setActiveDialog] = useState<ActiveDialog>(null);

  const openExerciseDialog = () => {
    setActiveDialog('exercise');
  };

  const openInstallDialog = () => {
    setActiveDialog('install');
  };

  const openCompletedDialog = () => {
    setActiveDialog('completed');
  };

  const closeDialog = () => {
    setActiveDialog(null);
  };

  return (
    <div {...props} className={cn('flex gap-2', className)}>
      <MenuTrigger align="end">
        <ActionButton aria-label={colorSchemeLabels[colorScheme]}>
          <Contrast aria-hidden="true" slot="icon" />
        </ActionButton>
        <Menu
          aria-label="Theme"
          selectedKeys={[colorScheme]}
          selectionMode="single"
          onAction={(key) => setColorScheme(key as ColorScheme)}
          size="S"
        >
          <MenuItem id="system" textValue="System theme">
            <DeviceDesktopMobile />
            <Text slot="label">System</Text>
          </MenuItem>
          <MenuItem id="light" textValue="Light theme">
            <Lighten />
            <Text slot="label">Light</Text>
          </MenuItem>
          <MenuItem id="dark" textValue="Dark theme">
            <BrightnessContrast />
            <Text slot="label">Dark</Text>
          </MenuItem>
        </Menu>
      </MenuTrigger>

      <ActionButtonGroup aria-label="Game actions" density="compact">
        <TooltipTrigger>
          <ActionButton aria-label="Settings" onPress={openExerciseDialog}>
            <Settings aria-hidden="true" slot="icon" />
          </ActionButton>
          <Tooltip>Exercise Settings</Tooltip>
        </TooltipTrigger>

        <TooltipTrigger>
          <ActionButton
            aria-label="Completed examples"
            onPress={openCompletedDialog}
          >
            <ViewList aria-hidden="true" slot="icon" />
          </ActionButton>
          <Tooltip>Completed examples</Tooltip>
        </TooltipTrigger>

        <ActionButton aria-label="Install" onPress={openInstallDialog}>
          <InfoCircle aria-hidden="true" slot="icon" />
        </ActionButton>
      </ActionButtonGroup>

      <DialogContainer onDismiss={closeDialog}>
        {activeDialog === 'exercise' ? (
          <ExerciseSettingsDialog saveLabel="Reset Game" onSave={onResetGame} />
        ) : null}
        {activeDialog === 'completed' ? (
          <CompletedExamplesDialog
            onRestoreExample={onRestoreCompletedExample}
          />
        ) : null}
        {activeDialog === 'install' ? <InstallDialog /> : null}
      </DialogContainer>
    </div>
  );
};
