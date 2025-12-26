import { motion } from "framer-motion";
import { 
  User, Settings, Download, CreditCard, Shield, 
  HelpCircle, LogOut, ChevronRight, Moon
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { useExpenses } from "@/hooks/useExpenses";
import { toast } from "@/hooks/use-toast";

const menuItems = [
  { icon: User, label: "Edit Profile", path: "/profile/edit" },
  { icon: CreditCard, label: "Payment Methods", path: "/profile/payments" },
  { icon: Download, label: "Export Data", path: "/export" },
  { icon: Shield, label: "Privacy & Security", path: "/profile/privacy" },
  { icon: HelpCircle, label: "Help & Support", path: "/help" },
];

export default function Profile() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const { data: expenses } = useExpenses();

  const totalTracked = (expenses || []).reduce((sum, e) => sum + Number(e.amount), 0);
  const expenseCount = (expenses || []).length;

  const firstExpenseDate = expenses && expenses.length > 0
    ? new Date(expenses[expenses.length - 1].date)
    : null;
  const monthsTracking = firstExpenseDate
    ? Math.max(1, Math.ceil((new Date().getTime() - firstExpenseDate.getTime()) / (1000 * 60 * 60 * 24 * 30)))
    : 0;

  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}K`;
    }
    return `₹${amount.toLocaleString()}`;
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    navigate("/");
  };

  const userName = profile?.full_name || profile?.email?.split("@")[0] || "User";
  const userEmail = profile?.email || "";
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container flex items-center justify-between h-16 px-4">
          <h1 className="font-semibold text-foreground">Profile</h1>
          <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-20 w-20 border-2 border-primary/30">
                <AvatarImage 
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} 
                  alt={userName} 
                />
                <AvatarFallback className="bg-primary/20 text-primary text-2xl">{initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="font-display font-bold text-xl text-foreground">{userName}</h2>
                <p className="text-muted-foreground">{userEmail}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                    {profile?.preferred_currency || "INR"}
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-foreground">{expenseCount}</p>
                <p className="text-xs text-muted-foreground">Expenses</p>
              </div>
              <div className="border-x border-border/40">
                <p className="text-2xl font-bold text-foreground">{formatAmount(totalTracked)}</p>
                <p className="text-xs text-muted-foreground">Total Tracked</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{monthsTracking}</p>
                <p className="text-xs text-muted-foreground">Months</p>
              </div>
            </div>
          </GlassCard>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="divide-y divide-border/40">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent/20">
                  <Moon className="h-5 w-5 text-accent" />
                </div>
                <span className="text-foreground">Dark Mode</span>
              </div>
              <Switch defaultChecked />
            </div>

            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="flex items-center justify-between p-4 hover:bg-secondary/40 transition-colors w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="text-foreground">{item.label}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </motion.button>
              );
            })}
          </GlassCard>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <button 
            onClick={handleSignOut}
            className="w-full p-4 rounded-xl bg-destructive/10 hover:bg-destructive/20 transition-colors flex items-center justify-center gap-2 text-destructive"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </motion.section>
      </main>

      <BottomNav />
    </div>
  );
}
