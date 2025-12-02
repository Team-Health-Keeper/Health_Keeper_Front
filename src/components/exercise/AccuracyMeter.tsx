import { getAccuracyColor } from './poseAnalyzer';

interface AccuracyMeterProps {
  accuracy: number;
  size?: 'sm' | 'md' | 'lg';
}

export function AccuracyMeter({ accuracy, size = 'md' }: AccuracyMeterProps) {
  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      <div
        className={`w-full bg-muted rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${accuracy}%`,
            backgroundColor: getAccuracyColor(accuracy),
          }}
        />
      </div>
    </div>
  );
}
