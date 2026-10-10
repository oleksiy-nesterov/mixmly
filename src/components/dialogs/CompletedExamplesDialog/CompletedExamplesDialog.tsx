import { Content, Dialog, Heading } from '@react-spectrum/s2';
import { useStore } from '@/store/Store';
import { ExamplesList } from './ExamplesList';

type CompletedExamplesDialogProps = {
  onRestoreExample: (tokens: string[]) => void;
};

export const CompletedExamplesDialog = ({
  onRestoreExample,
}: CompletedExamplesDialogProps) => {
  const completedExamples = useStore((state) => state.completedExamples);
  const removeCompletedExample = useStore(
    (state) => state.removeCompletedExample,
  );

  const restoreExample = (index: number) => {
    const tokens = removeCompletedExample(index);

    if (tokens) {
      onRestoreExample(tokens);
    }
  };

  return (
    <Dialog
      aria-label="Completed Examples"
      isDismissible
      UNSAFE_className="dialog-overlay-blur"
    >
      <Heading slot="title">Completed Examples</Heading>
      <Content>
        <ExamplesList examples={completedExamples} onRestore={restoreExample} />
      </Content>
    </Dialog>
  );
};
