import { CloseButton, CustomDialog } from '@react-spectrum/s2';
import { InstallCard } from '@/components/InstallCard';

export const InstallDialog = () => (
  <CustomDialog
    isDismissible
    padding="none"
    UNSAFE_className="dialog-overlay-blur"
  >
    <InstallCard />
    <div className="absolute end-3 top-3">
      <CloseButton />
    </div>
  </CustomDialog>
);
