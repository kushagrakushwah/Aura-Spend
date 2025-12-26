import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Wallet, Target, Calendar, Loader2 } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { GlassCard } from "@/components/ui/GlassCard";
import { SpendingChart } from "@/components/charts/SpendingChart";
import { CategoryDonut } from "@/components/charts/CategoryDonut";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { useAuth } from "@/contexts/AuthContext";
import { useExpenseStats, useWeeklySpending, useCategorySpending, useExpenses } from "@/hooks/useExpenses";
import { useTotalBudget } from "@/hooks/useBudgets";

export default function Analytics() {
  const { profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useExpenseStats();
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklySpending();
  const { data: categoryData, isLoading: categoryLoading } = useCategorySpending();
  const { data: totalBudget } = useTotalBudget();
  const { data: allExpenses } = useExpenses();

  const userName = profile?.full_name?.split(" ")[0] || profile?.email?.split("@")[0] || "User";

  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const currentDay = new Date().getDate();
  const dailyAverage = stats ? Math.round(stats.currentMonthTotal / currentDay) : 0;
  const budgetUsed = stats && totalBudget ? Math.round((stats.currentMonthTotal / totalBudget) * 100) : 0;

  const getTopCategory = () => {
    if (!categoryData || categoryData.length === 0) return null;
    return categoryData.reduce((max, curr) => curr.amount > max.amount ? curr : max);
  };

  const topCategory = getTopCategory();

  const getMonthlyComparison = () => {
    if (!allExpenses) return [];
    
    const months: { [key: string]: number } = {};
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    
    allExpenses.forEach((expense) => {
      const date = new Date(expense.date);
      const monthKey = `${monthNames[date.getMonth()]}`;
      months[monthKey] = (months[monthKey] || 0) + Number(expense.amount);
    });

    return Object.entries(months)
      .slice(0, 3)
      .map(([month, amount]) => ({ month, amount }));
  };

  const monthlyComparison = getMonthlyComparison();
  const maxMonthlyAmount = Math.max(...monthlyComparison.map((m) => m.amount), 1);

  const statsData = [
    {
      label: "Total Spent",
      value: stats ? `₹${stats.currentMonthTotal.toLocaleString()}` : "₹0",
      change: stats?.trend || 0,
      icon: Wallet,
      color: "text-primary",
      bg: "bg-primary/20",
    },
    {
      label: "Daily Average",
      value: `₹${dailyAverage.toLocaleString()}`,
      change: 0,
      icon: Calendar,
      color: "text-accent",
      bg: "bg-accent/20",
    },
    {
      label: "Budget Used",
      value: `${budgetUsed}%`,
      change: budgetUsed > 80 ? budgetUsed - 80 : -(80 - budgetUsed),
      icon: Target,
      color: "text-warning",
      bg: "bg-warning/20",
    },
  ];

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <Header userName={userName} avatarUrl={profile?.avatar_url || undefined} />

      <main className="container px-4 py-6 space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="font-display font-bold text-2xl text-foreground mb-4">
            Financial Pulse
          </h2>
          {statsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <GlassCard className="p-4">
                      <div className="flex items-start justify-between">
                        <div className={`p-2 rounded-lg ${stat.bg}`}>
                          <Icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                        {stat.change !== 0 && (
                          <div className={`flex items-center gap-1 text-xs font-medium ${
                            stat.change < 0 ? "text-success" : "text-destructive"
                          }`}>
                            {stat.change < 0 ? (
                              <TrendingDown className="h-3 w-3" />
                            ) : (
                              <TrendingUp className="h-3 w-3" />
                            )}
                            {Math.abs(stat.change)}%
                          </div>
                        )}
                      </div>
                      <div className="mt-3">
                        <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {stats && stats.trend > 15 && (
            <InsightCard
              type="warning"
              title="Spending Alert"
              description={`Your spending is ${stats.trend}% higher than last month. Consider reviewing your expenses.`}
            />
          )}
          {topCategory && (
            <InsightCard
              type="info"
              title="Top Spending Category"
              description={`You've spent the most on ${topCategory.category} this month: ₹${topCategory.amount.toLocaleString()}`}
            />
          )}
          {budgetUsed > 80 && budgetUsed <= 100 && (
            <InsightCard
              type="warning"
              title="Budget Warning"
              description={`You've used ${budgetUsed}% of your monthly budget with ${daysInMonth - currentDay} days remaining.`}
            />
          )}
          {stats && stats.trend < 0 && (
            <InsightCard
              type="tip"
              title="Great Job!"
              description={`Your spending is ${Math.abs(stats.trend)}% lower than last month. Keep it up!`}
            />
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {weeklyLoading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : (
            <SpendingChart data={weeklyData || []} />
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {categoryLoading ? (
            <div className="h-48 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : categoryData && categoryData.length > 0 ? (
            <CategoryDonut data={categoryData} />
          ) : (
            <GlassCard className="p-6 text-center text-muted-foreground">
              No category data available yet. Add some expenses to see the breakdown.
            </GlassCard>
          )}
        </motion.section>

        {monthlyComparison.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard className="p-4">
              <h3 className="font-semibold text-foreground mb-4">Monthly Comparison</h3>
              <div className="space-y-4">
                {monthlyComparison.map((item, index) => {
                  const width = (item.amount / maxMonthlyAmount) * 100;
                  
                  return (
                    <div key={item.month} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.month}</span>
                        <span className="text-foreground font-medium">₹{item.amount.toLocaleString()}</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${width}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                          className={`h-full rounded-full ${
                            index === 0 ? "bg-primary" : "bg-muted-foreground/50"
                          }`}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </motion.section>
        )}
      </main>

      <BottomNav />
    </div>
  );
}
