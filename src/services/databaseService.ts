
import { supabase } from '../lib/supabase';

export interface Bill {
  id: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  paymentMethod?: string;
  tag?: 'Personal' | 'Business';
}

export const databaseService = {
  // Save a new bill
  saveBill: async (bill: Omit<Bill, 'id' | 'date'>): Promise<Bill | null> => {
    const { data, error } = await supabase
      .from('bills')
      .insert([
        {
          ...bill,
          date: new Date().toISOString(),
        }
      ])
      .select()
      .single();
    
    if (error) {
      console.error("Error saving bill to Supabase:", error);
      return null;
    }
    
    // Dispatch a custom event so other components can listen for updates
    window.dispatchEvent(new Event('billsUpdated'));
    
    return data as Bill;
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
