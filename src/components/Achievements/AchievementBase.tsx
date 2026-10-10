import { useColorScheme } from '@/hooks/useColorScheme';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };

const textStyle = {
  fontSize: 46,
  fontFamily: 'Fredoka, sans-serif',
  fontWeight: 600,
};

const titleStyles = style({
  fill: {
    default: 'black',
    isDark: 'white',
  },
});

export type AchievementBaseProps = {
  size?: number;
  title: string;
  description?: string;
  color: string;
  bgColor: string;
  emoji: string;
  isCover?: boolean;
  angle?: number;
  progress?: number;
  disabled?: boolean;
};

export const AchievementBase = ({
  size = 48,
  title,
  description,
  color,
  bgColor,
  emoji,
  isCover = false,
  angle = 0,
  progress,
  disabled,
}: AchievementBaseProps) => {
  const colorScheme = useColorScheme();
  const achievementColor =
    colorScheme === 'light' ? `color-mix(in srgb, ${color} 15%, white)` : color;
  const progressColor =
    colorScheme === 'light' ? `color-mix(in srgb, ${color} 35%, white)` : color;
  const lines = title.split(/\s/);
  const normalizedProgress = Number.isFinite(progress)
    ? Math.max(0, Math.min(progress ?? 0, 1))
    : 0;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 300 300"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={description ? `${title}. ${description}` : title}
      className="select-none"
    >
      <defs>
        <filter id="grayscaleFilter" colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="
              0.2126 0.7152 0.0722 0 0
              0.2126 0.7152 0.0722 0 0
              0.2126 0.7152 0.0722 0 0
              0      0      0      1 0
            "
          />
        </filter>
      </defs>
      <g filter={disabled ? `url(#grayscaleFilter)` : undefined}>
        <path
          id="back"
          fill={bgColor}
          d="m 244.9 150.2 a 94.9 94.9 0 0 1 -94.9 94.9 94.9 94.9 0 0 1 -94.9 -94.9 94.9 94.9 0 0 1 94.9 -94.9 94.9 94.9 0 0 1 94.9 94.9 z"
        />
        <path
          id="shape"
          fill={achievementColor}
          transform={`rotate(${angle} 150 150)`}
          d="m 164.8 26.2 c -24.9 0.8 -68 7.9 -83.5 18.5 -19.3 13.2 -52.9 71.8 -54.8 94.9 -1.5 23.1 23.1 85.8 40.1 101.7 17 15.5 81.6 35.5 104.3 32.1 23.1 -3.4 78.6 -41.6 90.3 -61.6 11.7 -20 16.6 -87.3 8.3 -108.9 -8.7 -21.5 -58.2 -67.7 -80.1 -74.5 -6.4 -1.9 -15.5 -2.3 -24.6 -2.3 z m -14.7 41.2 a 82.4 82.4 0 0 1 82.4 82.8 82.4 82.4 0 0 1 -82.4 82.4 82.4 82.4 0 0 1 -82.4 -82.4 82.4 82.4 0 0 1 82.4 -82.8 z"
        />
        <text
          id="emoji"
          x="150"
          y="165"
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontSize: 100 }}
        >
          {emoji}
        </text>
        {isCover ? (
          <path
            id="cover"
            fill={achievementColor}
            d="M 150 184.2 A 83.1 49.9 0 0 0 66.9 234.1 H 232.8 a 83.1 49.9 0 0 0 -83.1 -49.9 z"
          />
        ) : null}
      </g>
      {normalizedProgress > 0 && normalizedProgress < 1 ? (
        <circle
          cx="150"
          cy="150"
          r="83"
          fill="none"
          stroke={progressColor}
          strokeWidth="16"
          strokeLinecap="round"
          pathLength="1"
          strokeDasharray="1"
          strokeDashoffset={1 - normalizedProgress}
          transform="rotate(-90 150 150)"
        />
      ) : null}
      <text
        className={titleStyles({ isDark: colorScheme === 'dark' })}
        x="150"
        y="230"
        textAnchor="middle"
        dominantBaseline="middle"
        style={textStyle}
      >
        {lines[0]}
      </text>
      <text
        className={titleStyles({ isDark: colorScheme === 'dark' })}
        x="150"
        y="270"
        textAnchor="middle"
        dominantBaseline="middle"
        style={textStyle}
      >
        {lines.slice(1).join(' ')}
      </text>
    </svg>
  );
};
