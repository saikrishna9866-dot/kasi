import { useState, useEffect, ReactNode } from 'react';
import { motion } from 'motion/react';
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
  BarChart2
} from 'lucide-react';
import { cn } from './lib/utils';
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

// Mock Data
const EXPENSE_DATA = [
  { name: 'Food', value: 400, color: '#3b82f6' },
  { name: 'Travel', value: 300, color: '#8b5cf6' },
  { name: 'Bills', value: 300, color: '#ec4899' },
  { name: 'Shopping', value: 200, color: '#10b981' },
];

const MONTHLY_DATA = [
  { name: 'Jan', spend: 1200 },
  { name: 'Feb', spend: 900 },
  { name: 'Mar', spend: 1500 },
  { name: 'Apr', spend: 1100 },
  { name: 'May', spend: 1300 },
  { name: 'Jun', spend: 1000 },
];

const SAVINGS_DATA = [
  { name: 'Jan', amount: 5000 },
  { name: 'Feb', amount: 5500 },
  { name: 'Mar', amount: 5200 },
  { name: 'Apr', amount: 6000 },
  { name: 'May', amount: 6800 },
  { name: 'Jun', amount: 7500 },
];

const TIPS = [
  "Automate your savings to build wealth effortlessly.",
  "Track every expense to find hidden leaks in your budget.",
  "Aim to save at least 20% of your income each month.",
  "Invest early to take advantage of compound interest.",
  "Review your subscriptions monthly and cancel unused ones."
];

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTipIndex, setActiveTipIndex] = useState(0);

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
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/10 text-primary font-medium transition-colors">
            <Home className="w-5 h-5" />
            Home
          </a>
          <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground font-medium transition-colors">
            <BarChart2 className="w-5 h-5" />
            Statistics
          </a>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="sticky top-0 z-40 glass-card rounded-none border-x-0 border-t-0 px-6 py-4 flex-shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 md:hidden">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/30">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-display leading-tight">Money Map</h1>
              </div>
            </div>
            
            <div className="hidden md:block">
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
              <a href="#" className="flex items-center gap-3 text-sm font-medium p-3 bg-primary/10 text-primary rounded-xl">
                <Home className="w-5 h-5" />
                Home
              </a>
              <a href="#" className="flex items-center gap-3 text-sm font-medium p-3 hover:bg-muted rounded-xl text-muted-foreground">
                <BarChart2 className="w-5 h-5" />
                Statistics
              </a>
            </nav>
          </motion.div>
        )}

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-16 pb-12">
        
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
            amount="₹42,500" 
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
            title="Investments" 
            amount="₹3,50,000" 
            trend="+18% this year" 
            trendUp={true}
            icon={<LineChart className="w-6 h-6 text-blue-500" />}
            delay={0.7}
          />
        </section>

        {/* AI Insights */}
        <section>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-8 bg-gradient-to-br from-primary/5 to-purple-500/5 border-primary/20"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-display">AI Insights</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <InsightCard text="You are spending 35% of your income on food and dining." type="warning" />
              <InsightCard text="Your savings decreased by 2% compared to last month." type="danger" />
              <InsightCard text="You can save ₹5000 by reducing unnecessary subscriptions." type="success" />
            </div>
          </motion.div>
        </section>

        {/* Analytics Dashboard */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold font-display">Analytics Dashboard</h3>
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
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={EXPENSE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {EXPENSE_DATA.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {EXPENSE_DATA.map(item => (
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
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MONTHLY_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-muted/50" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} />
                    <Tooltip 
                      cursor={{ fill: 'currentColor', opacity: 0.05 }}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="spend" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
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
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={SAVINGS_DATA} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-muted/50" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: 'var(--background)' }} activeDot={{ r: 6 }} />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

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
            />
            <ActionCard 
              title="Upload Bills" 
              description="AI OCR-based extraction"
              icon={<ScanLine className="w-6 h-6" />}
              color="bg-purple-500"
            />
            <ActionCard 
              title="Add Manual Expense" 
              description="Quick entry form"
              icon={<Plus className="w-6 h-6" />}
              color="bg-emerald-500"
            />
          </div>
        </section>

        {/* Tips Carousel */}
        <section className="pb-12">
          <div className="glass-card p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-purple-500 to-emerald-500" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-6">Smart Money Advice</h3>
            <div className="min-h-[60px] flex items-center justify-center">
              <motion.p 
                key={activeTipIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-xl md:text-2xl font-medium font-display"
              >
                "{TIPS[activeTipIndex]}"
              </motion.p>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {TIPS.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveTipIndex(idx)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all",
                    idx === activeTipIndex ? "bg-primary w-6" : "bg-muted-foreground/30"
                  )}
                  aria-label={`Go to tip ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
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

function ActionCard({ title, description, icon, color }: { title: string, description: string, icon: ReactNode, color: string }) {
  return (
    <motion.button 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card p-6 flex items-center gap-4 text-left hover:bg-muted/30 transition-colors group"
    >
      <div className={cn("p-4 rounded-2xl text-white shadow-lg", color)}>
        {icon}
      </div>
      <div>
        <h4 className="font-semibold group-hover:text-primary transition-colors">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.button>
  );
}
