import { motion } from "framer-motion";
import { Camera, FileText, CreditCard, Target } from "lucide-react";
import { Link } from "react-router-dom";

const actions = [
  { 
    icon: Camera, 
    label: "Scan Receipt", 
    path: "/scan",
    gradient: "from-primary/20 to-primary/5",
    iconColor: "text-primary"
  },
  { 
    icon: FileText, 
    label: "Add Manual", 
    path: "/add-expense",
    gradient: "from-accent/20 to-accent/5",
    iconColor: "text-accent"
  },
  { 
    icon: Target, 
    label: "Set Budget", 
    path: "/budgets",
    gradient: "from-warning/20 to-warning/5",
    iconColor: "text-warning"
  },
  { 
    icon: CreditCard, 
    label: "Export", 
    path: "/export",
    gradient: "from-chart-4/20 to-chart-4/5",
    iconColor: "text-chart-4"
  },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={action.path}
              className="flex flex-col items-center gap-2 p-3 rounded-xl bg-secondary/40 hover:bg-secondary/60 transition-all border border-transparent hover:border-border/40 group"
            >
              <div className={`p-3 rounded-xl bg-gradient-to-br ${action.gradient} group-hover:scale-110 transition-transform`}>
                <Icon className={`h-5 w-5 ${action.iconColor}`} />
              </div>
              <span className="text-xs text-muted-foreground text-center group-hover:text-foreground transition-colors">
                {action.label}
              </span>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}