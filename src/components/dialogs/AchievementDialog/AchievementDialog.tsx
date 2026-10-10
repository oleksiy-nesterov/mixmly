import { AchievementBase } from '@/components/Achievements';
import { ACHIEVEMENTS as achievementDefinitions } from '@/components/Achievements/Achievement.constants';
import { MixmlyTitle } from '@/components/MixmlyTitle';
import {
  Content,
  FullscreenDialog,
  useDialogContainer,
} from '@react-spectrum/s2';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import { fullscreenDialogContentStyles } from '../dialogs.styles';

const achievementsStyles = style({
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'start',
  justifyContent: 'center',
  gap: 24,
  width: '100%',
  boxSizing: 'border-box',
});

const achievementStyles = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 8,
});

const descriptionStyles = style({
  font: 'body-lg',
  color: 'neutral-subdued',
  margin: 0,
  maxWidth: 240,
});

export type AchievementDialogProps = {
  ids: string[];
};

export const AchievementDialog = ({ ids }: AchievementDialogProps) => {
  const { dismiss } = useDialogContainer();
  const achievements = achievementDefinitions.filter(({ id }) =>
    ids.includes(id),
  );

  if (achievements.length === 0) {
    return null;
  }

  return (
    <FullscreenDialog
      aria-label={`Achievements unlocked: ${achievements.map(({ title }) => title).join(', ')}`}
      variant="fullscreenTakeover"
      UNSAFE_className="dialog-overlay-blur dialog-no-padding"
    >
      <Content>
        <div className={fullscreenDialogContentStyles} onClick={dismiss}>
          <MixmlyTitle text="Congrats!" size={82} />
          <div className={achievementsStyles}>
            {achievements.map((achievement) => (
              <div key={achievement.id} className={achievementStyles}>
                <AchievementBase
                  size={240}
                  title={achievement.title}
                  description={achievement.description}
                  color={achievement.color}
                  bgColor={achievement.bgColor}
                  emoji={achievement.emoji}
                  isCover={achievement.isCover}
                  angle={achievement.angle}
                />
                <p className={descriptionStyles}>{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </Content>
    </FullscreenDialog>
  );
};
