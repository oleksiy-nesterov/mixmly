import '../../css/back.css';

import { Button } from '@/components/Button';
import { AchievementOverview } from '@/components/Achievements';
import { env } from '@/env';
import { usePwaApp } from '@/pwa/use-pwa-app';
import { cn } from '@/utils/cn';
import {
  Card,
  CardPreview,
  Content,
  Footer,
  Image,
  LinkButton,
} from '@react-spectrum/s2';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };

const cardStyles = style({
  width: '100%',
  maxWidth: 420,
});

const imgStyles = style({
  objectFit: 'contain',
});

const achievementsScrollStyles = style({
  width: '100%',
  maxHeight: '35vh',
  overflowY: 'auto',
  overscrollBehavior: 'contain',
});

const footerStyles = style({
  justifyContent: 'start',
});

const versionStyles = style({
  color: 'neutral-subdued',
  font: 'body-sm',
  margin: 0,
  position: 'absolute',
  right: 16,
  bottom: 16,
});

export const InstallCard = () => {
  const { canInstallApp, canOpenApp, installApp, launchMode, openApp } =
    usePwaApp();
  const showAppButton =
    launchMode !== 'standalone' && (canOpenApp || canInstallApp);

  return (
    <Card variant="primary" size="L" styles={cardStyles}>
      <CardPreview>
        <Image
          alt={env.VITE_PROJECT_TITLE}
          src="/og-image.webp"
          styles={imgStyles}
          UNSAFE_className="back"
        />
        <p className={versionStyles}>Version {APP_VERSION}</p>
      </CardPreview>
      <Content>
        <div
          className={cn(achievementsScrollStyles, 'scroll-fade-mask')}
          role="region"
          aria-label="Achievements"
          tabIndex={0}
        >
          <AchievementOverview size={92} className="pb-6 pt-2" />
        </div>
      </Content>
      <Footer styles={footerStyles}>
        {showAppButton ? (
          canOpenApp ? (
            <Button onPress={openApp}>Open App</Button>
          ) : (
            <Button onPress={installApp}>Install App</Button>
          )
        ) : null}
        <LinkButton
          href="mailto:oleksiy.nesterov+mixmly@gmail.com"
          variant="genai"
        >
          Contact
        </LinkButton>
      </Footer>
    </Card>
  );
};
