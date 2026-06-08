"use client";

import { cn } from "@/lib/utils";

interface CeoScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CeoScoreRing({
  score,
  size = 200,
  strokeWidth = 12,
  className,
}: CeoScoreRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s >= 75) return "hsl(var(--success))";
    if (s >= 50) return "hsl(var(--gold))";
    if (s >= 25) return "hsl(var(--warning))";
    return "hsl(var(--danger))";
  };

  const getLabel = (s: number) => {
    if (s >= 75) return "Excellent";
    if (s >= 50) return "Good";
    if (s >= 25) return "Needs Attention";
    return "Critical";
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor(score)}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-5xl font-display font-bold text-gradient-gold">
          {score}
        </span>
        <span className="text-sm text-muted-foreground mt-1">{getLabel(score)}</span>
      </div>
    </div>
  );
}
