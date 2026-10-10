import { Divide, Minus, Plus, X } from 'lucide-react';

import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import {
  Content,
  Form,
  RangeSlider,
  Slider,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
} from '@react-spectrum/s2';
import { Button } from '@/components/Button';
import {
  MAX_EXERCISE_COUNT,
  MAX_EXERCISE_NUMBER,
  MIN_EXERCISE_COUNT,
  MIN_EXERCISE_NUMBER,
} from './ExerciseEdit.constants';
import type { Exercise, ExerciseOperation } from './ExerciseEdit.types';
import { canLimitResultToRange } from './ExerciseEdit.utils';

const fieldLabelStyles = style({
  font: 'ui',
  color: {
    default: 'neutral-subdued',
    forcedColors: 'ButtonText',
  },
});

type ExerciseEditProps = {
  value: Exercise;
  onChange: (value: Exercise) => void;
  onSave: () => void;
  saveLabel?: string;
};

export const ExerciseEdit = ({
  value,
  onChange,
  onSave,
  saveLabel = 'Save',
}: ExerciseEditProps) => {
  const shouldLimitResultToRange = canLimitResultToRange(value.operations);

  const updateExercise = (nextValue: Partial<Exercise>) => {
    onChange({
      ...value,
      ...nextValue,
    });
  };

  return (
    <Content>
      <div className="flex flex-col gap-5">
        <Form
          onSubmit={(event) => {
            event.preventDefault();
            onSave();
          }}
        >
          <div className="flex flex-col gap-6">
            <RangeSlider
              label="Min / Max Number"
              minValue={MIN_EXERCISE_NUMBER}
              maxValue={MAX_EXERCISE_NUMBER}
              step={5}
              value={{ start: value.minNumber, end: value.maxNumber }}
              onChange={({ start, end }) =>
                updateExercise({
                  minNumber: start,
                  maxNumber: end,
                })
              }
            />

            <div className="flex flex-col gap-2">
              <div className={fieldLabelStyles}>Operations</div>
              <ToggleButtonGroup
                aria-label="Operations"
                density="compact"
                size="XL"
                selectionMode="multiple"
                disallowEmptySelection
                selectedKeys={value.operations}
                onSelectionChange={(keys) => {
                  const operations = [...keys] as ExerciseOperation[];

                  updateExercise({
                    operations,
                    limitResultToRange: canLimitResultToRange(operations)
                      ? value.limitResultToRange
                      : false,
                  });
                }}
              >
                <ToggleButton id="+">
                  <Plus aria-hidden="true" slot="icon" />
                </ToggleButton>
                <ToggleButton id="-">
                  <Minus aria-hidden="true" slot="icon" />
                </ToggleButton>
                <ToggleButton id="*">
                  <X aria-hidden="true" slot="icon" />
                </ToggleButton>
                <ToggleButton id="/">
                  <Divide aria-hidden="true" slot="icon" />
                </ToggleButton>
              </ToggleButtonGroup>
            </div>

            <Slider
              label="Count"
              minValue={MIN_EXERCISE_COUNT}
              maxValue={MAX_EXERCISE_COUNT}
              step={1}
              value={value.count}
              onChange={(count) =>
                updateExercise({
                  count,
                })
              }
            />

            <div className="flex justify-end">
              <Switch
                isDisabled={!shouldLimitResultToRange}
                isSelected={value.limitResultToRange}
                onChange={(limitResultToRange) =>
                  updateExercise({ limitResultToRange })
                }
              >
                Limit addition result to Min / Max
              </Switch>
            </div>

            <div className="self-start">
              <Button type="submit" size="XL">
                {saveLabel}
              </Button>
            </div>
          </div>
        </Form>
      </div>
    </Content>
  );
};
