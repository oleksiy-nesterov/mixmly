import {
  Content,
  FullscreenDialog,
  useDialogContainer,
} from '@react-spectrum/s2';
import { fullscreenDialogContentStyles } from '@/components/dialogs/dialogs.styles.ts';

export const WinDialog = () => {
  const { dismiss } = useDialogContainer();

  return (
    <FullscreenDialog
      aria-label="Win"
      variant="fullscreenTakeover"
      UNSAFE_className="dialog-overlay-blur dialog-no-padding"
    >
      <Content>
        <div className={fullscreenDialogContentStyles} onClick={dismiss}>
          <img
            src="/win.svg"
            alt="You did It!"
            className="w-full sm:max-w-[50vw] self-center object-contain"
          />
        </div>
      </Content>
    </FullscreenDialog>
  );
};
