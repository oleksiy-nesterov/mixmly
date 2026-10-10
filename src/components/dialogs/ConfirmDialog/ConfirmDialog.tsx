import { Button } from '@/components/Button';
import { ButtonGroup, Content, Dialog, Heading } from '@react-spectrum/s2';

type ConfirmDialogProps = {
  description: string;
  cancelLabel?: string;
  confirmLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export const ConfirmDialog = ({
  description,
  cancelLabel = 'Cancel',
  confirmLabel = 'Yes',
  onCancel,
  onConfirm,
}: ConfirmDialogProps) => (
  <Dialog aria-label="Confirm" UNSAFE_className="dialog-overlay-blur">
    <Heading slot="title">Are you sure?</Heading>
    <Content>{description}</Content>
    <ButtonGroup>
      <Button variant="secondary" onPress={onCancel}>
        {cancelLabel}
      </Button>
      <Button variant="negative" onPress={onConfirm}>
        {confirmLabel}
      </Button>
    </ButtonGroup>
  </Dialog>
);
