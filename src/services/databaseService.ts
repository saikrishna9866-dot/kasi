
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  merchant: string;
  date: string;
  payment_method?: string;
  tags?: string[];
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  created_at: string;
}

export interface Insight {
  id: string;
  user_id: string;
  message: string;
  type: 'warning' | 'suggestion';
  priority: 'low' | 'medium' | 'high';
  impact_value: number;
  confidence_score: number;
  created_at: string;
}

const API_BASE = '/api';

export const databaseService = {
  // Transactions
  addTransaction: async (transaction: Omit<Transaction, 'id' | 'created_at'>): Promise<Transaction | null> => {
    const response = await fetch(`${API_BASE}/add-expense`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) return null;
    const data = await response.json();
    window.dispatchEvent(new Event('transactionsUpdated'));
    return data;
  },

  getTransactions: async (userId: string): Promise<Transaction[]> => {
    const response = await fetch(`${API_BASE}/transactions?user_id=${userId}`);
    if (!response.ok) return [];
    return await response.json();
  },

  // OCR Bill
  uploadBill: async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('bill', file);
    const response = await fetch(`${API_BASE}/upload-bill`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) return null;
    return await response.json();
  },

  // Statement
  uploadStatement: async (file: File, userId: string): Promise<any> => {
    const formData = new FormData();
    formData.append('statement', file);
    formData.append('user_id', userId);
    const response = await fetch(`${API_BASE}/upload-statement`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) return null;
    return await response.json();
  },

  // Analytics
  getAnalytics: async (userId: string): Promise<any> => {
    const response = await fetch(`${API_BASE}/analytics?user_id=${userId}`);
    if (!response.ok) return null;
    return await response.json();
  },

  // Goals
  createGoal: async (goal: Omit<Goal, 'id' | 'created_at'>): Promise<Goal | null> => {
    const response = await fetch(`${API_BASE}/create-goal`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    if (!response.ok) return null;
    const data = await response.json();
    window.dispatchEvent(new Event('goalsUpdated'));
    return data;
  },

  getGoals: async (userId: string): Promise<Goal[]> => {
    const response = await fetch(`${API_BASE}/goals?user_id=${userId}`);
    if (!response.ok) return [];
    return await response.json();
  },

  getInsights: async (userId: string): Promise<Insight[]> => {
    const response = await fetch(`${API_BASE}/insights?user_id=${userId}`);
    if (!response.ok) return [];
    return await response.json();
  },

  // Simulation
  simulateDecision: async (userId: string, amount: number, description: string): Promise<any> => {
    const response = await fetch(`${API_BASE}/simulate-decision`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, amount, description }),
    });
    if (!response.ok) return null;
    return await response.json();
  }
};
