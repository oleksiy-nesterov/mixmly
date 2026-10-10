import { ActionButton } from '@react-spectrum/s2';
import { ActionButtonGroup } from '@react-spectrum/s2/ActionButtonGroup';
import { ListView, ListViewItem } from '@react-spectrum/s2/ListView';
import { Text } from '@react-spectrum/s2/Text';
import Delete from '@react-spectrum/s2/icons/Delete';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import { SvgTokens } from '@/components/Tokens';

const listStyles = style({
  maxWidth: 'full',
  height: 320,
});

const emptyBlockStyles = style({
  padding: 16,
  font: 'body',
  color: 'neutral-subdued',
});

type ExamplesListProps = {
  examples: string[][];
  onRestore: (index: number) => void;
};

export const ExamplesList = ({ examples, onRestore }: ExamplesListProps) => (
  <ListView
    aria-label="Completed examples"
    items={examples}
    renderEmptyState={() => (
      <div className={emptyBlockStyles}>No completed examples yet.</div>
    )}
    isQuiet
    styles={listStyles}
  >
    {examples.map((example, index) => {
      const text = example.join('');
      return (
        <ListViewItem key={index} textValue={text}>
          <Text>
            <SvgTokens tokens={example} size={30} />
          </Text>
          <ActionButtonGroup aria-label={`Actions for ${text}`}>
            <ActionButton
              aria-label={`Restore ${text}`}
              onPress={() => onRestore(index)}
            >
              <Delete />
            </ActionButton>
          </ActionButtonGroup>
        </ListViewItem>
      );
    })}
  </ListView>
);
