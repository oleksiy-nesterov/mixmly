import { useState } from 'react';
import { CircleQuestionMark } from 'lucide-react';
import { ExerciseEdit, type Exercise } from '@/components/ExerciseEdit';
import { ExerciseHelp } from '@/components/ExerciseEdit/ExerciseHelp';
import { useStore } from '@/store/Store';
import {
  ActionButton,
  Dialog,
  DialogTrigger,
  Header,
  Heading,
  Popover,
  useDialogContainer,
} from '@react-spectrum/s2';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };

const headerStyles = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

type ExerciseSettingsDialogProps = {
  onSave?: (exercise: Exercise) => void;
  saveLabel?: string;
};

export const ExerciseSettingsDialog = ({
  onSave,
  saveLabel,
}: ExerciseSettingsDialogProps) => {
  const currentExercise = useStore((state) => state.currentExercise);
  const setCurrentExercise = useStore((state) => state.setCurrentExercise);
  const [draftExercise, setDraftExercise] = useState<Exercise>(
    () => currentExercise,
  );
  const { dismiss } = useDialogContainer();

  return (
    <Dialog
      aria-label="Exercise Settings"
      isDismissible
      UNSAFE_className="dialog-overlay-blur"
    >
      <Header styles={headerStyles}>
        <Heading>Exercise Settings</Heading>
        <DialogTrigger>
          <ActionButton aria-label="Exercise settings help" isQuiet>
            <CircleQuestionMark aria-hidden="true" slot="icon" />
          </ActionButton>
          <Popover size="S">
            <ExerciseHelp />
          </Popover>
        </DialogTrigger>
      </Header>
      <ExerciseEdit
        value={draftExercise}
        onChange={setDraftExercise}
        saveLabel={saveLabel}
        onSave={() => {
          setCurrentExercise(draftExercise);
          onSave?.(draftExercise);
          dismiss();
        }}
      />
    </Dialog>
  );
};
