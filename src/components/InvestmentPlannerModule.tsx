import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PiggyBank, 
  TrendingUp, 
  Target, 
  Wallet, 
  ArrowRight, 
  Info, 
  ChevronRight, 
  Sparkles,
  LineChart as LineChartIcon,
  X,
  IndianRupee,
  Check
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { cn } from '../lib/utils';

interface InvestmentPlannerModuleProps {
  onClose: () => void;
}

const RISK_LEVELS = [
  { id: 'low', name: 'Low', color: 'text-emerald-500', bg: 'bg-emerald-500/10', return: 0.07 },
  { id: 'medium', name: 'Medium', color: 'text-blue-500', bg: 'bg-blue-500/10', return: 0.12 },
  { id: 'high', name: 'High', color: 'text-purple-500', bg: 'bg-purple-500/10', return: 0.18 },
];

const INVESTMENT_TYPES = [
  { id: 'sip', name: 'SIP (Mutual Funds)', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'stocks', name: 'Stocks', icon: <TrendingUp className="w-4 h-4" /> },
  { id: 'fd', name: 'Fixed Deposits', icon: <PiggyBank className="w-4 h-4" /> },
  { id: 'gold', name: 'Gold', icon: <TrendingUp className="w-4 h-4" /> },
];

const GOAL_TYPES = [
  { id: 'bike', name: 'Bike', icon: '🏍️' },
  { id: 'house', name: 'House', icon: '🏠' },
  { id: 'emergency', name: 'Emergency Fund', icon: '🛡️' },
  { id: 'vacation', name: 'Vacation', icon: '✈️' },
  { id: 'other', name: 'Other', icon: '🎯' },
];

export default function InvestmentPlannerModule({ onClose }: InvestmentPlannerModuleProps) {
  const [income, setIncome] = useState(75000);
  const [savings, setSavings] = useState(125000);
  const [expenses, setExpenses] = useState(35000);
  const [riskLevel, setRiskLevel] = useState('medium');
  const [investmentType, setInvestmentType] = useState('sip');
  const [goalType, setGoalType] = useState('house');
  const [customGoalName, setCustomGoalName] = useState('');
  const [targetAmount, setTargetAmount] = useState(5000000);
  const [duration, setDuration] = useState(10); // years

  const currentRisk = RISK_LEVELS.find(r => r.id === riskLevel) || RISK_LEVELS[1];
  
  const calculation = useMemo(() => {
    const monthlySavings = income - expenses;
    const annualReturn = currentRisk.return;
    const monthlyReturn = annualReturn / 12;
    const totalMonths = duration * 12;

    // Future Value of current savings
    const fvSavings = savings * Math.pow(1 + annualReturn, duration);

    // Required monthly investment to reach target
    const remainingTarget = targetAmount - fvSavings;
    let suggestedMonthly = 0;
    
    if (remainingTarget > 0) {
      suggestedMonthly = remainingTarget * (monthlyReturn / (Math.pow(1 + monthlyReturn, totalMonths) - 1));
    }

    // Generate chart data
    const chartData = [];
    for (let i = 0; i <= duration; i++) {
      const yearSavings = savings * Math.pow(1 + annualReturn, i);
      const yearInvestment = suggestedMonthly * ((Math.pow(1 + monthlyReturn, i * 12) - 1) / monthlyReturn);
      chartData.push({
        year: `Year ${i}`,
        amount: Math.round(yearSavings + yearInvestment),
        target: targetAmount
      });
    }

    return {
      monthlySavings,
      suggestedMonthly: Math.round(suggestedMonthly),
      chartData,
      isFeasible: suggestedMonthly <= monthlySavings,
      gap: Math.round(suggestedMonthly - monthlySavings)
    };
  }, [income, savings, expenses, riskLevel, targetAmount, duration]);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <div className="bg-background w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Future Investment Planner</h2>
              <p className="text-xs text-muted-foreground">Goal-Based Financial Planning Engine</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col lg:flex-row">
          {/* Left: Inputs */}
          <div className="w-full lg:w-1/3 p-8 border-b lg:border-b-0 lg:border-r border-border/50 space-y-8">
            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Financial Snapshot
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Monthly Income (₹)</label>
                  <input 
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Monthly Expenses (₹)</label>
                  <input 
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Current Savings (₹)</label>
                  <input 
                    type="number"
                    value={savings}
                    onChange={(e) => setSavings(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Financial Goal
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {GOAL_TYPES.map(goal => (
                    <button
                      key={goal.id}
                      onClick={() => setGoalType(goal.id)}
                      className={cn(
                        "p-3 rounded-xl border transition-all flex flex-col items-center gap-1",
                        goalType === goal.id ? "bg-primary/10 border-primary text-primary" : "bg-muted/50 border-border hover:border-primary/30"
                      )}
                    >
                      <span className="text-xl">{goal.icon}</span>
                      <span className="text-[10px] font-bold uppercase">{goal.name}</span>
                    </button>
                  ))}
                </div>

                <AnimatePresence>
                  {goalType === 'other' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <label className="text-xs font-medium mb-1.5 block">Custom Goal Name</label>
                      <input 
                        type="text"
                        value={customGoalName}
                        onChange={(e) => setCustomGoalName(e.target.value)}
                        placeholder="Others"
                        className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none transition-all"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="text-xs font-medium mb-1.5 block">Target Amount (₹)</label>
                  <input 
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block">Time Duration ({duration} years)</label>
                  <input 
                    type="range"
                    min="1"
                    max="30"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Risk Profile
              </h3>
              <div className="flex gap-2">
                {RISK_LEVELS.map(risk => (
                  <button
                    key={risk.id}
                    onClick={() => setRiskLevel(risk.id)}
                    className={cn(
                      "flex-1 py-3 rounded-xl border transition-all font-bold text-sm",
                      riskLevel === risk.id ? cn(risk.bg, risk.color, "border-current") : "bg-muted/50 border-border hover:border-primary/30"
                    )}
                  >
                    {risk.name}
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Insights & Chart */}
          <div className="flex-1 p-8 bg-muted/10 space-y-8 overflow-y-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div 
                key={calculation.suggestedMonthly}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-3xl bg-background border border-border shadow-xl shadow-primary/5"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h4 className="font-bold">Suggested Investment</h4>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-primary">₹{calculation.suggestedMonthly.toLocaleString()}</span>
                  <span className="text-muted-foreground font-medium">/ month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-3">
                  Invest this amount monthly at {currentRisk.return * 100}% return to reach your goal.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn(
                  "p-6 rounded-3xl border shadow-xl",
                  calculation.isFeasible 
                    ? "bg-emerald-500/5 border-emerald-500/20" 
                    : "bg-amber-500/5 border-amber-500/20"
                )}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    calculation.isFeasible ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                  )}>
                    {calculation.isFeasible ? <Check className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                  </div>
                  <h4 className="font-bold">Feasibility Check</h4>
                </div>
                {calculation.isFeasible ? (
                  <>
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold text-lg">Goal is Achievable!</p>
                    <p className="text-sm text-muted-foreground mt-1">You have ₹{calculation.monthlySavings - calculation.suggestedMonthly} extra per month.</p>
                  </>
                ) : (
                  <>
                    <p className="text-amber-600 dark:text-amber-400 font-bold text-lg">Budget Gap Detected</p>
                    <p className="text-sm text-muted-foreground mt-1">You need ₹{calculation.gap} more monthly to reach this goal.</p>
                  </>
                )}
              </motion.div>
            </div>

            <div className="p-8 rounded-3xl bg-background border border-border shadow-xl">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h4 className="font-bold text-lg flex items-center gap-2">
                    <LineChartIcon className="w-5 h-5 text-primary" />
                    Wealth Growth Projection
                  </h4>
                  <p className="text-sm text-muted-foreground">Estimated growth over {duration} years</p>
                </div>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    Projected Wealth
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-muted border border-dashed border-muted-foreground" />
                    Target Goal
                  </div>
                </div>
              </div>

              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={calculation.chartData}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                    <XAxis 
                      dataKey="year" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#888' }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 12, fill: '#888' }}
                      tickFormatter={(val) => `₹${(val / 100000).toFixed(1)}L`}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                      formatter={(val: number) => [`₹${val.toLocaleString()}`, 'Amount']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#3b82f6" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorAmount)" 
                      animationDuration={1500}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke="#888" 
                      strokeDasharray="5 5" 
                      dot={false} 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-primary/5 border border-primary/10">
                <h5 className="text-xs font-bold uppercase text-primary mb-2">Smart Suggestion</h5>
                <p className="text-sm font-medium">Reduce expenses by 10% to reach your goal {Math.round(duration * 0.1)} years earlier.</p>
              </div>
              <div className="p-5 rounded-2xl bg-purple-500/5 border border-purple-500/10">
                <h5 className="text-xs font-bold uppercase text-purple-500 mb-2">Investment Tip</h5>
                <p className="text-sm font-medium">Diversify into {investmentType.toUpperCase()} for better risk-adjusted returns.</p>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <h5 className="text-xs font-bold uppercase text-emerald-500 mb-2">Milestone</h5>
                <p className="text-sm font-medium">You'll reach your first ₹10L in just {Math.round(duration * 0.3)} years!</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-border/50 flex justify-end gap-4 bg-muted/30">
          <button onClick={onClose} className="px-8 py-3 rounded-xl font-bold text-muted-foreground hover:bg-muted transition-all">
            Close Planner
          </button>
          <button className="px-8 py-3 rounded-xl bg-primary text-white font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center gap-2">
            Save Plan <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
