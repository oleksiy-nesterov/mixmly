import { useStore } from '@/store/Store';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import { Achievement } from './Achievement';
import { ACHIEVEMENTS } from './Achievement.constants';
import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn.ts';

const overviewStyles = style({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  gap: 4,
  width: '100%',
});

export type AchievementOverviewProps = HTMLAttributes<HTMLDivElement> & {
  size?: number;
};

export const AchievementOverview = ({
  size = 48,
  className,
}: AchievementOverviewProps) => {
  const achievements = useStore((state) => state.achievements);
  const stats = useStore((state) => state.stats);

  return (
    <div
      className={cn(overviewStyles, className)}
      aria-label="All achievements"
    >
      {ACHIEVEMENTS.map((achievement) => (
        <Achievement
          key={achievement.id}
          id={achievement.id}
          size={size}
          progress={
            achievements.includes(achievement.id)
              ? 1
              : (achievement.progress(stats) ?? 0)
          }
        />
      ))}
    </div>
  );
};
