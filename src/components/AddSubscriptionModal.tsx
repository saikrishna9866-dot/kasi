import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Check, 
  Loader2, 
  Globe, 
  Sparkles, 
  CreditCard, 
  Calendar,
  IndianRupee,
  Type
} from 'lucide-react';
import { databaseService, Subscription } from '../services/databaseService';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

interface AddSubscriptionModalProps {
  onClose: () => void;
  onSave: (sub: Subscription) => void;
}

const COLORS = [
  { name: 'Red', value: 'bg-red-500' },
  { name: 'Emerald', value: 'bg-emerald-500' },
  { name: 'Blue', value: 'bg-blue-500' },
  { name: 'Purple', value: 'bg-purple-500' },
  { name: 'Amber', value: 'bg-amber-500' },
  { name: 'Pink', value: 'bg-pink-500' },
];

const ICONS = [
  { type: 'globe', icon: <Globe className="w-4 h-4" /> },
  { type: 'sparkles', icon: <Sparkles className="w-4 h-4" /> },
];

export default function AddSubscriptionModal({ onClose, onSave }: AddSubscriptionModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Subscription, 'id'>>({
    name: '',
    amount: 0,
    billing_date: '15th',
    icon_type: 'globe',
    color: 'bg-red-500',
    is_active: true
  });

  const handleSave = async () => {
    if (!formData.name || !formData.amount) {
      setError("Name and amount are required.");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError("Please Sign In to save subscriptions.");
        setIsSaving(false);
        return;
      }

      const savedSub = await databaseService.saveSubscription(formData);
      if (savedSub) {
        onSave(savedSub);
        onClose();
      }
    } catch (err: any) {
      console.error("Save Subscription Error:", err);
      setError(err.message || "Failed to save subscription.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-background w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/30">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Add Subscription
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Service Name</label>
            <div className="relative">
              <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
                placeholder="e.g. Netflix"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Monthly Cost (₹)</label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="number"
                  value={formData.amount || ''}
                  onChange={(e) => setFormData({...formData, amount: parseFloat(e.target.value)})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5 block">Billing Day</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text"
                  value={formData.billing_date}
                  onChange={(e) => setFormData({...formData, billing_date: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
                  placeholder="e.g. 15th"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 block">Icon & Style</label>
            <div className="flex gap-4 items-center">
              <div className="flex gap-2">
                {ICONS.map(icon => (
                  <button
                    key={icon.type}
                    onClick={() => setFormData({...formData, icon_type: icon.type as any})}
                    className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                      formData.icon_type === icon.type ? "bg-primary text-white" : "bg-muted hover:bg-muted/80 text-muted-foreground"
                    )}
                  >
                    {icon.icon}
                  </button>
                ))}
              </div>
              <div className="h-6 w-px bg-border mx-2" />
              <div className="flex flex-wrap gap-2">
                {COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => setFormData({...formData, color: color.value})}
                    className={cn(
                      "w-6 h-6 rounded-full transition-all ring-offset-2",
                      color.value,
                      formData.color === color.value ? "ring-2 ring-primary" : "hover:scale-110"
                    )}
                    title={color.name}
                  />
                ))}
              </div>
            </div>
          </div>

          {error && <p className="text-sm text-destructive font-medium">{error}</p>}

          <div className="flex gap-4 pt-4">
            <button 
              onClick={onClose}
              className="flex-1 py-4 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving || !formData.name}
              className="flex-1 py-4 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              Add Service
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
