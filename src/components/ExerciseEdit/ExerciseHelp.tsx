import { Text } from '@react-spectrum/s2';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import { EXERCISE_HELP } from './ExerciseEdit.constants';

const titleStyles = style({
  color: 'neutral',
  font: 'heading-xs',
});

const bodyStyles = style({
  color: 'neutral-subdued',
  font: 'body-sm',
});

const labelStyles = style({
  color: 'neutral',
  font: 'ui',
  fontWeight: 'bold',
});

const exampleStyles = style({
  borderColor: 'ButtonFace',
  borderRadius: 'default',
  borderStyle: 'solid',
  borderWidth: 1,
});

export const ExerciseHelp = () => {
  return (
    <div className="flex flex-col gap-3 p-1">
      <div className="flex flex-col gap-1">
        <Text styles={titleStyles}>Exercise settings</Text>
        <Text styles={bodyStyles}>
          Choose the numbers, operations, and amount of examples for the game.
        </Text>
      </div>

      <div className="grid gap-2">
        {EXERCISE_HELP.map(({ label, description }) => (
          <div key={label} className="grid gap-1">
            <Text styles={labelStyles}>{label}</Text>
            <Text styles={bodyStyles}>{description}</Text>
          </div>
        ))}
      </div>

      <div className={`${exampleStyles} px-3 py-2`}>
        <Text styles={bodyStyles}>
          Example: for 0-10, 9 + 9 is skipped when the result limit is on, but 9
          + 1 is allowed. Other operations ignore this setting.
        </Text>
      </div>
    </div>
  );
};
