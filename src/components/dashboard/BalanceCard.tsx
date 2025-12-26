import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

interface BalanceCardProps {
  totalSpent: number;
  monthlyBudget: number;
  currency?: string;
  trend?: number;
}

export function BalanceCard({ 
  totalSpent, 
  monthlyBudget, 
  currency = "₹",
  trend = 0 
}: BalanceCardProps) {
  const remaining = monthlyBudget - totalSpent;
  const percentUsed = (totalSpent / monthlyBudget) * 100;
  const isOverBudget = remaining < 0;

  return (
    <GlassCard className="p-6 overflow-hidden relative" glow="primary">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-accent/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-primary/20">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground">Monthly Spending</span>
          </div>
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend > 0 
                ? "bg-destructive/20 text-destructive" 
                : "bg-success/20 text-success"
            }`}
          >
            {trend > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
            {Math.abs(trend)}%
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <span className="text-4xl font-display font-bold text-foreground">
            {currency}{totalSpent.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-sm ml-2">
            / {currency}{monthlyBudget.toLocaleString()}
          </span>
        </motion.div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget Used</span>
            <span className={isOverBudget ? "text-destructive" : "text-foreground"}>
              {percentUsed.toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentUsed, 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className={`h-full rounded-full ${
                percentUsed > 90 
                  ? "bg-destructive" 
                  : percentUsed > 70 
                    ? "bg-warning" 
                    : "bg-primary"
              }`}
            />
          </div>
          <p className={`text-sm ${isOverBudget ? "text-destructive" : "text-muted-foreground"}`}>
            {isOverBudget 
              ? `Over budget by ${currency}${Math.abs(remaining).toLocaleString()}`
              : `${currency}${remaining.toLocaleString()} remaining`
            }
          </p>
        </div>
      </div>
    </GlassCard>
  );
}