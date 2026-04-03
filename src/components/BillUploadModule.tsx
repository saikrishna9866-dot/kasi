import React, { useState, useCallback, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  X, 
  Check, 
  AlertCircle, 
  Loader2, 
  FileText, 
  ScanLine, 
  Calendar, 
  Tag, 
  CreditCard, 
  Store,
  IndianRupee
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { databaseService, Bill } from '../services/databaseService';
import { cn } from '../lib/utils';

interface BillUploadModuleProps {
  onClose: () => void;
  onSave: (bill: Bill) => void;
}

const CATEGORIES = ['Food', 'Travel', 'Shopping', 'Bills', 'Income', 'Others'];
const PAYMENT_METHODS = ['UPI', 'Card', 'Cash', 'Net Banking'];

export default function BillUploadModule({ onClose, onSave }: BillUploadModuleProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<Bill>>({});
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);
        processBill(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
      'application/pdf': ['.pdf']
    },
    multiple: false
  } as any);

  const processBill = async (base64Image: string) => {
    setIsProcessing(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const base64Data = base64Image.split(',')[1];

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            parts: [
              { text: "Extract the following details from this bill in JSON format: merchantName, amount (number), date (ISO format), category (one of: Food, Travel, Shopping, Bills, Income, Others), paymentMethod (one of: UPI, Card, Cash, Net Banking). If you can't find a field, leave it null." },
              { inlineData: { data: base64Data, mimeType: "image/jpeg" } }
            ]
          }
        ],
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      const newExtractedData: Partial<Bill> = {
        name: result.merchantName || '',
        amount: result.amount || 0,
        date: result.date || new Date().toISOString().split('T')[0],
        category: result.category || 'Others',
        paymentMethod: result.paymentMethod || 'UPI',
        tag: 'Personal'
      };

      setExtractedData(newExtractedData);

      // Check for duplicates
      const existingBills = await databaseService.getBills();
      const duplicate = existingBills.find(b => 
        b.name.toLowerCase() === newExtractedData.name?.toLowerCase() && 
        b.amount === newExtractedData.amount &&
        b.date === newExtractedData.date
      );
      setIsDuplicate(!!duplicate);

    } catch (err) {
      console.error("AI Processing Error:", err);
      setError("Failed to extract data. Please enter manually.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = async () => {
    if (!extractedData.name || !extractedData.amount) {
      setError("Merchant name and amount are required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    let imageUrl = undefined;
    if (file) {
      const uploadedUrl = await databaseService.uploadBillImage(file);
      if (uploadedUrl) {
        imageUrl = uploadedUrl;
      }
    }

    const billToSave = {
      name: extractedData.name,
      amount: extractedData.amount,
      category: extractedData.category || 'Others',
      date: extractedData.date || new Date().toISOString(),
      paymentMethod: extractedData.paymentMethod,
      tag: extractedData.tag,
      imageUrl: imageUrl
    };

    const { data: savedBill, error: saveError } = await databaseService.saveBill(billToSave as any);
    setIsSaving(false);
    
    if (savedBill) {
      setIsSaved(true);
      setTimeout(() => {
        onSave(savedBill);
        onClose();
      }, 1500);
    } else {
      console.error("Save Error:", saveError);
      setError(`Failed to save bill: ${saveError?.message || 'Unknown error'}`);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-background w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Left: Upload/Preview */}
        <div className="w-full md:w-1/2 bg-muted/30 p-6 flex flex-col border-b md:border-b-0 md:border-r border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ScanLine className="w-5 h-5 text-primary" />
              Upload Bill
            </h2>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!preview ? (
            <div 
              {...getRootProps()} 
              className={cn(
                "flex-1 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer",
                isDragActive ? "border-primary bg-primary/5 scale-[0.98]" : "border-border hover:border-primary/50 hover:bg-muted/50"
              )}
            >
              <input {...getInputProps()} />
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <p className="text-lg font-medium mb-1">Drop your bill here</p>
              <p className="text-sm text-muted-foreground text-center">Support JPG, PNG, PDF (Max 5MB)</p>
            </div>
          ) : (
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-black group">
              <img src={preview} alt="Bill Preview" className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button 
                  onClick={() => { setPreview(null); setFile(null); setExtractedData({}); }}
                  className="bg-white text-black px-4 py-2 rounded-full font-medium flex items-center gap-2"
                >
                  <X className="w-4 h-4" /> Change Image
                </button>
              </div>
              
              {isProcessing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                  <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                  <p className="font-medium text-lg">AI is analyzing your bill...</p>
                  <p className="text-sm text-muted-foreground">Extracting merchant, amount, and category</p>
                  
                  {/* Skeleton overlays */}
                  <div className="mt-8 w-full space-y-3">
                    <div className="h-4 bg-muted rounded-full w-3/4 animate-pulse mx-auto" />
                    <div className="h-4 bg-muted rounded-full w-1/2 animate-pulse mx-auto" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right: Form */}
        <div className="w-full md:w-1/2 p-8 overflow-y-auto">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Bill Details
          </h3>

          {isDuplicate && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-sm">Similar transaction detected</p>
                <p className="text-xs opacity-80">We found a bill with the same merchant and amount in your history.</p>
              </div>
            </motion.div>
          )}

          <div className="space-y-5">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Merchant Name</label>
              <div className="relative">
                <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text"
                  value={extractedData.name || ''}
                  onChange={(e) => setExtractedData({...extractedData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                  placeholder="e.g. Starbucks"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Amount (₹)</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="number"
                    value={extractedData.amount || ''}
                    onChange={(e) => setExtractedData({...extractedData, amount: parseFloat(e.target.value)})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input 
                    type="date"
                    value={extractedData.date || ''}
                    onChange={(e) => setExtractedData({...extractedData, date: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Category</label>
                <select 
                  value={extractedData.category || 'Others'}
                  onChange={(e) => setExtractedData({...extractedData, category: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none appearance-none"
                >
                  {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Payment Method</label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <select 
                    value={extractedData.paymentMethod || 'UPI'}
                    onChange={(e) => setExtractedData({...extractedData, paymentMethod: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none appearance-none"
                  >
                    {PAYMENT_METHODS.map(pm => <option key={pm} value={pm}>{pm}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Tagging</label>
              <div className="flex gap-3">
                {['Personal', 'Business'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setExtractedData({...extractedData, tag: t as any})}
                    className={cn(
                      "flex-1 py-3 rounded-xl border transition-all flex items-center justify-center gap-2 font-medium",
                      extractedData.tag === t 
                        ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                        : "bg-muted/50 border-border hover:border-primary/50"
                    )}
                  >
                    <Tag className="w-4 h-4" />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-destructive font-medium">{error}</p>}

          <div className="mt-8 flex gap-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isProcessing || isSaving || isSaved || !extractedData.name}
              className={cn(
                "flex-1 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
                isSaved 
                  ? "bg-green-500 text-white shadow-lg shadow-green-500/30 hover:bg-green-600" 
                  : "bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              {isSaved ? (
                <>
                  <Check className="w-5 h-5" />
                  Saved Successfully
                </>
              ) : isSaving ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Save Expense
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
