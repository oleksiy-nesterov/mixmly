import { useState } from 'react';
import { Tooltip, TooltipTrigger } from '@react-spectrum/s2';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import { Focusable } from 'react-aria-components';
import { AchievementBase } from './AchievementBase';
import { ACHIEVEMENTS } from './Achievement.constants';

export type AchievementProps = {
  id: string;
  size?: number;
  progress?: number;
};

const triggerStyles = style({ display: 'inline-flex', cursor: 'default' });

export const Achievement = ({
  id,
  size = 48,
  progress = 0,
}: AchievementProps) => {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const achievement = ACHIEVEMENTS.find((item) => item.id === id);

  if (!achievement) {
    return null;
  }

  return (
    <TooltipTrigger
      placement="bottom"
      delay={0}
      isOpen={isTooltipOpen}
      onOpenChange={setIsTooltipOpen}
    >
      <Focusable>
        <span
          className={triggerStyles}
          onPointerDown={() => {
            setIsTooltipOpen((value) => !value);
          }}
        >
          <AchievementBase
            size={size}
            title={achievement.title}
            description={achievement.description}
            color={achievement.color}
            bgColor={achievement.bgColor}
            emoji={achievement.emoji}
            isCover={achievement.isCover}
            angle={achievement.angle}
            disabled={progress < 1}
            progress={progress}
          />
        </span>
      </Focusable>
      <Tooltip UNSAFE_style={{ transform: 'translateY(-10px)' }}>
        {achievement.description}
      </Tooltip>
    </TooltipTrigger>
  );
};
