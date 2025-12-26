import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Upload, Camera, Loader2, Check, AlertCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/GlassCard";
import { BottomNav } from "@/components/layout/BottomNav";
import { categories } from "@/lib/categories";
import { toast } from "@/hooks/use-toast";
import { scanReceipt, terminateWorker } from "@/utils/tesseractScan";
import { useCreateExpense } from "@/hooks/useExpenses";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type ScanState = "idle" | "uploading" | "scanning" | "review";

interface ExtractedData {
  title: string;
  amount: string;
  category: string;
  date: string;
  confidence: {
    title: number;
    amount: number;
    date: number;
  };
}

export default function ScanReceipt() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const createExpense = useCreateExpense();
  const [scanState, setScanState] = useState<ScanState>("idle");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onload = async () => {
        const imageData = reader.result as string;
        setUploadedImage(imageData);
        setScanState("uploading");
        
        try {
          setScanState("scanning");
          setScanProgress(0);
          
          const result = await scanReceipt(imageData, (progress) => {
            setScanProgress(progress);
          });
          
          const guessedCategory = guessCategory(result.title.toLowerCase());
          
          setExtractedData({
            title: result.title,
            amount: result.amount || "",
            category: guessedCategory,
            date: result.date,
            confidence: {
              title: result.confidence.title,
              amount: result.confidence.amount,
              date: result.confidence.date,
            },
          });
          setScanState("review");
        } catch (error) {
          console.error("Scan error:", error);
          toast({
            title: "Scan Failed",
            description: "Could not extract text from the image. Please try again.",
            variant: "destructive",
          });
          setScanState("idle");
        }
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const guessCategory = (title: string): string => {
    const categoryKeywords: { [key: string]: string[] } = {
      food: ["restaurant", "cafe", "coffee", "starbucks", "mcdonalds", "pizza", "food", "eat", "dine"],
      transport: ["uber", "ola", "taxi", "metro", "bus", "fuel", "petrol", "parking"],
      shopping: ["amazon", "flipkart", "mall", "store", "shop", "market"],
      entertainment: ["movie", "cinema", "netflix", "spotify", "game"],
      bills: ["electricity", "water", "gas", "internet", "phone", "mobile", "bill"],
      health: ["pharmacy", "hospital", "doctor", "medicine", "medical", "gym"],
      groceries: ["grocery", "vegetables", "fruits", "supermarket", "bigbasket"],
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
      if (keywords.some((keyword) => title.includes(keyword))) {
        return category;
      }
    }
    return "other";
  };

  const uploadReceiptToStorage = async (file: File): Promise<string | null> => {
    if (!user) return null;
    
    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from("receipts")
      .upload(fileName, file);
    
    if (error) {
      console.error("Upload error:", error);
      return null;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from("receipts")
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleConfirm = async () => {
    if (!extractedData || !user) return;
    
    try {
      let receiptUrl: string | null = null;
      
      if (uploadedFile) {
        receiptUrl = await uploadReceiptToStorage(uploadedFile);
      }
      
      await createExpense.mutateAsync({
        title: extractedData.title,
        amount: parseFloat(extractedData.amount) || 0,
        category: extractedData.category,
        date: extractedData.date,
        receipt_url: receiptUrl,
        is_verified: true,
      });
      
      toast({
        title: "Expense Added!",
        description: `₹${Number(extractedData.amount).toLocaleString()} for ${extractedData.title}`,
      });
      
      await terminateWorker();
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save expense. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setScanState("idle");
    setUploadedImage(null);
    setUploadedFile(null);
    setExtractedData(null);
    setScanProgress(0);
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="container flex items-center gap-4 h-16 px-4">
          <Link to="/add-expense">
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-semibold text-foreground">Scan Receipt</h1>
        </div>
      </header>

      <main className="container px-4 py-6">
        <AnimatePresence mode="wait">
          {scanState === "idle" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <GlassCard className="p-8">
                <label
                  htmlFor="receipt-upload"
                  className="flex flex-col items-center gap-4 cursor-pointer"
                >
                  <div className="p-6 rounded-full bg-primary/20 group-hover:bg-primary/30 transition-colors">
                    <Upload className="h-12 w-12 text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-foreground">Upload Receipt Image</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Drag & drop or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Using Tesseract.js for local OCR processing
                    </p>
                  </div>
                  <input
                    id="receipt-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </GlassCard>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border/40" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-background px-4 text-sm text-muted-foreground">or</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="lg"
                className="w-full border-border/40 hover:border-primary/50"
                onClick={() => document.getElementById("receipt-upload")?.click()}
              >
                <Camera className="mr-2 h-5 w-5" />
                Take Photo
              </Button>
            </motion.div>
          )}

          {(scanState === "uploading" || scanState === "scanning") && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <GlassCard className="p-6 relative overflow-hidden">
                {uploadedImage && (
                  <img
                    src={uploadedImage}
                    alt="Receipt"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                )}
                
                {scanState === "scanning" && (
                  <motion.div
                    initial={{ top: 0 }}
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-1 bg-primary shadow-lg shadow-primary/50"
                  />
                )}
              </GlassCard>

              <div className="text-center space-y-3">
                <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto" />
                <p className="text-foreground font-medium">
                  {scanState === "uploading" ? "Preparing image..." : "Extracting text with OCR..."}
                </p>
                {scanState === "scanning" && (
                  <div className="w-full max-w-xs mx-auto">
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${scanProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{scanProgress}% complete</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {scanState === "review" && extractedData && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <GlassCard className="p-4">
                  {uploadedImage && (
                    <img
                      src={uploadedImage}
                      alt="Receipt"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  )}
                </GlassCard>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="title" className="text-muted-foreground">Description</Label>
                      <ConfidenceBadge value={extractedData.confidence.title} />
                    </div>
                    <Input
                      id="title"
                      value={extractedData.title}
                      onChange={(e) => setExtractedData({ ...extractedData, title: e.target.value })}
                      className="bg-secondary/40 border-border/40"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="amount" className="text-muted-foreground">Amount (₹)</Label>
                      <ConfidenceBadge value={extractedData.confidence.amount} />
                    </div>
                    <Input
                      id="amount"
                      value={extractedData.amount}
                      onChange={(e) => setExtractedData({ ...extractedData, amount: e.target.value })}
                      className="bg-secondary/40 border-border/40 text-xl font-semibold"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground">Category</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {categories.slice(0, 8).map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setExtractedData({ ...extractedData, category: category.id })}
                          className={`p-2 rounded-lg flex flex-col items-center gap-1 transition-all ${
                            extractedData.category === category.id
                              ? `${category.bgColor} border-2 border-current ${category.color}`
                              : "bg-secondary/40 border border-border/40"
                          }`}
                        >
                          <span className="text-xl">{category.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="date" className="text-muted-foreground">Date</Label>
                      <ConfidenceBadge value={extractedData.confidence.date} />
                    </div>
                    <Input
                      id="date"
                      type="date"
                      value={extractedData.date}
                      onChange={(e) => setExtractedData({ ...extractedData, date: e.target.value })}
                      className="bg-secondary/40 border-border/40"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1 border-border/40"
                  onClick={handleReset}
                >
                  Scan Again
                </Button>
                <Button
                  size="lg"
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={handleConfirm}
                  disabled={createExpense.isPending}
                >
                  {createExpense.isPending ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <Check className="mr-2 h-5 w-5" />
                      Confirm
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <BottomNav />
    </div>
  );
}

function ConfidenceBadge({ value }: { value: number }) {
  const isLow = value < 60;
  
  return (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
      isLow 
        ? "bg-warning/20 text-warning" 
        : "bg-success/20 text-success"
    }`}>
      {isLow ? <AlertCircle className="h-3 w-3" /> : <Check className="h-3 w-3" />}
      {value}%
    </div>
  );
}
