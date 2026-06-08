import { type LucideIcon, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: number;
  trendLabel?: string;
  variant?: "default" | "gold" | "success" | "warning" | "danger";
  className?: string;
}

const variantStyles = {
  default: "border-border",
  gold: "border-gold/20 bg-gradient-to-br from-gold/5 to-transparent",
  success: "border-success/20 bg-gradient-to-br from-success/5 to-transparent",
  warning: "border-warning/20 bg-gradient-to-br from-warning/5 to-transparent",
  danger: "border-danger/20 bg-gradient-to-br from-danger/5 to-transparent",
};

const iconVariantStyles = {
  default: "bg-muted text-muted-foreground",
  gold: "bg-gold/10 text-gold",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
};

export function KpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendLabel,
  variant = "default",
  className,
}: KpiCardProps) {
  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
        ? TrendingUp
        : TrendingDown;

  const trendColor =
    trend === undefined || trend === 0
      ? "text-muted-foreground"
      : trend > 0
        ? "text-success"
        : "text-danger";

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all hover:shadow-luxury-lg animate-fade-in",
        variantStyles[variant],
        className
      )}
    >
      <div className="absolute inset-0 bg-gold-shimmer bg-[length:200%_100%] opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
              {title}
            </p>
            <p className="text-2xl sm:text-3xl font-display font-semibold tracking-tight truncate">
              {value}
            </p>
            {subtitle && (
              <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
          {Icon && (
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                iconVariantStyles[variant]
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>
        {trend !== undefined && (
          <div className={cn("mt-3 flex items-center gap-1.5 text-xs", trendColor)}>
            <TrendIcon className="h-3.5 w-3.5" />
            <span className="font-medium">
              {trend > 0 ? "+" : ""}
              {trend}%
            </span>
            {trendLabel && (
              <span className="text-muted-foreground">{trendLabel}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function KpiGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
