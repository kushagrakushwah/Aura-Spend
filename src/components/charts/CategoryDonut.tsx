import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { GlassCard } from "@/components/ui/GlassCard";
import { categories as categoryList } from "@/lib/categories";

interface CategoryData {
  category: string;
  amount: number;
}

interface CategoryDonutProps {
  data: CategoryData[];
  currency?: string;
}

const COLORS = [
  "hsl(25, 95%, 53%)",
  "hsl(217, 91%, 60%)",
  "hsl(330, 81%, 60%)",
  "hsl(271, 91%, 65%)",
  "hsl(47, 96%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(186, 94%, 42%)",
  "hsl(84, 81%, 44%)",
];

export function CategoryDonut({ data, currency = "₹" }: CategoryDonutProps) {
  const chartData = data.map((item, index) => {
    const cat = categoryList.find(c => c.id === item.category);
    return {
      name: cat?.name || item.category,
      value: item.amount,
      emoji: cat?.emoji || "📦",
      color: COLORS[index % COLORS.length],
    };
  });

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground">By Category</h3>
        <span className="text-xs text-muted-foreground">This month</span>
      </div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="h-48"
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "0.5rem",
              }}
              formatter={(value: number) => [`${currency}${value.toLocaleString()}`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </motion.div>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {chartData.slice(0, 4).map((item) => (
          <div key={item.name} className="flex items-center gap-2 text-sm">
            <span className="text-lg">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-foreground truncate">{item.name}</p>
              <p className="text-muted-foreground text-xs">
                {((item.value / total) * 100).toFixed(0)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}