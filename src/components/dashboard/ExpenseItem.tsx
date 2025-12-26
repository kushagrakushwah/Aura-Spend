import { motion } from "framer-motion";
import { getCategoryById } from "@/lib/categories";
import { format } from "date-fns";

interface ExpenseItemProps {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: Date;
  currency?: string;
  onClick?: () => void;
}

export function ExpenseItem({
  title,
  amount,
  category,
  date,
  currency = "₹",
  onClick,
}: ExpenseItemProps) {
  const categoryData = getCategoryById(category);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-4 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 cursor-pointer transition-colors border border-transparent hover:border-border/40"
    >
      <div className={`p-3 rounded-xl ${categoryData.bgColor}`}>
        <span className="text-2xl">{categoryData.emoji}</span>
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{title}</p>
        <p className="text-sm text-muted-foreground">
          {format(date, "MMM d, yyyy")}
        </p>
      </div>

      <div className="text-right">
        <p className="font-semibold text-foreground">
          -{currency}{amount.toLocaleString()}
        </p>
        <p className={`text-xs ${categoryData.color}`}>
          {categoryData.name}
        </p>
      </div>
    </motion.div>
  );
}