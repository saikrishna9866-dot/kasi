import { useState, useEffect, ReactNode, useRef, ChangeEvent, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { databaseService, Transaction, Goal, Insight } from './services/databaseService';
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Upload, 
  Plus, 
  Wallet, 
  PiggyBank, 
  LineChart, 
  Sparkles,
  FileText,
  ScanLine,
  Bell,
  Moon,
  Sun,
  Menu,
  X,
  Search,
  Home,
  BarChart2,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeft,
  Filter,
  Download,
  CheckCircle2,
  AlertCircle,
  Mic,
  MicOff,
  Send,
  Loader2,
  Globe,
  ShoppingBag,
  Utensils,
  Plane,
  Check,
  Zap,
  RefreshCcw,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import { cn } from './lib/utils';
import BillUploadModule from './components/BillUploadModule';
import InvestmentPlannerModule from './components/InvestmentPlannerModule';
import DecisionEngineModule from './components/DecisionEngineModule';
import { 
  PieChart as RechartsPieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart as RechartsLineChart,
  Line
} from 'recharts';

// Interfaces removed, imported from databaseService

// Mock Data
const EXPENSE_DATA = [
  { name: 'Food', value: 400, color: '#3b82f6' },
  { name: 'Travel', value: 300, color: '#8b5cf6' },
  { name: 'Bills', value: 300, color: '#ec4899' },
  { name: 'Shopping', value: 200, color: '#10b981' },
];

// Mock data removed
const TIPS = [
  "Automate your savings to build wealth effortlessly.",
  "Track every expense to find hidden leaks in your budget.",
  "Aim to save at least 20% of your income each month.",
  "Invest early to take advantage of compound interest.",
  "Review your subscriptions monthly and cancel unused ones."
];

const SUBSCRIPTIONS: any[] = [];

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTipIndex, setActiveTipIndex] = useState(0);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);

  const expenseChartData = useMemo(() => {
    if (!analytics?.categoryBreakdown) return [];
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444'];
    return Object.entries(analytics.categoryBreakdown).map(([name, value], idx) => ({
      name,
      value,
      color: colors[idx % colors.length]
    }));
  }, [analytics]);

  const monthlyChartData = useMemo(() => {
    if (!analytics?.monthlySpending) return [];
    return Object.entries(analytics.monthlySpending).map(([name, spend]) => ({
      name,
      spend
    })).sort((a, b) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(a.name) - months.indexOf(b.name);
    });
  }, [analytics]);
  const [activeAction, setActiveAction] = useState<'bill' | 'investment' | 'smart' | null>(null);
  const [greeting, setGreeting] = useState('');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['home']);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activePage = navigationHistory[navigationHistory.length - 1];

  const navigateTo = (page: string) => {
    if (page === activePage) return;
    setNavigationHistory(prev => [...prev, page]);
    setIsMobileMenuOpen(false);
  };

  const goBack = () => {
    if (navigationHistory.length > 1) {
      setNavigationHistory(prev => prev.slice(0, -1));
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const userId = 'current-user-id';
      const [txs, gls, anlytcs, ins] = await Promise.all([
        databaseService.getTransactions(userId),
        databaseService.getGoals(userId),
        databaseService.getAnalytics(userId),
        databaseService.getInsights ? databaseService.getInsights(userId) : Promise.resolve([])
      ]);
      
      setAllTransactions(txs);
      setGoals(gls);
      setAnalytics(anlytcs);
      setInsights(ins);
    };

    loadData();
    window.addEventListener('transactionsUpdated', loadData);
    window.addEventListener('goalsUpdated', loadData);
    return () => {
      window.removeEventListener('transactionsUpdated', loadData);
      window.removeEventListener('goalsUpdated', loadData);
    };
  }, []);

  const handleBankStatementUpload = () => {
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsLoading(true);
      const result = await databaseService.uploadStatement(file, 'current-user-id');
      if (result) {
        alert(`Successfully processed ${result.count} transactions.`);
        window.dispatchEvent(new Event('transactionsUpdated'));
      }
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTipIndex((prev) => (prev + 1) % TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-background text-foreground selection:bg-primary/20 overflow-hidden">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border/50 glass-card rounded-none z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display leading-tight">Money Map</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button 
            onClick={() => navigateTo('home')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
              activePage === 'home' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Home className="w-5 h-5" />
            Home
          </button>
          <button 
            onClick={() => navigateTo('statistics')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
              activePage === 'statistics' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <BarChart2 className="w-5 h-5" />
            Statistics
          </button>
          <button 
            onClick={() => navigateTo('goals')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors",
              activePage === 'goals' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground hover:text-foreground"
            )}
          >
            <Target className="w-5 h-5" />
            Goals
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <AnimatePresence>
          {activeAction === 'bill' && (
            <BillUploadModule 
              onClose={() => setActiveAction(null)} 
              onSave={() => {
                // The billsUpdated event will trigger loadTransactions
                setActiveAction(null);
              }} 
            />
          )}
          {activeAction === 'investment' && (
            <InvestmentPlannerModule onClose={() => setActiveAction(null)} />
          )}
          {activeAction === 'smart' && (
            <DecisionEngineModule onClose={() => setActiveAction(null)} />
          )}
        </AnimatePresence>
        {/* Header */}
        <header className="sticky top-0 z-40 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 md:hidden">
              {navigationHistory.length > 1 ? (
                <button 
                  onClick={goBack}
                  className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-foreground shadow-sm"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                  <Wallet className="w-6 h-6" />
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold font-display leading-tight">Money Map</h1>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              {navigationHistory.length > 1 && (
                <button 
                  onClick={goBack}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-all group"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="text-sm font-medium">Back</span>
                </button>
              )}
              <p className="text-sm text-muted-foreground font-medium">Understand Your Money. Control Your Future.</p>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
                aria-label="Toggle Dark Mode"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
              <button className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-accent text-accent-foreground font-bold">
                JD
              </button>
              <button 
                className="md:hidden p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden absolute inset-x-0 top-[73px] z-40 glass-card rounded-none border-x-0 p-4"
          >
            <nav className="flex flex-col gap-2">
              <button 
                onClick={() => navigateTo('home')}
                className={cn(
                  "flex items-center gap-3 text-sm font-medium p-3 rounded-xl",
                  activePage === 'home' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                )}
              >
                <Home className="w-5 h-5" />
                Home
              </button>
              <button 
                onClick={() => navigateTo('statistics')}
                className={cn(
                  "flex items-center gap-3 text-sm font-medium p-3 rounded-xl",
                  activePage === 'statistics' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                )}
              >
                <BarChart2 className="w-5 h-5" />
                Statistics
              </button>
              <button 
                onClick={() => navigateTo('goals')}
                className={cn(
                  "flex items-center gap-3 text-sm font-medium p-3 rounded-xl",
                  activePage === 'goals' ? "bg-primary/10 text-primary" : "hover:bg-muted text-muted-foreground"
                )}
              >
                <Target className="w-5 h-5" />
                Goals
              </button>
              {navigationHistory.length > 1 && (
                <button 
                  onClick={goBack}
                  className="flex items-center gap-3 text-sm font-medium p-3 hover:bg-muted rounded-xl text-rose-500"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back to Previous
                </button>
              )}
            </nav>
          </motion.div>
        )}

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-16 pb-12">
            <AnimatePresence mode="wait">
              {activePage === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-16"
                >
                  {/* Hero Section */}
                  <section className="text-center max-w-3xl mx-auto space-y-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent text-accent-foreground text-sm font-medium mb-4"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>AI-Powered Financial Intelligence</span>
                    </motion.div>
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.1 }}
                      className="text-5xl md:text-6xl font-bold font-display tracking-tight text-balance"
                    >
                      Track. Analyze. <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-500">Grow Your Finances.</span>
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-lg text-muted-foreground"
                    >
                      AI-powered insights for smarter financial decisions. Take control of your wealth today.
                    </motion.p>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="w-full max-w-2xl mx-auto pt-6"
                    >
                      <div className="relative flex items-center w-full h-14 rounded-2xl glass-card overflow-hidden shadow-lg shadow-black/5 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                        <div className="pl-6 pr-4 text-muted-foreground">
                          <Search className="w-5 h-5" />
                        </div>
                        <input 
                          type="text" 
                          placeholder="Ask anything about your finances..." 
                          className="w-full h-full bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground font-medium"
                        />
                        <button className="h-full px-8 bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                          Search
                        </button>
                      </div>

                      {/* Greeting and Quick Actions */}
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 space-y-8"
                      >
                        <div className="text-center">
                          <h3 className="text-2xl font-bold font-display">{greeting}, JD! 👋</h3>
                          <p className="text-muted-foreground mt-1">What would you like to do today?</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <QuickActionCard 
                            title="Upload Bill" 
                            icon={<Upload className="w-6 h-6" />}
                            onClick={() => setActiveAction('bill')}
                            color="bg-blue-500"
                          />
                          <QuickActionCard 
                            title="Future Investment" 
                            icon={<TrendingUp className="w-6 h-6" />}
                            onClick={() => setActiveAction('investment')}
                            color="bg-emerald-500"
                          />
                          <QuickActionCard 
                            title="Smart Decision" 
                            icon={<Sparkles className="w-6 h-6" />}
                            onClick={() => setActiveAction('smart')}
                            color="bg-purple-500"
                          />
                        </div>
                      </motion.div>
                    </motion.div>
                  </section>

                  {/* Budget Alert & Progress */}
                  <section>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      className="glass-card p-6 border-l-4 border-l-amber-500 relative overflow-hidden"
                    >
                      <div className="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                            <Bell className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Budget Alert</h3>
                            <p className="text-sm text-muted-foreground">You've used 85% of your monthly budget.</p>
                          </div>
                        </div>
                        <div className="w-full sm:w-1/3">
                          <div className="flex justify-between text-sm mb-2 font-medium">
                            <span>₹42,500 spent</span>
                            <span className="text-muted-foreground">₹50,000 limit</span>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '85%' }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </section>

                  {/* Financial Summary */}
                  <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SummaryCard 
                      title="Total Expenses" 
                      amount={`₹${analytics?.totalExpenses?.toLocaleString() || '0'}`} 
                      trend="+12% this month" 
                      trendUp={false}
                      icon={<Wallet className="w-6 h-6 text-rose-500" />}
                      delay={0.5}
                    />
                    <SummaryCard 
                      title="Total Savings" 
                      amount="₹1,25,000" 
                      trend="+5% this month" 
                      trendUp={true}
                      icon={<PiggyBank className="w-6 h-6 text-emerald-500" />}
                      delay={0.6}
                    />
                    <SummaryCard 
                      title="Transactions" 
                      amount={analytics?.transactionCount?.toString() || '0'} 
                      trend="+18% this year" 
                      trendUp={true}
                      icon={<LineChart className="w-6 h-6 text-blue-500" />}
                      delay={0.7}
                    />
                  </section>

                  {/* AI Insights & Smart Alerts */}
                  <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="glass-card p-8 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 text-primary rounded-lg">
                            <Sparkles className="w-6 h-6" />
                          </div>
                          <h3 className="text-2xl font-bold font-display">AI Intelligence</h3>
                        </div>
                        <button className="text-sm font-medium text-primary hover:underline">View All</button>
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                        {insights.map((insight, idx) => (
                          <AdvancedInsightCard key={insight.id} insight={insight} delay={idx * 0.1} />
                        ))}
                        {insights.length === 0 && (
                          <p className="text-center text-sm text-muted-foreground py-8">No AI insights available yet. Keep tracking your expenses!</p>
                        )}
                      </div>
                    </motion.div>

                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="glass-card p-8 bg-muted/30"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg">
                            <Bell className="w-6 h-6" />
                          </div>
                          <h3 className="text-2xl font-bold font-display">Smart Alerts</h3>
                        </div>
                        <button className="text-sm font-medium text-muted-foreground hover:text-foreground">Clear All</button>
                      </div>
                      <div className="space-y-4">
                        {insights.map((insight, idx) => (
                          <motion.div 
                            key={insight.id}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                              "p-4 rounded-2xl border flex gap-4 items-start",
                              insight.type === 'warning' ? "bg-amber-500/5 border-amber-500/10" : "bg-blue-500/5 border-blue-500/10"
                            )}
                          >
                            <div className={cn(
                              "p-2 rounded-xl",
                              insight.type === 'warning' ? "bg-amber-500/10 text-amber-500" : "bg-blue-500/10 text-blue-500"
                            )}>
                              {insight.type === 'warning' ? <AlertCircle className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm">{insight.type === 'warning' ? 'Financial Warning' : 'Smart Suggestion'}</h4>
                              <p className="text-xs text-muted-foreground mt-1">{insight.message}</p>
                            </div>
                          </motion.div>
                        ))}
                        {insights.length === 0 && (
                          <p className="text-center text-sm text-muted-foreground py-8">No insights yet. Add some transactions to get started!</p>
                        )}
                      </div>
                    </motion.div>
                  </section>

                  {/* Transaction History & Subscriptions */}
                  <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-2xl font-bold font-display">Recent Transactions</h3>
                        <div className="relative w-full sm:w-64">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <input 
                            type="text" 
                            placeholder="Search transactions..." 
                            className="w-full pl-10 pr-4 py-2 rounded-xl glass-card text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-border/50 bg-muted/30">
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Merchant</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Amount</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allTransactions
                                .filter(t => t.merchant.toLowerCase().includes(searchQuery.toLowerCase()) || t.category.toLowerCase().includes(searchQuery.toLowerCase()))
                                .slice(0, 8)
                                .map((t, idx) => (
                                <motion.tr 
                                  key={t.id}
                                  initial={{ opacity: 0, y: 10 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  transition={{ delay: idx * 0.05 }}
                                  className="border-b border-border/50 hover:bg-muted/30 transition-colors group cursor-pointer"
                                >
                                  <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                        <ShoppingBag className="w-4 h-4" />
                                      </div>
                                      <span className="font-semibold text-sm">{t.merchant}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className="px-2.5 py-1 rounded-full bg-muted text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                      {t.category}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-sm text-muted-foreground">
                                    {new Date(t.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </td>
                                  <td className={cn(
                                    "px-6 py-4 text-sm font-bold text-right",
                                    t.amount > 0 ? "text-emerald-500" : "text-foreground"
                                  )}>
                                    {t.amount > 0 ? '+' : ''}₹{Math.abs(t.amount).toLocaleString()}
                                  </td>
                                </motion.tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold font-display">Subscriptions</h3>
                      <div className="glass-card p-6 space-y-4">
                        {SUBSCRIPTIONS.map((sub, idx) => (
                          <motion.div 
                            key={sub.id}
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-all group"
                          >
                            <div className="flex items-center gap-3">
                              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg", sub.color)}>
                                {sub.icon}
                              </div>
                              <div>
                                <h4 className="font-bold text-sm">{sub.name}</h4>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Next: {sub.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-sm">₹{sub.amount}</p>
                              <p className="text-[10px] text-emerald-500 font-bold uppercase">Active</p>
                            </div>
                          </motion.div>
                        ))}
                        <button className="w-full py-4 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary">
                          <Plus className="w-4 h-4" /> Add Subscription
                        </button>
                      </div>

                      <div className="glass-card p-6 bg-primary text-white overflow-hidden relative group">
                        <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="font-bold text-lg mb-2">Upgrade to Pro</h4>
                        <p className="text-xs text-white/80 mb-4">Get advanced AI simulations and unlimited bill uploads.</p>
                        <button className="w-full py-3 rounded-xl bg-white text-primary font-bold text-sm shadow-xl shadow-black/10 hover:bg-white/90 transition-all">
                          Get Started
                        </button>
                      </div>
                    </div>
                  </section>

                  {/* Data Input */}
                  <section className="space-y-6">
                    <h3 className="text-2xl font-bold font-display">Add Data</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <ActionCard 
                        title="Upload Bank Statement" 
                        description="PDF or CSV format"
                        icon={<FileText className="w-6 h-6" />}
                        color="bg-blue-500"
                        onClick={handleBankStatementUpload}
                      />
                      <ActionCard 
                        title="Upload Bills" 
                        description="AI OCR-based extraction"
                        icon={<ScanLine className="w-6 h-6" />}
                        color="bg-purple-500"
                        onClick={() => setActiveAction('bill')}
                      />
                    </div>
                  </section>
                </motion.div>
              )}

              {activePage === 'statistics' && (
                <motion.div
                  key="statistics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-16"
                >
                  {/* Analytics Dashboard */}
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold font-display">Analytics Dashboard</h3>
                      <div className="flex items-center gap-2">
                        <button className="p-2 rounded-lg glass-card hover:bg-muted transition-colors">
                          <Filter className="w-4 h-4" />
                        </button>
                        <button className="p-2 rounded-lg glass-card hover:bg-muted transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Pie Chart */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="glass-card p-6 flex flex-col"
                      >
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-muted-foreground" />
                          Expenses by Category
                        </h4>
                        <div className="flex-1 min-h-[250px]">
                          {isLoading ? <SkeletonLoader height="250px" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsPieChart>
                                <Pie
                                  data={expenseChartData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={80}
                                  paddingAngle={5}
                                  dataKey="value"
                                  animationBegin={0}
                                  animationDuration={1500}
                                >
                                  {expenseChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip 
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          {expenseChartData.map(item => (
                            <div key={item.name} className="flex items-center gap-2 text-sm">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                              <span className="text-muted-foreground">{item.name}</span>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Bar Chart */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6 lg:col-span-2 flex flex-col"
                      >
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-muted-foreground" />
                          Monthly Spending
                        </h4>
                        <div className="flex-1 min-h-[250px]">
                          {isLoading ? <SkeletonLoader height="250px" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-muted/50" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} />
                                <Tooltip 
                                  cursor={{ fill: 'currentColor', opacity: 0.05 }}
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="spend" fill="#3b82f6" radius={[4, 4, 0, 0]} animationDuration={1500} />
                              </BarChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </motion.div>

                      {/* Line Chart */}
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6 lg:col-span-3 flex flex-col"
                      >
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-muted-foreground" />
                          Savings Trend
                        </h4>
                        <div className="flex-1 min-h-[300px]">
                          {isLoading ? <SkeletonLoader height="300px" /> : (
                            <ResponsiveContainer width="100%" height="100%">
                              <RechartsLineChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-muted/50" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} />
                                <Tooltip 
                                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: 'var(--background)' }} activeDot={{ r: 6 }} animationDuration={2000} />
                              </RechartsLineChart>
                            </ResponsiveContainer>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  </section>

                  {/* Transaction History */}
                  <section className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <h3 className="text-2xl font-bold font-display">Recent Transactions</h3>
                      <div className="relative w-full sm:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input 
                          type="text" 
                          placeholder="Search transactions..." 
                          className="w-full pl-10 pr-4 py-2 rounded-xl glass-card text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="glass-card overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-border/50 bg-muted/30">
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Merchant</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Category</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Date</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Amount</th>
                              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/50">
                            {allTransactions.filter(t => t.merchant.toLowerCase().includes(searchQuery.toLowerCase())).map((t) => (
                              <tr key={t.id} className="hover:bg-muted/20 transition-colors group">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className={cn(
                                      "w-8 h-8 rounded-lg flex items-center justify-center",
                                      t.amount < 0 ? "bg-rose-500/10 text-rose-500" : "bg-emerald-500/10 text-emerald-500"
                                    )}>
                                      {t.amount < 0 ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                                    </div>
                                    <span className="font-medium">{t.merchant}</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="px-2 py-1 rounded-md bg-muted text-xs font-medium">{t.category}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-muted-foreground">{t.date}</td>
                                <td className={cn(
                                  "px-6 py-4 font-bold",
                                  t.amount < 0 ? "text-rose-500" : "text-emerald-500"
                                )}>
                                  {t.amount < 0 ? '-' : '+'}₹{Math.abs(t.amount).toLocaleString()}
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-500">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    {t.status}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm text-muted-foreground">
                        <span>Showing {allTransactions.length} transactions</span>
                        <div className="flex items-center gap-2">
                          <button className="px-3 py-1 rounded-md glass-card hover:bg-muted disabled:opacity-50" disabled>Prev</button>
                          <button className="px-3 py-1 rounded-md glass-card hover:bg-muted">Next</button>
                        </div>
                      </div>
                    </div>
                  </section>
                </motion.div>
              )}

              {activePage === 'goals' && (
                <motion.div
                  key="goals"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-16"
                >
                  {/* Goal Tracking */}
                  <section className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold font-display">Financial Goals</h3>
                      <button className="text-sm font-medium text-primary flex items-center gap-1 hover:underline">
                        <Plus className="w-4 h-4" /> Add New Goal
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {goals.map((goal, idx) => (
                        <GoalCard 
                          key={goal.id} 
                          goal={{
                            id: parseInt(goal.id) || idx,
                            name: goal.title,
                            target: goal.target_amount,
                            current: goal.current_amount,
                            deadline: goal.deadline,
                            color: ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500'][idx % 4]
                          }} 
                          delay={idx * 0.1} 
                        />
                      ))}
                      {goals.length === 0 && (
                        <div className="col-span-full p-12 text-center glass-card">
                          <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                          <p className="text-muted-foreground">No goals set yet. Start planning your future!</p>
                        </div>
                      )}
                    </div>
                  </section>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Floating Chat Assistant */}
        <div className="fixed bottom-6 right-6 z-[60]">
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsChatOpen(!isChatOpen)}
            className="w-14 h-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-colors"
          >
            {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
          </motion.button>

          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="absolute bottom-20 right-0 w-[350px] h-[500px] glass-card flex flex-col overflow-hidden shadow-2xl border-primary/20"
            >
              <div className="p-4 bg-primary text-white flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Money Map AI</h4>
                  <p className="text-[10px] opacity-80">Always active to help you</p>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-muted text-sm">
                    Hello! I'm your AI financial assistant. How can I help you today?
                  </div>
                </div>
                <div className="flex items-start gap-2 flex-row-reverse">
                  <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center text-accent-foreground flex-shrink-0 text-[10px] font-bold">
                    JD
                  </div>
                  <div className="p-3 rounded-2xl rounded-tr-none bg-primary text-white text-sm">
                    How much did I spend on food this month?
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <Sparkles className="w-3 h-3" />
                  </div>
                  <div className="p-3 rounded-2xl rounded-tl-none bg-muted text-sm">
                    You've spent ₹14,750 on food so far. This is 12% higher than your average. Would you like to see a breakdown?
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-muted/50 border border-border/50">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="flex-1 bg-transparent outline-none text-sm px-2"
                  />
                  <button className="p-2 rounded-lg bg-primary text-white">
                    <Plus className="w-4 h-4 rotate-45" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, amount, trend, trendUp, icon, delay }: { title: string, amount: string, trend: string, trendUp: boolean, icon: ReactNode, delay: number }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className="glass-card p-6 flex flex-col gap-4 hover:-translate-y-1 transition-transform duration-300"
    >
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-xl bg-background/50 shadow-sm border border-border/50">
          {icon}
        </div>
        <div className={cn(
          "px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1",
          trendUp ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
        )}>
          {trendUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-sm text-muted-foreground font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold font-display">{amount}</h3>
      </div>
    </motion.div>
  );
}

function InsightCard({ text, type }: { text: string, type: 'warning' | 'danger' | 'success' }) {
  const styles = {
    warning: "bg-amber-500/10 border-amber-500/20 text-amber-700 dark:text-amber-400",
    danger: "bg-rose-500/10 border-rose-500/20 text-rose-700 dark:text-rose-400",
    success: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
  };

  return (
    <div className={cn("p-4 rounded-xl border text-sm font-medium", styles[type])}>
      {text}
    </div>
  );
}

function AdvancedInsightCard({ insight, delay }: { insight: Insight, delay: number, key?: any }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const borderStyles: any = {
    warning: "border-amber-500/20 bg-amber-500/5",
    suggestion: "border-emerald-500/20 bg-emerald-500/5"
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={cn("p-4 rounded-xl border transition-all", borderStyles[insight.type])}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={cn("mt-1 p-1.5 rounded-lg", insight.type === 'warning' ? 'bg-amber-500/20 text-amber-500' : 'bg-emerald-500/20 text-emerald-500')}>
            {insight.type === 'warning' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn("text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded", insight.type === 'warning' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white')}>
                {insight.type === 'warning' ? 'Warning' : 'Suggestion'}
              </span>
              <p className="text-sm font-semibold">{insight.message}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GoalCard({ goal, delay }: { goal: any, delay: number, key?: any }) {
  const progress = (goal.current / goal.target) * 100;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className="glass-card p-6 space-y-4 hover:shadow-2xl transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="p-2 rounded-lg bg-muted group-hover:bg-primary/10 transition-colors">
          <Target className="w-5 h-5 group-hover:text-primary transition-colors" />
        </div>
        <span className="text-xs font-medium text-muted-foreground">Due {goal.deadline}</span>
      </div>
      <div>
        <h4 className="font-bold mb-1">{goal.name}</h4>
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold">₹{goal.current.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">of ₹{goal.target.toLocaleString()}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: delay + 0.5 }}
            className={cn("h-full rounded-full", goal.color)}
          />
        </div>
        <p className="text-right text-[10px] font-bold text-muted-foreground uppercase">{Math.round(progress)}% Complete</p>
      </div>
    </motion.div>
  );
}

function SkeletonLoader({ height }: { height: string }) {
  return (
    <div 
      className="w-full bg-muted/50 rounded-xl animate-pulse" 
      style={{ height }}
    />
  );
}

function ActionCard({ title, description, icon, color, onClick }: { title: string, description: string, icon: ReactNode, color: string, onClick?: () => void }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card p-6 text-left group transition-all hover:shadow-xl border-border/50"
    >
      <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white mb-4 shadow-lg", color)}>
        {icon}
      </div>
      <h4 className="text-lg font-bold mb-1 group-hover:text-primary transition-colors">{title}</h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.button>
  );
}

function QuickActionCard({ title, icon, onClick, color }: { title: string, icon: ReactNode, onClick: () => void, color: string }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.05, y: -5 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="glass-card p-6 flex flex-col items-center justify-center gap-3 text-center group transition-all hover:shadow-xl border-border/50"
    >
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg", color)}>
        {icon}
      </div>
      <h4 className="font-bold group-hover:text-primary transition-colors">{title}</h4>
    </motion.button>
  );
}

function Modal({ children, onClose, title }: { children: ReactNode, onClose: () => void, title: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="glass-card w-full max-w-lg overflow-hidden shadow-2xl border-primary/20"
      >
        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/30">
          <h3 className="text-xl font-bold font-display">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}
