
import { supabase } from '../lib/supabase';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod?: string;
  tag?: 'Personal' | 'Business';
  imageUrl?: string;
}

export const databaseService = {
  // Upload bill image to storage
  uploadBillImage: async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('bills')
        .upload(fileName, file);

      if (error) {
        console.error("Error uploading image:", error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('bills')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (err) {
      console.error("Upload error:", err);
      return null;
    }
  },

  // Save a new bill
  saveBill: async (bill: Omit<Bill, 'id'>): Promise<{ data: Bill | null, error: any }> => {
    const billToInsert = { ...bill };
    if (billToInsert.imageUrl === undefined) {
      delete billToInsert.imageUrl;
    }
    
    const { data, error } = await supabase
      .from('bills')
      .insert([
        {
          ...billToInsert,
          date: billToInsert.date || new Date().toISOString(),
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error("Error saving bill to Supabase:", error);
      return { data: null, error };
    }
    
    // Dispatch a custom event so other components can listen for updates
    window.dispatchEvent(new Event('billsUpdated'));
    
    return { data: data as Bill, error: null };
  },

  // Get all bills
  getBills: async (): Promise<Bill[]> => {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error("Error fetching bills from Supabase:", error);
      return [];
    }
    
    return data as Bill[];
  },

  // Clear all data (optional utility)
  clearAll: async () => {
    const { error } = await supabase
      .from('bills')
      .delete()
      .neq('id', '0'); // Delete all rows
    
    if (error) {
      console.error("Error clearing bills from Supabase:", error);
    }
    
    window.dispatchEvent(new Event('billsUpdated'));
  }
};
