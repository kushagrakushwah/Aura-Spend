import { motion, HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
  glow?: "primary" | "accent" | "none";
}

export function GlassCard({ 
  className, 
  hover = false, 
  glow = "none",
  children, 
  ...props 
}: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-xl bg-card/60 backdrop-blur-xl border border-border/40",
        hover && "transition-all duration-300 hover:bg-card/80 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 cursor-pointer",
        glow === "primary" && "glow-primary",
        glow === "accent" && "glow-accent",
        className
      )}
      whileHover={hover ? { scale: 1.01 } : undefined}
      whileTap={hover ? { scale: 0.99 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}