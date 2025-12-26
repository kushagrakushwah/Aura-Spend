import { motion } from "framer-motion";
import { ChevronRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { BalanceCard } from "@/components/dashboard/BalanceCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ExpenseItem } from "@/components/dashboard/ExpenseItem";
import { SpendingChart } from "@/components/charts/SpendingChart";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { useAuth } from "@/contexts/AuthContext";
import { useRecentExpenses, useExpenseStats, useWeeklySpending } from "@/hooks/useExpenses";
import { useTotalBudget } from "@/hooks/useBudgets";

export default function Dashboard() {
  const { profile } = useAuth();
  const { data: recentExpenses, isLoading: expensesLoading } = useRecentExpenses(5);
  const { data: stats } = useExpenseStats();
  const { data: weeklyData, isLoading: weeklyLoading } = useWeeklySpending();
  const { data: totalBudget } = useTotalBudget();

  const userName = profile?.full_name?.split(" ")[0] || profile?.email?.split("@")[0] || "User";

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <Header userName={userName} avatarUrl={profile?.avatar_url || undefined} />
      
      <main className="container px-4 py-6 space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <BalanceCard
            totalSpent={stats?.currentMonthTotal || 0}
            monthlyBudget={totalBudget || 60000}
            trend={stats?.trend || 0}
          />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <QuickActions />
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {stats && stats.trend < 0 ? (
            <InsightCard
              type="tip"
              title="You're saving more!"
              description={`Your spending is ${Math.abs(stats.trend)}% lower than last month. Keep up the great work!`}
            />
          ) : stats && stats.trend > 10 ? (
            <InsightCard
              type="warning"
              title="Spending Alert"
              description={`Your spending is ${stats.trend}% higher than last month. Consider reviewing your expenses.`}
            />
          ) : (
            <InsightCard
              type="info"
              title="Consistent Spending"
              description="Your spending this month is similar to last month."
            />
          )}
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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
          transition={{ delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground text-lg">Recent Expenses</h2>
            <Link 
              to="/expenses" 
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              View All
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
          {expensesLoading ? (
            <div className="h-32 flex items-center justify-center">
              <Loader2 className="h-6 w-6 text-primary animate-spin" />
            </div>
          ) : recentExpenses && recentExpenses.length > 0 ? (
            <div className="space-y-3">
              {recentExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                >
                  <ExpenseItem
                    id={expense.id}
                    title={expense.title}
                    amount={Number(expense.amount)}
                    category={expense.category}
                    date={new Date(expense.date)}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No expenses yet. Add your first expense!</p>
              <Link to="/add-expense" className="text-primary hover:underline mt-2 inline-block">
                Add Expense →
              </Link>
            </div>
          )}
        </motion.section>
      </main>

      <BottomNav />
    </div>
  );
}
