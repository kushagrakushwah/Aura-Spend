import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type InsightType = "tip" | "warning" | "success" | "info";

interface InsightCardProps {
  type: InsightType;
  title: string;
  description: string;
}

const iconMap = {
  tip: Sparkles,
  warning: AlertCircle,
  success: CheckCircle,
  info: TrendingUp,
};

const styleMap = {
  tip: {
    bg: "bg-accent/20",
    border: "border-accent/30",
    icon: "text-accent",
  },
  warning: {
    bg: "bg-warning/20",
    border: "border-warning/30",
    icon: "text-warning",
  },
  success: {
    bg: "bg-success/20",
    border: "border-success/30",
    icon: "text-success",
  },
  info: {
    bg: "bg-primary/20",
    border: "border-primary/30",
    icon: "text-primary",
  },
};

export function InsightCard({ type, title, description }: InsightCardProps) {
  const Icon = iconMap[type];
  const styles = styleMap[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-4 rounded-xl ${styles.bg} border ${styles.border}`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${styles.bg}`}>
          <Icon className={`h-4 w-4 ${styles.icon}`} />
        </div>
        <div>
          <h4 className="font-medium text-foreground text-sm">{title}</h4>
          <p className="text-muted-foreground text-xs mt-1">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}