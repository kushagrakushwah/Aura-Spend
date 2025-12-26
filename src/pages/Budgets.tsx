import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Edit2, Trash2, Loader2, X, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { categories, getCategoryById } from "@/lib/categories";
import { useBudgetWithSpending, useCreateBudget, useUpdateBudget, useDeleteBudget } from "@/hooks/useBudgets";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function getCurrentMonthYear() {
  const now = new Date();
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[now.getMonth()]} ${now.getFullYear()}`;
}

export default function Budgets() {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<{ id: string; category: string; limit_amount: number } | null>(null);
  const [newCategory, setNewCategory] = useState("");
  const [newLimit, setNewLimit] = useState("");

  const { data: budgets, isLoading } = useBudgetWithSpending();
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const totalLimit = (budgets || []).reduce((sum, b) => sum + Number(b.limit_amount), 0);
  const totalSpent = (budgets || []).reduce((sum, b) => sum + (b.spent || 0), 0);

  const handleAddBudget = async () => {
    if (!newCategory || !newLimit) {
      toast({
        title: "Missing Fields",
        description: "Please select a category and enter a limit.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createBudget.mutateAsync({
        category: newCategory,
        limit_amount: parseFloat(newLimit),
        month_year: getCurrentMonthYear(),
      });
      toast({
        title: "Budget Created",
        description: `Budget for ${getCategoryById(newCategory).name} has been set.`,
      });
      setShowAddDialog(false);
      setNewCategory("");
      setNewLimit("");
    } catch {
      toast({
        title: "Error",
        description: "Failed to create budget. It may already exist for this category.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateBudget = async () => {
    if (!editingBudget) return;

    try {
      await updateBudget.mutateAsync({
        id: editingBudget.id,
        limit_amount: editingBudget.limit_amount,
      });
      toast({
        title: "Budget Updated",
        description: "Your budget limit has been updated.",
      });
      setEditingBudget(null);
    } catch {
      toast({
        title: "Error",
        description: "Failed to update budget.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await deleteBudget.mutateAsync(id);
      toast({
        title: "Budget Deleted",
        description: "The budget has been removed.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete budget.",
        variant: "destructive",
      });
    }
  };

  const existingCategories = (budgets || []).map((b) => b.category);
  const availableCategories = categories.filter((c) => !existingCategories.includes(c.id));

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container flex items-center gap-4 h-16 px-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-foreground flex-1">Budgets</h1>
          <Button 
            size="sm" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => setShowAddDialog(true)}
            disabled={availableCategories.length === 0}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6" glow={totalSpent <= totalLimit ? "primary" : undefined}>
            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">Total Monthly Budget - {getCurrentMonthYear()}</p>
              <p className="text-3xl font-display font-bold text-foreground">
                ₹{totalSpent.toLocaleString()} <span className="text-muted-foreground text-lg">/ ₹{totalLimit.toLocaleString()}</span>
              </p>
            </div>
            <div className="h-3 bg-secondary rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((totalSpent / (totalLimit || 1)) * 100, 100)}%` }}
                transition={{ duration: 1 }}
                className={`h-full rounded-full ${
                  totalSpent / (totalLimit || 1) > 0.9 
                    ? "bg-destructive" 
                    : totalSpent / (totalLimit || 1) > 0.7 
                      ? "bg-warning" 
                      : "bg-primary"
                }`}
              />
            </div>
            <p className="text-center text-sm text-muted-foreground mt-2">
              {totalLimit > 0 ? ((totalSpent / totalLimit) * 100).toFixed(0) : 0}% used
            </p>
          </GlassCard>
        </motion.section>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        ) : (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <h2 className="font-semibold text-foreground">Category Budgets</h2>
            
            {(budgets || []).length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>No budgets set yet.</p>
                <Button
                  variant="link"
                  className="text-primary mt-2"
                  onClick={() => setShowAddDialog(true)}
                >
                  Create your first budget →
                </Button>
              </div>
            ) : (
              (budgets || []).map((budget, index) => {
                const category = getCategoryById(budget.category);
                const spent = budget.spent || 0;
                const percentage = (spent / Number(budget.limit_amount)) * 100;
                const isOverBudget = percentage > 100;
                const isEditing = editingBudget?.id === budget.id;
                
                return (
                  <motion.div
                    key={budget.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + index * 0.05 }}
                  >
                    <GlassCard className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${category.bgColor}`}>
                            <span className="text-xl">{category.emoji}</span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{category.name}</p>
                            {isEditing ? (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-sm text-muted-foreground">₹{spent.toLocaleString()} /</span>
                                <Input
                                  type="number"
                                  value={editingBudget.limit_amount}
                                  onChange={(e) => setEditingBudget({ ...editingBudget, limit_amount: parseFloat(e.target.value) || 0 })}
                                  className="w-24 h-7 text-sm bg-secondary/40 border-border/40"
                                />
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">
                                ₹{spent.toLocaleString()} / ₹{Number(budget.limit_amount).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          {isEditing ? (
                            <>
                              <button 
                                onClick={handleUpdateBudget}
                                className="p-2 rounded-lg hover:bg-success/20 transition-colors"
                              >
                                <Check className="h-4 w-4 text-success" />
                              </button>
                              <button 
                                onClick={() => setEditingBudget(null)}
                                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                              >
                                <X className="h-4 w-4 text-muted-foreground" />
                              </button>
                            </>
                          ) : (
                            <>
                              <button 
                                onClick={() => setEditingBudget({ id: budget.id, category: budget.category, limit_amount: Number(budget.limit_amount) })}
                                className="p-2 rounded-lg hover:bg-secondary transition-colors"
                              >
                                <Edit2 className="h-4 w-4 text-muted-foreground" />
                              </button>
                              <button 
                                onClick={() => handleDeleteBudget(budget.id)}
                                className="p-2 rounded-lg hover:bg-destructive/20 transition-colors"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(percentage, 100)}%` }}
                            transition={{ duration: 0.8, delay: 0.2 + index * 0.05 }}
                            className={`h-full rounded-full ${
                              isOverBudget 
                                ? "bg-destructive" 
                                : percentage > 80 
                                  ? "bg-warning" 
                                  : "bg-primary"
                            }`}
                          />
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className={isOverBudget ? "text-destructive" : "text-muted-foreground"}>
                            {percentage.toFixed(0)}%
                          </span>
                          {isOverBudget && (
                            <span className="text-destructive font-medium">
                              Over by ₹{(spent - Number(budget.limit_amount)).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })
            )}
          </motion.section>
        )}
      </main>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="bg-background border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">Add Budget</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger className="bg-secondary/40 border-border/40">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      <span className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span>{cat.name}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Monthly Limit (₹)</Label>
              <Input
                type="number"
                placeholder="10000"
                value={newLimit}
                onChange={(e) => setNewLimit(e.target.value)}
                className="bg-secondary/40 border-border/40"
              />
            </div>
            <Button
              onClick={handleAddBudget}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={createBudget.isPending}
            >
              {createBudget.isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                "Create Budget"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
}
