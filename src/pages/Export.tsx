import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Download, FileSpreadsheet, FileText, Calendar, Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { toast } from "@/hooks/use-toast";

type ExportFormat = "csv" | "pdf";

export default function Export() {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    end: new Date().toISOString().split("T")[0],
  });
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsExporting(false);
    toast({
      title: "Export Complete!",
      description: `Your ${format.toUpperCase()} file is ready for download.`,
    });
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
          <h1 className="font-semibold text-foreground">Export Data</h1>
        </div>
      </header>

      <main className="container px-4 py-6 space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-primary/20">
                <Download className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">Export Center</h2>
                <p className="text-sm text-muted-foreground">
                  Download your expense data for records or accounting
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <Label className="text-muted-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Range
          </Label>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start" className="text-xs text-muted-foreground">From</Label>
              <Input
                id="start"
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="bg-secondary/40 border-border/40"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="end" className="text-xs text-muted-foreground">To</Label>
              <Input
                id="end"
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="bg-secondary/40 border-border/40"
              />
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <Label className="text-muted-foreground">Export Format</Label>
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormat("csv")}
              className={`p-4 rounded-xl border transition-all ${
                format === "csv"
                  ? "bg-primary/20 border-primary/50"
                  : "bg-secondary/40 border-border/40 hover:border-border"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-lg ${format === "csv" ? "bg-primary/30" : "bg-secondary"}`}>
                  <FileSpreadsheet className={`h-6 w-6 ${format === "csv" ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="text-center">
                  <p className={`font-medium ${format === "csv" ? "text-primary" : "text-foreground"}`}>CSV</p>
                  <p className="text-xs text-muted-foreground">For Excel/Sheets</p>
                </div>
                {format === "csv" && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-primary"
                  >
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </motion.div>
                )}
              </div>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setFormat("pdf")}
              className={`p-4 rounded-xl border transition-all ${
                format === "pdf"
                  ? "bg-primary/20 border-primary/50"
                  : "bg-secondary/40 border-border/40 hover:border-border"
              }`}
            >
              <div className="flex flex-col items-center gap-3">
                <div className={`p-3 rounded-lg ${format === "pdf" ? "bg-primary/30" : "bg-secondary"}`}>
                  <FileText className={`h-6 w-6 ${format === "pdf" ? "text-primary" : "text-muted-foreground"}`} />
                </div>
                <div className="text-center">
                  <p className={`font-medium ${format === "pdf" ? "text-primary" : "text-foreground"}`}>PDF</p>
                  <p className="text-xs text-muted-foreground">Formatted Report</p>
                </div>
              </div>
            </motion.button>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="p-4">
            <h3 className="font-medium text-foreground mb-3">Export Preview</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date Range</span>
                <span className="text-foreground">{dateRange.start} to {dateRange.end}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estimated Records</span>
                <span className="text-foreground">127 expenses</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Amount</span>
                <span className="text-foreground">₹45,670</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Format</span>
                <span className="text-foreground">{format.toUpperCase()}</span>
              </div>
            </div>
          </GlassCard>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Download className="h-5 w-5" />
                </motion.div>
                Preparing Export...
              </>
            ) : (
              <>
                <Download className="mr-2 h-5 w-5" />
                Export {format.toUpperCase()}
              </>
            )}
          </Button>
        </motion.section>
      </main>

      <BottomNav />
    </div>
  );
}