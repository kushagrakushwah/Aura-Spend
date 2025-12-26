import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Camera, Calendar, DollarSign, Tag, FileText, RefreshCw, Loader2 } from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { categories } from "@/lib/categories";
import { toast } from "@/hooks/use-toast";
import { useCreateExpense } from "@/hooks/useExpenses";

export default function AddExpense() {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to access passed data
  const createExpense = useCreateExpense();
  
  // Check for scanned data passed via navigation state
  const scannedData = location.state as { 
    title?: string; 
    amount?: string; 
    date?: string;
    category?: string; 
  } | null;

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  // Effect to pre-fill form when scanned data is present
  useEffect(() => {
    if (scannedData) {
      setFormData({
        title: scannedData.title || "",
        amount: scannedData.amount || "",
        date: scannedData.date || new Date().toISOString().split("T")[0],
      });
      if (scannedData.category) {
        setSelectedCategory(scannedData.category);
      }
      toast({
        title: "Receipt Scanned",
        description: "Please verify the details below.",
      });
    }
  }, [scannedData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      toast({
        title: "Category required",
        description: "Please select a category for this expense.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || isNaN(Number(formData.amount))) {
       toast({
        title: "Invalid Amount",
        description: "Please enter a valid number.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createExpense.mutateAsync({
        title: formData.title,
        amount: parseFloat(formData.amount),
        category: selectedCategory,
        date: formData.date,
        currency: "INR",
        is_verified: true
      });

      toast({
        title: "Expense Added!",
        description: `₹${Number(formData.amount).toLocaleString()} for ${formData.title}`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container flex items-center gap-4 h-16 px-4">
          <Link to="/dashboard">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-foreground">Add Expense</h1>
        </div>
      </header>

      <main className="container px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Link to="/scan">
              <GlassCard hover className="p-6 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-primary/20">
                  <Camera className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground">Scan Receipt</h3>
                  <p className="text-sm text-muted-foreground">Let AI extract details automatically</p>
                </div>
              </GlassCard>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="title" className="text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Description
              </Label>
              <Input
                id="title"
                placeholder="What did you spend on?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-secondary/40 border-border/40 focus:border-primary/50"
                required
                disabled={createExpense.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="text-muted-foreground flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Amount (₹)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                className="bg-secondary/40 border-border/40 focus:border-primary/50 text-2xl font-semibold"
                required
                step="0.01"
                disabled={createExpense.isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date" className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="bg-secondary/40 border-border/40 focus:border-primary/50"
                required
                disabled={createExpense.isPending}
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <Label className="text-muted-foreground flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Category
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {categories.map((category) => (
                <motion.button
                  key={category.id}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  disabled={createExpense.isPending}
                  className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                    selectedCategory === category.id
                      ? `${category.bgColor} border-2 border-current ${category.color}`
                      : "bg-secondary/40 border border-border/40 hover:border-border"
                  }`}
                >
                  <span className="text-2xl">{category.emoji}</span>
                  <span className="text-xs text-muted-foreground truncate w-full text-center">
                    {category.name.split(" ")[0]}
                  </span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <RefreshCw className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Recurring Expense</p>
                  <p className="text-xs text-muted-foreground">Repeats monthly</p>
                </div>
              </div>
              <Switch 
                checked={isRecurring} 
                onCheckedChange={setIsRecurring}
                disabled={createExpense.isPending} 
              />
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Button
              type="submit"
              size="lg"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              disabled={createExpense.isPending}
            >
              {createExpense.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Expense"
              )}
            </Button>
          </motion.div>
        </form>
      </main>

      <BottomNav />
    </div>
  );
}