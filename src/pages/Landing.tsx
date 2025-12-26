import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight, Scan, BarChart3, Shield, Zap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/GlassCard";

const features = [
  {
    icon: Scan,
    title: "AI-Powered Scanning",
    description: "Snap a photo of any receipt and let AI extract all the details instantly.",
    gradient: "from-primary to-primary/50",
  },
  {
    icon: BarChart3,
    title: "Smart Analytics",
    description: "Visualize your spending patterns with beautiful, interactive charts.",
    gradient: "from-accent to-accent/50",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your financial data is encrypted and never shared with third parties.",
    gradient: "from-success to-success/50",
  },
  {
    icon: Zap,
    title: "Instant Insights",
    description: "Get AI-generated tips to help you save more and spend smarter.",
    gradient: "from-warning to-warning/50",
  },
];

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        <header className="flex items-center justify-between mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="p-2 rounded-xl bg-primary/20 glow-primary">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">Aura Spend</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Link to="/dashboard">
              <Button variant="outline" className="border-border/50 hover:border-primary/50 hover:bg-primary/10">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </header>

        <section className="text-center max-w-3xl mx-auto mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm text-primary font-medium">AI-Powered Expense Tracking</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-display font-bold mb-6 leading-tight"
          >
            Take Control of Your{" "}
            <span className="gradient-text">Financial Future</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto"
          >
            Scan receipts, track expenses, and gain insights with the power of AI. 
            The smartest way to manage your money.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/dashboard">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 glow-primary">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-border/50 hover:border-primary/50 hover:bg-primary/10">
              Watch Demo
            </Button>
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-20"
        >
          <GlassCard className="p-6 md:p-8 max-w-4xl mx-auto">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-secondary to-secondary/50 flex items-center justify-center overflow-hidden">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 animate-pulse-glow">
                  <Scan className="h-10 w-10 text-primary" />
                </div>
                <p className="text-muted-foreground">Interactive Dashboard Preview</p>
              </div>
            </div>
          </GlassCard>
        </motion.section>

        <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
              >
                <GlassCard hover className="p-6 h-full">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </GlassCard>
              </motion.div>
            );
          })}
        </section>

        <footer className="text-center py-8 border-t border-border/40">
          <p className="text-sm text-muted-foreground">
            © 2024 Aura Spend. Built for smarter spending.
          </p>
        </footer>
      </div>
    </div>
  );
}